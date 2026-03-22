"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ShoppingCart, Search, Menu } from "lucide-react";
import { useCart } from "../context/CartContext";
import "./Navbar.css";

export default function Navbar() {
  const { itemCount, setIsCartOpen } = useCart();
  const [imgError, setImgError] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchClick = () => {
    setIsSearchExpanded(true);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  return (
    <header className={`site-header glass-panel ${isScrolled ? 'scrolled' : ''}`}>
      {/* Main Top Bar */}
      <div className="container header-main">
        <Link href="/" className="logo" style={{ gap: '8px' }}>
          {!imgError ? (
            <img 
              src="/logo-transparent-png.png" 
              alt="Fresh Harvest" 
              style={{ height: '40px', width: 'auto' }}
              onError={() => setImgError(true)} 
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0, lineHeight: 1.1 }}>
              <span style={{ fontSize: '1.35rem', color: 'var(--primary-color)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fresh Harvest</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--accent-color)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px' }}>Delivery</span>
            </div>
          )}
        </Link>
        
        <div className="header-actions">
          <div className={`header-search ${isSearchExpanded ? 'expanded' : ''}`}>
            <button className="search-toggle-btn" onClick={handleSearchClick}>
              <Search size={22} color={isSearchExpanded ? "var(--primary-color)" : "currentColor"} />
            </button>
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Search products..." 
              onBlur={() => setIsSearchExpanded(false)}
            />
          </div>

          <button className="header-cart-btn" onClick={() => setIsCartOpen(true)}>
            <ShoppingCart size={28} color="var(--primary-color)" />
            {itemCount > 0 && <span className="header-cart-badge">{itemCount}</span>}
          </button>
          
          <div className="auth-buttons">
            <button className="btn btn-auth btn-login">Login</button>
            <button className="btn btn-auth btn-register">Register</button>
          </div>
        </div>
      </div>

      {/* Categories Ribbon (Amazon Style) */}
      <div className="header-ribbon hidden-mobile">
        <div className="container ribbon-inner">
          <a href="#" className="ribbon-link ribbon-all">
            <Menu size={18} /> All
          </a>
          <a href="#" className="ribbon-link">Leafy Greens</a>
          <a href="#" className="ribbon-link">Fresh Fruits</a>
          <a href="#" className="ribbon-link">Root Veggies</a>
          <a href="#" className="ribbon-link">Daily Essentials</a>
          <a href="#" className="ribbon-link">Bestsellers</a>
          <a href="#" className="ribbon-link">Today's Deals</a>
        </div>
      </div>
    </header>
  );
}
