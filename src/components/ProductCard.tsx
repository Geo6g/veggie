"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus, Star } from "lucide-react";
import { useCart, CartItem } from "../context/CartContext";
import { supabase } from "../lib/supabaseClient";
import "./ProductCard.css";

export interface Product {
  id: string;
  name: string;
  price: number;
  packSize: string;
  image: string;
  categoryId: string;
  isAvailable: boolean;
}

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { items, addToCart, updateQuantity } = useCart();
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    async function fetchRating() {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', product.id);
      
      if (!error && data && data.length > 0) {
        const avg = data.reduce((acc, r) => acc + r.rating, 0) / data.length;
        setAvgRating(avg);
        setReviewCount(data.length);
      }
    }
    fetchRating();
  }, [product.id]);

  const cartItemState = items.find(item => item.id === product.id);
  const quantityInCart = cartItemState ? cartItemState.quantity : 0;

  const handleCardClick = () => {
    router.push(`/product/${product.id}`);
  };

  const handleInitialAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.isAvailable) return;

    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      packSize: product.packSize,
    };
    addToCart(cartItem);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(product.id, quantityInCart + 1);
  };
  
  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(product.id, quantityInCart - 1);
  };

  return (
    <div 
      className={`product-card glass-panel ${!product.isAvailable ? 'out-of-stock' : ''}`}
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="product-image">
        <div className="img-wrapper">
          {product.image ? (
            <img src={product.image} alt={product.name} loading="lazy" />
          ) : (
            <div className="placeholder-bg">No Image</div>
          )}
        </div>
        {!product.isAvailable && <span className="stock-badge">Out of Stock</span>}
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-pack">{product.packSize}</p>
        
        {reviewCount > 0 && (
          <div className="card-rating" style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '4px 0 8px 0' }}>
            <div style={{ display: 'flex', gap: '1px' }}>
              {[1, 2, 3, 4, 5].map(s => (
                <Star 
                  key={s} 
                  size={12} 
                  fill={s <= Math.round(avgRating) ? "var(--accent-color)" : "none"} 
                  color={s <= Math.round(avgRating) ? "var(--accent-color)" : "#cbd5e1"} 
                />
              ))}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>({reviewCount})</span>
          </div>
        )}

        <div className="product-bottom">
          <span className="product-price">₹{product.price}</span>
          <div className="add-btn-wrapper">
            {quantityInCart === 0 ? (
              <button 
                className="btn btn-primary add-btn" 
                onClick={handleInitialAdd}
                disabled={!product.isAvailable}
              >
                Buy
              </button>
            ) : (
              <div className="card-qty-selector">
                <button className="qty-btn" onClick={handleDecrement}>
                  <Minus size={16} />
                </button>
                <span className="qty-value">{quantityInCart}</span>
                <button className="qty-btn" onClick={handleIncrement}>
                  <Plus size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
