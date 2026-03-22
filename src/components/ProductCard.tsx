"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus } from "lucide-react";
import { useCart, CartItem } from "../context/CartContext";
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
