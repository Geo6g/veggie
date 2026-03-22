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

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const isFreeDelivery = cartTotal >= 300;
  const deliveryFee = isFreeDelivery ? 0 : 40;
  const finalTotal = cartTotal + deliveryFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleWhatsAppOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.address) {
      alert("Please fill all details");
      return;
    }

    if (items.length === 0) {
      alert("Your cart is empty");
      return;
    }

    let message = `*New Order from ${formData.name}*\n`;
    message += `Phone: ${formData.phone}\n`;
    message += `Address: ${formData.address}\n\n`;
    message += `*Order Details:*\n`;

    items.forEach((item, index) => {
      message += `${index + 1}. ${item.name} (${item.packSize}) x ${item.quantity} = ₹${item.price * item.quantity}\n`;
    });

    message += `\n*Subtotal:* ₹${cartTotal}`;
    message += `\n*Delivery:* ${isFreeDelivery ? "Free" : "₹40"}`;
    message += `\n*Total Amount:* ₹${finalTotal}\n\n`;
    message += `Please confirm my order. Thank you!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = "919876543210"; 
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
    
    clearCart();
    router.push("/success");
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
          <h2 className="title">Delivery Details</h2>
          <form onSubmit={handleWhatsAppOrder} className="checkout-form">
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

            <div className="checkout-actions">
              <button type="submit" className="btn btn-primary whatsapp-btn">
                Order via WhatsApp
              </button>
              <button type="button" className="btn btn-outline online-btn" onClick={() => alert("Online payment gateway integration coming soon!")}>
                Pay Online
              </button>
            </div>
          </form>
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
                <span className="summary-price">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          
          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{cartTotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <span>{isFreeDelivery ? "Free" : `₹${deliveryFee.toFixed(2)}`}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
