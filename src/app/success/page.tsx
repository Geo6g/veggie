"use client";

import { CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="container section" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <CheckCircle size={80} color="var(--primary-color)" style={{ marginBottom: '1.5rem' }} />
      <h1 className="title" style={{ textAlign: 'center' }}>Order Placed!</h1>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '500px' }}>
        Thank you for your order. If you completed the WhatsApp process, we have received your order details and will confirm it shortly.
      </p>
      <Link href="/">
        <button className="btn btn-primary">
          <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} /> Continue Shopping
        </button>
      </Link>
    </div>
  );
}
