"use client";
// Force rebuild: 2026-03-23 19:13

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
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Guard: Must be logged in to checkout
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/checkout");
    }
  }, [user, authLoading, router]);

  const [step, setStep] = useState<"fill_details" | "payment_processing">("fill_details");
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "processing" | "success" | "failed">("pending");

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

  if (authLoading || !user) {
    return (
      <div className="container section pt-header flex-center" style={{ minHeight: '60vh' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #f3f4f6', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  const isFreeDelivery = cartTotal >= 300;
  const deliveryFee = isFreeDelivery ? 0 : 40;
  const finalTotal = cartTotal + deliveryFee;

  const amount = Math.round(finalTotal);


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

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    if (!user) {
      alert("Please login to place an order.");
      router.push("/login?redirect=/checkout");
      return;
    }
    
    if (!formData.name || !formData.phone || !formData.address) {
      alert("Please fill all delivery details first.");
      return;
    }

    setStep("payment_processing");
    setPaymentStatus("processing");

    try {
      // 1. Load Razorpay Script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert("Failed to load Razorpay. Please check your internet connection.");
        setStep("fill_details");
        return;
      }

      // 2. Create Order on Server
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: finalTotal }),
      });

      const orderData = await res.json();
      if (orderData.error) throw new Error(orderData.error);

      // 3. Open Razorpay Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder", // Test key if not set
        amount: orderData.amount,
        currency: orderData.currency,
        name: "VeggieFresh Shop",
        description: "Fresh Organic Vegetables",
        order_id: orderData.id,
        handler: async function (response: any) {
          // Payment successful!
          setPaymentStatus("success");
          
          // Save to Database
          await supabase.from('orders').insert({
            user_id: user?.id || null,
            total: Math.round(finalTotal),
            payment_method: "Razorpay",
            items: items,
            delivery_address: formData.address,
            phone: formData.phone,
            status: 'pending',
            razorpay_payment_id: response.razorpay_payment_id
          });

          clearCart();
        },
        prefill: {
          name: formData.name,
          contact: formData.phone,
        },
        theme: {
          color: "#16a34a",
        },
        modal: {
          ondismiss: function() {
            setStep("fill_details");
            setPaymentStatus("pending");
          }
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (error: any) {
      console.error("Razorpay Error:", error);
      setPaymentStatus("failed");
    }
  };

  const handleCOD = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) {
      alert("Please fill all details");
      return;
    }
    handleCheckoutCOD();
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
                  <button type="button" onClick={handleRazorpayPayment} className="btn btn-primary online-btn" style={{ width: '100%', padding: '1rem' }}>
                    Pay Online (UPI / Cards / Netbanking)
                  </button>
                  <button type="button" onClick={handleCOD} className="btn btn-outline whatsapp-btn" style={{ width: '100%', padding: '1.1rem' }}>
                    Cash on Delivery (WhatsApp)
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="payment-status-view animate-fade-in" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              {paymentStatus === "processing" && (
                <div style={{ padding: '2rem 1rem' }}>
                  <div style={{ width: '60px', height: '60px', border: '4px solid #f3f4f6', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }}></div>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Initializing Secure Payment...</h3>
                  <p style={{ color: 'var(--text-muted)' }}>
                    Please do not refresh or close this window.
                  </p>
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
                <div style={{ animation: 'fade-in 0.5s' }}>
                  <XCircle size={80} color="#ef4444" style={{ margin: '0 auto 1.5rem' }} />
                  <h3 style={{ fontSize: '1.5rem', color: '#ef4444', marginBottom: '1rem' }}>Payment Not Successful</h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>We could not process your payment. Please try again or choose another method.</p>
                  <button onClick={() => setStep("fill_details")} className="btn btn-primary" style={{ padding: '1.1rem', width: '100%' }}>
                    Try Again
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
