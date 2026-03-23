"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWaitingForEmail, setIsWaitingForEmail] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // Handle Login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        router.push("/");
      } else {
        // Handle Sign Up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });
        if (error) throw error;
        
        // If confirmation is required, show waiting screen
        if (data.user && data.session === null) {
          setIsWaitingForEmail(true);
        } else {
          router.push("/");
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-redirect when user confirms email
  const { user } = useAuth();
  useEffect(() => {
    if (user && isWaitingForEmail) {
      router.push("/");
    }
  }, [user, isWaitingForEmail, router]);

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem', background: 'var(--background)' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem', fontWeight: 600 }}>
          <ArrowLeft size={18} /> Back to Shop
        </Link>
        
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.5rem', color: 'var(--foreground)', letterSpacing: '-0.5px' }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '1rem' }}>
          {isLogin ? 'Enter your details to sign in to your account.' : 'Sign up to get started with fresh deliveries.'}
        </p>

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
            {error}
          </div>
        )}

        {isWaitingForEmail ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ width: '64px', height: '64px', border: '4px solid #f3f4f6', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 2rem' }}></div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--foreground)' }}>Confirm your Email</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2rem' }}>
              We've sent a magic link to <strong>{email}</strong>.<br/>
              Please click the link in your email to verify your account.
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--primary-color)', fontWeight: 600, animation: 'pulse 2s infinite' }}>
              Waiting for confirmation...
            </p>
            <style jsx>{`
              @keyframes pulse {
                0% { opacity: 0.6; }
                50% { opacity: 1; }
                100% { opacity: 0.6; }
              }
            `}</style>
            <button 
              type="button"
              onClick={() => setIsWaitingForEmail(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.9rem', cursor: 'pointer', marginTop: '2.5rem', textDecoration: 'underline' }}
            >
              Back to Sign Up
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {!isLogin && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--foreground)' }}>Full Name</label>
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                    style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)', outline: 'none', background: '#f8fafc', width: '100%', fontSize: '1rem', transition: 'border-color 0.2s' }} 
                  />
                </div>
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--foreground)' }}>Email Address</label>
                <input 
                  type="email" 
                  placeholder="you@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)', outline: 'none', background: '#f8fafc', width: '100%', fontSize: '1rem', transition: 'border-color 0.2s' }} 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--foreground)' }}>Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)', outline: 'none', background: '#f8fafc', width: '100%', fontSize: '1rem', transition: 'border-color 0.2s' }} 
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn btn-primary" 
                style={{ width: '100%', padding: '1.1rem', fontSize: '1.05rem', marginTop: '1rem', borderRadius: 'var(--radius-full)', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}
              >
                {loading ? <Loader2 size={20} style={{ animation: 'spin 2s linear infinite' }} /> : null}
                {isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                }} 
                style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 800, cursor: 'pointer', fontSize: '0.95rem', padding: '0' }}
              >
                {isLogin ? 'Register now' : 'Sign in'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
