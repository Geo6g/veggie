"use client";

import { X, Minus, Plus, ShoppingBag, Leaf } from "lucide-react";
import { useCart } from "../context/CartContext";
import "./CartDrawer.css";
import Link from "next/link";

export default function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (!isCartOpen) return null;

  const isFreeDelivery = cartTotal >= 300;
  const deliveryDiff = 300 - cartTotal;

  return (
    <>
      <div className="cart-overlay animate-fade-in" onClick={() => setIsCartOpen(false)} />
      <div className="cart-drawer animate-slide-in">
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button className="close-btn" onClick={() => setIsCartOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="cart-content">
          {items.length === 0 ? (
            <div className="empty-cart">
              <ShoppingBag size={48} className="empty-icon" />
              <p>Your cart is empty.</p>
              <button className="btn btn-primary" onClick={() => setIsCartOpen(false)}>
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="cart-items">
              {items.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="item-image">
                    <div className="img-placeholder">
                      {item.image ? (
                        <img src={item.image} alt={item.name} />
                      ) : (
                        <Leaf size={24} color="var(--primary-color)" />
                      )}
                    </div>
                  </div>
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <p className="item-pack">{item.packSize}</p>
                    <p className="item-price">₹{item.price}</p>
                  </div>
                  <div className="item-actions">
                    <div className="qty-controls">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Minus size={14} />
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus size={14} />
                      </button>
                    </div>
                    <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-footer">
            <div className="delivery-notice">
              {isFreeDelivery ? (
                <span className="success-text">🎉 You are eligible for Free Delivery!</span>
              ) : (
                <span className="warning-text">Add ₹{deliveryDiff.toFixed(2)} more for Free Delivery</span>
              )}
            </div>
            
            <div className="cart-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Delivery</span>
                <span>{isFreeDelivery ? "Free" : "₹40.00"}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>₹{(cartTotal + (isFreeDelivery ? 0 : 40)).toFixed(2)}</span>
              </div>
            </div>

            <Link href="/checkout" onClick={() => setIsCartOpen(false)} style={{ display: "block" }}>
              <button className="btn btn-primary checkout-btn" style={{ width: '100%', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                Proceed to Checkout
              </button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
