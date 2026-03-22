import Link from "next/link";
import "./Footer.css";
import { Leaf, MapPin, Phone, Clock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-brand">
          <Link href="/" className="logo footer-logo">
            <Leaf className="logo-icon" size={24} />
            <span>FreshVeg</span>
          </Link>
          <p className="footer-desc">
            Your local, fresh, and organic vegetable shop delivering straight to your door.
          </p>
        </div>
        
        <div className="footer-links">
          <h3>Quick Links</h3>
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/checkout">Checkout</Link></li>
          </ul>
        </div>
        
        <div className="footer-contact">
          <h3>Contact Us</h3>
          <ul>
            <li><MapPin size={16} /> 123 Green Avenue, Local City</li>
            <li><Phone size={16} /> +91 98765 43210</li>
            <li><Clock size={16} /> Open Daily: 7 AM - 9 PM</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} FreshVeg. All rights reserved.</p>
      </div>
    </footer>
  );
}
