"use client";

import { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import { ArrowLeft, ShoppingBag, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./checkout.css";

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<"fill_details" | "upi_payment">("fill_details");
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "verifying" | "success" | "failed">("pending");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });

  // Pre-fill user data if they are logged in
  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
        if (data) {
          setFormData({
            name: data.full_name || user.user_metadata?.full_name || "",
            phone: data.phone || "",
            address: data.address || "",
          });
        }
      });
    }
  }, [user]);

  const isFreeDelivery = cartTotal >= 300;
  const deliveryFee = isFreeDelivery ? 0 : 40;
  const finalTotal = cartTotal + deliveryFee;

  // Direct UPI Deep Link parameters
  const upiId = "georgygeo2004@oksbi";
  const amount = Math.round(finalTotal);
  const upiParams = `pa=${upiId}&pn=FreshVeg&cu=INR&am=${amount}`;
  const anyUpiLink = `upi://pay?${upiParams}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(anyUpiLink)}`;

  // Specific App Links
  const gpayLink = `gpay://upi/pay?${upiParams}`;
  const phonepeLink = `phonepe://pay?${upiParams}`;
  const paytmLink = `paytmmp://pay?${upiParams}`;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckoutCOD = () => {
    // 1. Save to Database for order history async
    if (user) {
      supabase.from('orders').insert({
        user_id: user.id,
        total: amount,
        payment_method: "COD",
        items: items,
        delivery_address: formData.address,
        phone: formData.phone,
        status: 'pending'
      }).then(({ error }) => {
        if (error) console.error("Error creating order in Supabase:", error);
      });
    }

    // 2. Build WhatsApp String for COD
    let message = `*New Order from ${formData.name}*\n`;
    message += `Phone: ${formData.phone}\n`;
    message += `Address: ${formData.address}\n\n`;
    message += `*Order Details:*\n`;

    items.forEach((item, index) => {
      message += `${index + 1}. ${item.name} (${item.packSize}) x ${item.quantity} = ₹${Math.round(item.price * item.quantity)}\n`;
    });

    message += `\n*Subtotal:* ₹${Math.round(cartTotal)}`;
    message += `\n*Delivery:* ${isFreeDelivery ? "Free" : `₹${deliveryFee}`}`;
    message += `\n*Total Amount:* ₹${amount}\n`;
    message += `\n*Payment Method:* Cash on Delivery\n\n`;
    message += `Please confirm my order. Thank you!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = "918078803752"; 
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
    
    clearCart();
    router.push("/");
  };

  const handleStartUPI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) {
      alert("Please fill all delivery details first.");
      return;
    }
    if (items.length === 0) return;
    
    setStep("upi_payment");
    setPaymentStatus("pending");
  };

  const handleCOD = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) {
      alert("Please fill all details");
      return;
    }
    handleCheckoutCOD();
  };

  const openApp = (link: string) => {
    window.location.href = link;
    // Set to verifying so when they return to the app, we ask if it succeeded
    setPaymentStatus("verifying");
  };

  const confirmSuccess = async () => {
    setPaymentStatus("success");
    
    // Process final fully digital order
    if (user) {
      await supabase.from('orders').insert({
        user_id: user.id,
        total: amount,
        payment_method: "UPI",
        items: items,
        delivery_address: formData.address,
        phone: formData.phone,
        status: 'pending'
      });
    } else {
      await supabase.from('orders').insert({
        total: amount,
        payment_method: "UPI",
        items: items,
        delivery_address: formData.address,
        phone: formData.phone,
        status: 'pending'
      });
    }

    clearCart();
  };

  if (items.length === 0) {
    return (
      <div className="container section pt-header checkout-empty">
        <ShoppingBag size={64} className="text-muted mb-4 mx-auto" style={{ opacity: 0.5 }} />
        <h2 className="title text-center">Your Cart is Empty</h2>
        <p className="text-center text-muted mb-6">Looks like you haven't added any items yet.</p>
        <div className="flex-center">
          <Link href="/">
            <button className="btn btn-primary">
              <ArrowLeft size={18} className="mr-2" /> Back to Shop
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container section pt-header">
      <div className="checkout-layout">
        <div className="checkout-form-container glass-panel">
          {step === "fill_details" ? (
            <>
              <h2 className="title">Delivery Details</h2>
              <form className="checkout-form">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required placeholder="John Doe" />
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="10-digit mobile number" />
                </div>
                
                <div className="form-group">
                  <label htmlFor="address">Delivery Address</label>
                  <textarea id="address" name="address" value={formData.address} onChange={handleInputChange} required placeholder="House No, Street, Landmark" rows={4} />
                </div>

                <div className="checkout-actions" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" onClick={handleStartUPI} className="btn btn-primary online-btn" style={{ width: '100%', padding: '1rem' }}>
                    Pay via UPI (GPay / PhonePe / Paytm)
                  </button>
                  <button type="button" onClick={handleCOD} className="btn btn-outline whatsapp-btn" style={{ width: '100%', padding: '1.1rem' }}>
                    Cash on Delivery (WhatsApp)
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="upi-payment-view animate-fade-in" style={{ textAlign: 'center', padding: '1rem' }}>
              <h2 className="title" style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>Pay ₹{amount} securely</h2>
                
              {paymentStatus === "pending" && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxWidth: '300px', margin: '0 auto 2rem' }}>
                    <button onClick={() => openApp(gpayLink)} className="btn" style={{ background: '#ffffff', color: '#3c4043', border: '1px solid #dadce0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '12px' }}>
                      <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="GPay" style={{ height: '20px' }} />
                      Pay with Google Pay
                    </button>
                    <button onClick={() => openApp(phonepeLink)} className="btn" style={{ background: '#5f259f', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '12px' }}>
                      <img src="https://download.logo.wine/logo/PhonePe/PhonePe-Logo.wine.png" alt="PhonePe" style={{ height: '24px', filter: 'brightness(0) invert(1)' }} />
                      Pay with PhonePe
                    </button>
                    <button onClick={() => openApp(paytmLink)} className="btn" style={{ background: '#002970', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '12px' }}>
                      Pay with Paytm
                    </button>
                    <button onClick={() => openApp(anyUpiLink)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '12px' }}>
                      Other UPI Apps
                    </button>
                  </div>
                  
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.5 }}>
                    Or scan QR from another device:
                  </p>
                  
                  <div style={{ background: '#fff', padding: '1rem', borderRadius: 'var(--radius-lg)', display: 'inline-block', marginBottom: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <img src={qrUrl} alt="UPI QR Code" style={{ width: '200px', height: '200px' }} />
                  </div>
                  
                  <button onClick={() => setPaymentStatus("verifying")} className="btn btn-primary" style={{ width: '100%', padding: '1.1rem', background: '#10b981', color: 'white', border: 'none' }}>
                    I have scanned and paid
                  </button>
                  <button onClick={() => setStep("fill_details")} className="btn btn-outline" style={{ width: '100%', marginTop: '1rem' }}>
                    Back to Details
                  </button>
                </>
              )}

              {paymentStatus === "verifying" && (
                <div style={{ padding: '2rem 1rem' }}>
                  <div style={{ width: '60px', height: '60px', border: '4px solid #f3f4f6', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }}></div>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Waiting for Payment</h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    Please complete the payment inside your UPI app. Have you successfully transferred ₹{amount}?
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button onClick={confirmSuccess} className="btn btn-primary" style={{ padding: '1.1rem', background: '#10b981', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                      <CheckCircle size={20} /> Yes, Payment Successful
                    </button>
                    <button onClick={() => setPaymentStatus("failed")} className="btn btn-outline" style={{ padding: '1.1rem', color: '#ef4444', borderColor: '#fca5a5', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                      <XCircle size={20} /> No, Payment Failed
                    </button>
                  </div>
                </div>
              )}

              {paymentStatus === "success" && (
                <div style={{ padding: '3rem 1rem', animation: 'fade-in 0.5s' }}>
                  <CheckCircle size={80} color="#10b981" style={{ margin: '0 auto 1.5rem' }} />
                  <h3 style={{ fontSize: '1.5rem', color: '#10b981', marginBottom: '1rem' }}>Payment Successful!</h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Your order has been officially placed! You don't need to send a WhatsApp message, our store owner has directly received your order.</p>

                  <Link href="/">
                    <button className="btn btn-primary" style={{ padding: '1.1rem', width: '100%' }}>
                      Continue Shopping
                    </button>
                  </Link>
                </div>
              )}

              {paymentStatus === "failed" && (
                <div style={{ padding: '3rem 1rem', animation: 'fade-in 0.5s' }}>
                  <XCircle size={80} color="#ef4444" style={{ margin: '0 auto 1.5rem' }} />
                  <h3 style={{ fontSize: '1.5rem', color: '#ef4444', marginBottom: '1rem' }}>Payment Not Successful</h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>We could not verify your payment. Please try again.</p>
                  <button onClick={() => setPaymentStatus("pending")} className="btn btn-primary" style={{ padding: '1.1rem', width: '100%' }}>
                    Try Payment Again
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="checkout-summary glass-panel">
          <h3>Order Summary</h3>
          <div className="summary-items">
            {items.map((item) => (
              <div key={item.id} className="summary-item">
                <div className="summary-item-info">
                  <span className="summary-name">{item.name}</span>
                  <span className="summary-qty">x {item.quantity}</span>
                </div>
                <span className="summary-price">₹{Math.round(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          
          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{Math.round(cartTotal)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <span>{isFreeDelivery ? "Free" : `₹${deliveryFee}`}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{amount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
