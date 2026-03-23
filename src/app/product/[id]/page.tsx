"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Minus, Check, Leaf, ShieldCheck, Truck } from "lucide-react";
import { useProducts } from "../../../context/ProductContext";
import { useCart, CartItem } from "../../../context/CartContext";
import ReviewSection from "../../../components/ReviewSection";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { products } = useProducts();
  const { items, addToCart, updateQuantity } = useCart();
  
  const product = products.find(p => p.id === resolvedParams.id);
  
  if (!product) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <h2>Product not found</h2>
        <Link href="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Shop</Link>
      </div>
    );
  }

  const cartItemState = items.find(item => item.id === product.id);
  const quantityInCart = cartItemState ? cartItemState.quantity : 0;

  const handleInitialAdd = () => {
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

  const handleIncrement = () => updateQuantity(product.id, quantityInCart + 1);
  const handleDecrement = () => updateQuantity(product.id, quantityInCart - 1);

  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: 'calc(100vh - 80px)' }}>
      <div className="container" style={{ padding: '3rem 1.5rem' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          <ArrowLeft size={18} /> Back to Shop
        </Link>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', backgroundColor: 'var(--surface-color)', padding: '2rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ width: '100%', aspectRatio: '1', borderRadius: 'var(--radius-lg)', overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
            {product.image ? (
              <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>No Image</div>
            )}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '1rem' }}>
            {!product.isAvailable && <span style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.95rem', backgroundColor: '#fee2e2', padding: '0.35rem 1rem', borderRadius: '9999px', width: 'fit-content' }}>Out of Stock</span>}
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0', color: 'var(--foreground)', lineHeight: 1.2 }}>{product.name}</h1>
            <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', margin: '0' }}>{product.packSize}</p>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary-dark)', margin: '1.5rem 0' }}>₹{product.price}</div>

            <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-lg)', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#334155' }}>
                <Check size={18} color="var(--primary-color)" /> <span style={{fontSize:'0.95rem', fontWeight:500}}>Guaranteed Fresh</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#334155' }}>
                <Leaf size={18} color="var(--primary-color)" /> <span style={{fontSize:'0.95rem', fontWeight:500}}>Locally Sourced</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#334155' }}>
                <Truck size={18} color="var(--primary-color)" /> <span style={{fontSize:'0.95rem', fontWeight:500}}>Same-Day Delivery Available</span>
              </div>
            </div>
            
            <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
              {quantityInCart === 0 ? (
                <button 
                  className="btn btn-primary" 
                  onClick={handleInitialAdd}
                  disabled={!product.isAvailable}
                  style={{ width: '100%', padding: '1.25rem', fontSize: '1.15rem', borderRadius: 'var(--radius-full)' }}
                >
                  Add to Cart
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '2px solid var(--surface-border)', borderRadius: 'var(--radius-full)', padding: '0.5rem', width: '100%' }}>
                  <button onClick={handleDecrement} className="btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', border: 'none', background: '#f1f5f9', cursor: 'pointer' }}><Minus size={22} color="#475569" /></button>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, minWidth: '40px', textAlign: 'center' }}>{quantityInCart}</span>
                  <button onClick={handleIncrement} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', border: 'none', background: 'var(--primary-color)', color: 'white', cursor: 'pointer' }}><Plus size={22} /></button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <ReviewSection productId={product.id} />
      </div>
    </div>
  );
}
