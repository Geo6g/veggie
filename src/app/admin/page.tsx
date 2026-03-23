"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import { Loader2, Package, ShoppingCart, Plus, Edit2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<"orders" | "products">("orders");
  
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user) {
      checkAdminStatus();
    }
  }, [user, authLoading, router]);

  const checkAdminStatus = async () => {
    try {
      const { data } = await supabase.from('profiles').select('role').eq('id', user?.id).single();
      if (data && data.role === 'admin') {
        setIsAdmin(true);
        fetchData();
      } else {
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Orders
      const { data: ordData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (ordData) setOrders(ordData);

      // Fetch Products
      const { data: prodData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (prodData) setProducts(prodData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (!error) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } else {
      alert("Failed to update status");
    }
  };

  const toggleProductAvailability = async (productId: string, currentStatus: boolean) => {
    const { error } = await supabase.from('products').update({ isAvailable: !currentStatus }).eq('id', productId);
    if (!error) {
      setProducts(products.map(p => p.id === productId ? { ...p, isAvailable: !currentStatus } : p));
    }
  };

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={32} color="var(--primary-color)" style={{ animation: 'spin 2s linear infinite' }} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#b91c1c' }}>Access Denied</h1>
        <p>You do not have permission to view the Admin Dashboard.</p>
        <Link href="/" className="btn btn-primary">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.95rem', fontWeight: 600 }}>
            <ArrowLeft size={18} /> Back to Shop
          </Link>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: 0, color: 'var(--foreground)' }}>Admin Dashboard</h1>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--surface-color)', padding: '0.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--surface-border)' }}>
          <button 
            onClick={() => setActiveTab("orders")}
            style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: 'none', background: activeTab === 'orders' ? 'var(--primary-color)' : 'transparent', color: activeTab === 'orders' ? 'white' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <ShoppingCart size={18} /> Orders
          </button>
          <button 
            onClick={() => setActiveTab("products")}
            style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: 'none', background: activeTab === 'products' ? 'var(--primary-color)' : 'transparent', color: activeTab === 'products' ? 'white' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Package size={18} /> Products
          </button>
        </div>
      </div>

      {activeTab === "orders" && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map((order) => (
            <div key={order.id} className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--surface-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Order #{order.id.split('-')[0]} 
                    <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', background: '#e0e7ff', color: '#3730a3', borderRadius: '100px', fontWeight: 600 }}>{order.payment_method}</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                    {new Date(order.created_at).toLocaleString('en-IN')}
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Update Status</span>
                    <select 
                      value={order.status}
                      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                      style={{ padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)', fontWeight: 600, outline: 'none', cursor: 'pointer',
                        background: order.status === 'delivered' ? '#dcfce7' : order.status === 'pending' ? '#fef3c7' : '#f3f4f6',
                        color: order.status === 'delivered' ? '#166534' : order.status === 'pending' ? '#92400e' : '#374151'
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted / Packing</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '80px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Amount</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>₹{order.total}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) minmax(250px, 1fr)', gap: '1.5rem', background: '#f8fafc', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', marginTop: 0 }}>Delivery Details</h4>
                  <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem', fontWeight: 600 }}>📞 {order.phone}</p>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>🏠 {order.delivery_address}</p>
                </div>
                
                <div>
                   <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', marginTop: 0 }}>Ordered Items ({Array.isArray(order.items) ? order.items.length : 0})</h4>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {Array.isArray(order.items) && order.items.map((item: any, idx: number) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                          <span>{item.quantity}x {item.name} <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({item.packSize})</span></span>
                          <span style={{ fontWeight: 600 }}>₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                </div>
              </div>
            </div>
          ))}
          {orders.length === 0 && <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No orders found.</p>}
        </div>
      )}

      {activeTab === "products" && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
             <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Product Inventory</h2>
             <button className="btn btn-primary" onClick={() => alert("Add Product modal would open here.")} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <Plus size={18} /> Add Product
             </button>
          </div>
          
          <div className="glass-panel" style={{ overflowX: 'auto', borderRadius: 'var(--radius-lg)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
               <thead>
                 <tr style={{ borderBottom: '2px solid var(--surface-border)', background: '#f8fafc' }}>
                   <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Image</th>
                   <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Name / Size</th>
                   <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Price</th>
                   <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Category</th>
                   <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Stock Status</th>
                   <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'right' }}>Edit</th>
                 </tr>
               </thead>
               <tbody>
                 {products.map((product) => (
                   <tr key={product.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                     <td style={{ padding: '1rem' }}>
                       <img src={product.image || 'https://via.placeholder.com/50'} alt={product.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                     </td>
                     <td style={{ padding: '1rem', fontWeight: 600 }}>{product.name} <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>{product.packSize}</div></td>
                     <td style={{ padding: '1rem', fontWeight: 700 }}>₹{product.price}</td>
                     <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{product.categoryId}</td>
                     <td style={{ padding: '1rem' }}>
                       <button 
                          onClick={() => toggleProductAvailability(product.id, product.isAvailable)}
                          style={{ padding: '0.3rem 0.8rem', borderRadius: '100px', border: 'none', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                            background: product.isAvailable ? '#dcfce7' : '#fee2e2',
                            color: product.isAvailable ? '#166534' : '#b91c1c'
                          }}
                       >
                         {product.isAvailable ? 'In Stock' : 'Out of Stock'}
                       </button>
                     </td>
                     <td style={{ padding: '1rem', textAlign: 'right' }}>
                       <button onClick={() => alert("Edit Product interface would open here")} style={{ background: 'transparent', border: '1px solid var(--surface-border)', padding: '0.5rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-muted)' }}>
                         <Edit2 size={16} />
                       </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
