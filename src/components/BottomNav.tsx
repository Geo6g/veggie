"use client";

import Link from "next/link";
import { Home, Grid, ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";
import "./BottomNav.css";

export default function BottomNav() {
  const { itemCount, setIsCartOpen } = useCart();

  return (
    <nav className="bottom-nav d-desktop-none">
      <Link href="/" className="b-nav-item">
        <Home size={22} />
        <span>Home</span>
      </Link>
      <Link href="/#shop" className="b-nav-item">
        <Grid size={22} />
        <span>Categories</span>
      </Link>
      <button className="b-nav-item" onClick={() => setIsCartOpen(true)}>
        <div className="b-nav-icon">
          <ShoppingCart size={22} />
          {itemCount > 0 && <span className="b-nav-badge">{itemCount}</span>}
        </div>
        <span>Cart</span>
      </button>
    </nav>
  );
}
