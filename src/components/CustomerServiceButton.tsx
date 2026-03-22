"use client";

import { useState } from "react";
import { Headset, X, Mail, Phone, MessageCircle, PhoneCall } from "lucide-react";
import "./CustomerServiceButton.css";

export default function CustomerServiceButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="customer-service-float-btn"
        title="Customer Service"
      >
        <Headset size={28} />
      </button>

      {isOpen && (
        <div className="contact-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="contact-modal" onClick={e => e.stopPropagation()}>
            <div className="contact-modal-header">
              <div className="contact-modal-title">
                <PhoneCall color="#e11d48" size={24} />
                <h2>Contact Us</h2>
              </div>
              <button className="contact-modal-close" onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="contact-modal-body">
              <p>Have questions or need assistance? We're here to help! Choose your preferred method of contact below:</p>
              
              <div className="contact-options">
                <a href="mailto:support@freshveg.in" className="contact-card email-card">
                  <div className="contact-icon">
                    <Mail size={22} />
                  </div>
                  <div className="contact-details">
                    <span className="contact-method">Email</span>
                    <span className="contact-value">support@freshveg.in</span>
                  </div>
                </a>

                <a href="tel:+918078803752" className="contact-card phone-card">
                  <div className="contact-icon">
                    <Phone size={22} />
                  </div>
                  <div className="contact-details">
                    <span className="contact-method">Phone</span>
                    <span className="contact-value">+91 80788 03752</span>
                  </div>
                </a>

                <a href="https://wa.me/918078803752" target="_blank" rel="noreferrer" className="contact-card whatsapp-card">
                  <div className="contact-icon">
                    <MessageCircle size={22} />
                  </div>
                  <div className="contact-details">
                    <span className="contact-method">WhatsApp</span>
                    <span className="contact-value">+91 80788 03752</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
