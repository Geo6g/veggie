"use client";

import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./checkout.css";

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const router = useRouter();

  const [step, setStep] = useState<"fill_details" | "upi_payment">("fill_details");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const isFreeDelivery = cartTotal >= 300;
  const deliveryFee = isFreeDelivery ? 0 : 40;
  const finalTotal = cartTotal + deliveryFee;

  // Direct UPI Deep Link and QR logic
  const upiId = "georgygeo2004@oksbi";
  const upiLink = `upi://pay?pa=${upiId}&pn=FreshVeg&cu=INR&am=${Math.round(finalTotal)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const buildAndSendWhatsAppOrder = (paymentMethod: "COD" | "UPI") => {
    let message = `*New Order from ${formData.name}*\n`;
    message += `Phone: ${formData.phone}\n`;
    message += `Address: ${formData.address}\n\n`;
    message += `*Order Details:*\n`;

    items.forEach((item, index) => {
      message += `${index + 1}. ${item.name} (${item.packSize}) x ${item.quantity} = ₹${Math.round(item.price * item.quantity)}\n`;
    });

    message += `\n*Subtotal:* ₹${Math.round(cartTotal)}`;
    message += `\n*Delivery:* ${isFreeDelivery ? "Free" : `₹${deliveryFee}`}`;
    message += `\n*Total Amount:* ₹${Math.round(finalTotal)}\n`;
    
    // Append Payment Status
    message += `\n*Payment Method:* ${paymentMethod === "UPI" ? "Online (Paid via UPI)" : "Cash on Delivery"}\n`;
    
    if (paymentMethod === "UPI") {
       message += `_(Note: I have paid ₹${Math.round(finalTotal)} via UPI to ${upiId}. Please verify.)_\n\n`;
    } else {
       message += `\n`;
    }
    
    message += `Please confirm my order. Thank you!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = "918078803752"; 
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
    
    clearCart();
    // Use the home page redirect until a success page is created
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
  };

  const handleCOD = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) {
      alert("Please fill all details");
      return;
    }
    buildAndSendWhatsAppOrder("COD");
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
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="John Doe"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="10-digit mobile number"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="address">Delivery Address</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    placeholder="House No, Street, Landmark"
                    rows={4}
                  />
                </div>

                <div className="checkout-actions" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" onClick={handleStartUPI} className="btn btn-primary online-btn" style={{ width: '100%', padding: '1rem' }}>
                    Pay via UPI (GPay/PhonePe)
                  </button>
                  <button type="button" onClick={handleCOD} className="btn btn-outline whatsapp-btn" style={{ width: '100%', padding: '1.1rem' }}>
                    Cash on Delivery (WhatsApp)
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="upi-payment-view animate-fade-in" style={{ textAlign: 'center', padding: '1rem' }}>
                <h2 className="title" style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>Pay ₹{Math.round(finalTotal)} via UPI</h2>
                
                <div style={{ background: '#fff', padding: '1rem', borderRadius: 'var(--radius-lg)', display: 'inline-block', marginBottom: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                  <img src={qrUrl} alt="UPI QR Code" style={{ width: '220px', height: '220px' }} />
                </div>
                
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  Scan this QR code with any UPI app (GPay, PhonePe, Paytm),<br/>or click the button below if you are on your phone.
                </p>
                
                <a href={upiLink} style={{ display: 'block', width: '100%', marginBottom: '1rem', textDecoration: 'none' }}>
                  <button className="btn" style={{ width: '100%', padding: '1rem', background: '#3b82f6', color: 'white', fontWeight: 700, borderRadius: 'var(--radius-full)' }}>
                    Open UPI App on Phone
                  </button>
                </a>
                
                <hr style={{ margin: '2rem 0', opacity: 0.1 }} />
                
                <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>Have you completed the payment?</p>
                
                <button onClick={() => buildAndSendWhatsAppOrder("UPI")} className="btn btn-primary" style={{ width: '100%', padding: '1.1rem', background: '#10b981', color: 'white', border: 'none' }}>
                  Yes, Send Order via WhatsApp
                </button>
                
                <button onClick={() => setStep("fill_details")} className="btn btn-outline" style={{ width: '100%', marginTop: '1rem' }}>
                  Back to Details
                </button>
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
              <span>₹{Math.round(finalTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
