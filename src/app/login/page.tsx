"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem', background: 'var(--background)' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem', fontWeight: 600 }}>
          <ArrowLeft size={18} /> Back to Shop
        </Link>
        
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.5rem', color: 'var(--foreground)', letterSpacing: '-0.5px' }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '1rem' }}>
          {isLogin ? 'Enter your details to sign in to your account.' : 'Sign up to get started with fresh deliveries.'}
        </p>

        <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {!isLogin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--foreground)' }}>Full Name</label>
              <input type="text" placeholder="John Doe" style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)', outline: 'none', background: '#f8fafc', width: '100%', fontSize: '1rem', transition: 'border-color 0.2s' }} />
            </div>
          )}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--foreground)' }}>Email Address</label>
            <input type="email" placeholder="you@example.com" style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)', outline: 'none', background: '#f8fafc', width: '100%', fontSize: '1rem', transition: 'border-color 0.2s' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--foreground)' }}>Password</label>
            <input type="password" placeholder="••••••••" style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)', outline: 'none', background: '#f8fafc', width: '100%', fontSize: '1rem', transition: 'border-color 0.2s' }} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1.1rem', fontSize: '1.05rem', marginTop: '1rem', borderRadius: 'var(--radius-full)' }}>
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 800, cursor: 'pointer', fontSize: '0.95rem', padding: '0' }}
          >
            {isLogin ? 'Register now' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
