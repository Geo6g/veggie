"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import { User, MapPin, Phone, Package, Loader2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({ full_name: "", phone: "", address: "" });
  const [orders, setOrders] = useState<any[]>([]);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user) {
      fetchData();
    }
  }, [user, authLoading, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch profile
      const { data: profData, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
        
      if (profData) {
        setProfile({
          full_name: profData.full_name || user?.user_metadata?.full_name || "",
          phone: profData.phone || "",
          address: profData.address || ""
        });
      } else if (profError && profError.code === 'PGRST116') {
        // Profile doesn't exist yet
        setProfile({
          full_name: user?.user_metadata?.full_name || "",
          phone: "",
          address: ""
        });
      }

      // Fetch orders
      const { data: ordData, error: ordError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (ordData) {
        setOrders(ordData);
      }
    } catch (err) {
      console.error("Error fetching profile data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user?.id, 
          full_name: profile.full_name,
          phone: profile.phone,
          address: profile.address,
        });

      if (error) throw error;
      setMessage({ text: "Profile updated successfully!", type: "success" });
    } catch (err: any) {
      console.error(err);
      setMessage({ text: "Failed to update profile.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={32} color="var(--primary-color)" style={{ animation: 'spin 2s linear infinite' }} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1000px', margin: '0 auto' }}>
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem', fontWeight: 600 }}>
        <ArrowLeft size={18} /> Back to Shop
      </Link>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 'bold' }}>
          {profile.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
        </div>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--foreground)' }}>My Profile</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>{user.email}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 2fr)', gap: '2rem', alignItems: 'start' }} className="profile-grid">
        
        {/* Profile Settings */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--surface-border)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={20} color="var(--primary-color)" /> Personal Details
          </h2>
          
          {message.text && (
            <div style={{ padding: '0.75rem 1rem', background: message.type === 'success' ? '#dcfce7' : '#fee2e2', color: message.type === 'success' ? '#166534' : '#b91c1c', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Full Name</label>
              <div style={{ position: 'relative' }}>
               <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
               <input type="text" value={profile.full_name} onChange={e => setProfile({...profile, full_name: e.target.value})} style={{ padding: '0.8rem 1rem 0.8rem 2.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)', width: '100%', outline: 'none' }} />
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Phone Number</label>
              <div style={{ position: 'relative' }}>
               <Phone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
               <input type="tel" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} placeholder="+91 9876543210" style={{ padding: '0.8rem 1rem 0.8rem 2.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)', width: '100%', outline: 'none' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Default Delivery Address</label>
              <div style={{ position: 'relative' }}>
               <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '1rem', color: 'var(--text-muted)' }} />
               <textarea value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} placeholder="House number, street, city etc." rows={3} style={{ padding: '0.8rem 1rem 0.8rem 2.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)', width: '100%', resize: 'vertical', outline: 'none' }} />
              </div>
            </div>

            <button type="submit" disabled={saving} className="btn btn-primary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '0.9rem', borderRadius: 'var(--radius-full)' }}>
              {saving ? <Loader2 size={18} style={{ animation: 'spin 2s linear infinite' }} /> : <Save size={18} />}
              Save Changes
            </button>
          </form>
        </div>

        {/* Order History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={20} color="var(--primary-color)" /> Order History
          </h2>
          
          {orders.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', borderRadius: 'var(--radius-xl)', border: '1px dashed var(--surface-border)' }}>
              <Package size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>No orders yet</h3>
              <p style={{ color: 'var(--text-muted)', margin: '0 0 1.5rem 0', fontSize: '0.95rem' }}>When you place orders, they will appear here.</p>
              <Link href="/" className="btn btn-primary" style={{ display: 'inline-flex', padding: '0.8rem 1.5rem', borderRadius: '100px' }}>Start Shopping</Link>
            </div>
          ) : (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {orders.map((order) => (
                <div key={order.id} className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--surface-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>#{order.id.split('-')[0]}</span>
                      <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>{new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 800, color: 'var(--foreground)' }}>₹{order.total}</span>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '100px',
                        background: order.status === 'delivered' ? '#dcfce7' : order.status === 'pending' ? '#fef3c7' : '#e0e7ff',
                        color: order.status === 'delivered' ? '#166534' : order.status === 'pending' ? '#92400e' : '#3730a3',
                        textTransform: 'capitalize'
                      }}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ background: 'var(--background)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-muted)' }}>Items:</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {Array.isArray(order.items) && order.items.map((item: any, idx: number) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                          <span>{item.quantity}x {item.name}</span>
                          <span style={{ fontWeight: 500 }}>₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .profile-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}} />
    </div>
  );
}
