"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Search, Menu, User, Shield } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useProducts } from "../context/ProductContext";
import { supabase } from "../lib/supabaseClient";
import "./Navbar.css";

export default function Navbar() {
  const pathname = usePathname();
  const { itemCount, setIsCartOpen } = useCart();
  const { user, signOut } = useAuth();
  const { selectedCategory, setSelectedCategory, categories, products, searchQuery, setSearchQuery } = useProducts();
  const [isAdmin, setIsAdmin] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState<typeof products>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('role').eq('id', user.id).single()
        .then(({ data }) => {
          if (data && data.role === 'admin') setIsAdmin(true);
        });
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const handleSearchClick = () => {
    setIsSearchExpanded(true);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // Smooth scroll only if on home page
    if (pathname === '/') {
      const shopSection = document.getElementById('shop');
      if (shopSection) {
        shopSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) && 
          searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update suggestions as user types
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5); // Limit to 5 suggestions
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, products]);

  const handleSuggestionClick = (productName: string) => {
    setSearchQuery(productName);
    setShowSuggestions(false);
    
    // Scroll to shop section
    const shopSection = document.getElementById('shop');
    if (shopSection) {
      shopSection.scrollIntoView({ behavior: 'smooth' });
    }
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setShowSuggestions(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setShowSuggestions(false);
                  document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            />
            {showSuggestions && (
              <div className="search-suggestions" ref={suggestionsRef}>
                {suggestions.length > 0 ? (
                  suggestions.map(p => (
                    <button 
                      key={p.id} 
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(p.name)}
                    >
                      <Search size={16} className="suggestion-icon" />
                      <span className="suggestion-name">{p.name}</span>
                    </button>
                  ))
                ) : (
                  <div className="no-suggestions">No products found</div>
                )}
              </div>
            )}
          </div>

          <button className="header-cart-btn" onClick={() => setIsCartOpen(true)}>
            <ShoppingCart size={28} color="var(--primary-color)" />
            {itemCount > 0 && <span className="header-cart-badge">{itemCount}</span>}
          </button>
          
          <div className="auth-buttons">
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {!isAdmin ? (
                  <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {user.user_metadata?.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || <User size={16} />}
                    </div>
                  </Link>
                ) : (
                  <Link href="/admin" className="btn btn-auth" style={{ background: '#f59e0b', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 1rem' }}>
                    <Shield size={16} /> Admin
                  </Link>
                )}
                <button onClick={signOut} className="btn btn-auth" style={{ background: 'transparent', border: '1px solid var(--surface-border)', color: 'var(--text-muted)' }}>Logout</button>
              </div>
            ) : (
              <Link href="/login" className="btn btn-auth btn-login">Sign In</Link>
            )}
          </div>
        </div>
      </div>

      {/* Categories Ribbon (Amazon Style) */}
      {pathname === '/' && (
        <div className="header-ribbon">
          <div className="container ribbon-inner">
            <a 
              href="#shop"
              onClick={() => setSelectedCategory('all')} 
              className="ribbon-link ribbon-all"
            >
              <Menu size={18} /> All
            </a>
            {categories.map(cat => (
              <a 
                key={cat.id} 
                href="#shop"
                onClick={() => setSelectedCategory(cat.id)}
                className="ribbon-link"
              >
                {cat.name}
              </a>
            ))}
            <a href="#bestsellers" className="ribbon-link">Bestsellers</a>
            <a href="#shop" className="ribbon-link">Today's Deals</a>
          </div>
        </div>
      )}
    </header>
  );
}
