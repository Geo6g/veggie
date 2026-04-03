"use client";

import { useState } from "react";
import "./page.css";
import CategoryFilter from "../components/CategoryFilter";
import ProductCard from "../components/ProductCard";
import { useProducts } from "../context/ProductContext";
import { ArrowRight, CheckCircle, Truck, ShieldCheck, Star, Clock, MapPin, Leaf } from "lucide-react";

export default function Home() {
  const { products, categories, selectedCategory, setSelectedCategory, searchQuery, isLoading } = useProducts();

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === "all" || p.categoryId === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="home-page">
      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="container hero-content">
          <div className="hero-text animate-slide-in">
            <h1>Fresh Vegetables Delivered to Your Doorstep</h1>
            <p>Order in minutes via WhatsApp or online. Same-day delivery for local orders.</p>
            
            <div className="trust-badges">
              <span className="badge">
                <Leaf size={16} /> 100% Organic
              </span>
              <span className="badge">
                <CheckCircle size={16} /> Fresh daily
              </span>
              <span className="badge">
                <Truck size={16} /> Local delivery
              </span>
              <span className="badge">
                <ShieldCheck size={16} /> Free delivery above ₹300
              </span>
            </div>

            <button className="btn btn-accent hero-btn" onClick={() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })}>
              Shop Now <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Delivery Info Section */}
      <section id="delivery-info" className="delivery-info-section container">
        <div className="delivery-info-card glass-panel">
          <div className="info-item">
            <Clock className="info-icon" />
            <div>
              <h4>Same-Day Delivery</h4>
              <p>For orders placed before 2 PM</p>
            </div>
          </div>
          <div className="info-divider"></div>
          <div className="info-item">
            <MapPin className="info-icon" />
            <div>
              <h4>Service Area</h4>
              <p>Local City Limits (10km radius)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bestsellers Section */}
      <section id="bestsellers" className="section container pb-0">
        <div className="section-header align-left">
          <h2 className="title text-2xl">Bestsellers</h2>
          <p className="subtitle">Most loved by our customers</p>
        </div>
        <div className="bestseller-scroll">
          {products.filter(p => ["p1", "p2", "p4"].includes(p.id)).map(product => (
            <div className="bestseller-item" key={`best-${product.id}`}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* Shop Section */}
      <section id="shop" className="section container">
        <div className="section-header">
          <h2 className="title">Our Products</h2>
          <p className="subtitle">Freshly picked for you today</p>
        </div>

        <div className="shop-layout">
          <aside className="shop-sidebar">
            <h3 className="sidebar-title">Categories</h3>
            <CategoryFilter 
              categories={categories} 
              selectedCategory={selectedCategory} 
              onSelectCategory={setSelectedCategory} 
            />
          </aside>
          
          <main className="shop-main">
            <div className="product-grid">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </main>
        </div>
        
        {isLoading ? (
          <div className="loading-products" style={{ textAlign: 'center', padding: '4rem 2rem', marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--foreground)' }}>Loading freshest vegetables...</h3>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="no-products" style={{ textAlign: 'center', padding: '4rem 2rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-lg)', marginTop: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--foreground)' }}>No products found</h3>
            <p style={{ color: 'var(--text-muted)' }}>
              {searchQuery ? `We couldn't find anything matching "${searchQuery}"` : "No products available in this category."}
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
