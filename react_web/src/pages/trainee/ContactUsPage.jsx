import React, { useState } from 'react';
import WebLayout from '../../components/WebLayout';
import styles from '../../components/WebLayout.module.css';
import { showToast } from '../../utils/custom';

const ContactUsPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast('Please fill in all required fields', true);
      return;
    }
    showToast('Message sent successfully!');
    setName(''); setEmail(''); setSubject(''); setMessage('');
  };

  return (
    <WebLayout title="Contact Us" subtitle="We'd love to hear from you">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left: Contact Info Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Email card */}
          <div className={styles.card} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(23,160,115,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span className="material-icons" style={{ color: '#17A073', fontSize: '24px' }}>email</span>
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#8a92a6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#333', marginTop: '4px' }}>support@powerpulse.com</div>
            </div>
          </div>

          {/* Phone card */}
          <div className={styles.card} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(66,133,244,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span className="material-icons" style={{ color: '#4285f4', fontSize: '24px' }}>phone</span>
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#8a92a6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone</div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#333', marginTop: '4px' }}>+20 123 456 7890</div>
            </div>
          </div>

          {/* Location card */}
          <div className={styles.card} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(255,152,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span className="material-icons" style={{ color: '#ff9800', fontSize: '24px' }}>location_on</span>
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#8a92a6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Address</div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#333', marginTop: '4px' }}>Cairo, Egypt</div>
            </div>
          </div>

          {/* Social Links */}
          <div className={styles.card} style={{ padding: '20px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#8a92a6', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>Follow Us</div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {['facebook', 'instagram', 'twitter', 'youtube'].map((platform) => (
                <div key={platform} style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: '#f5f6f8', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}>
                  <span style={{ fontSize: '20px' }}>
                    {platform === 'facebook' ? '📘' : platform === 'instagram' ? '📸' : platform === 'twitter' ? '🐦' : '🎬'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Contact Form */}
        <div className={styles.card}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a2e', marginTop: 0, marginBottom: '24px' }}>Send us a message</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#8a92a6', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Your Name *</label>
              <input className={styles.formInput} value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" style={{ width: '100%', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#8a92a6', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Email *</label>
              <input className={styles.formInput} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" style={{ width: '100%', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#8a92a6', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Subject</label>
              <input className={styles.formInput} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="How can we help?" style={{ width: '100%', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#8a92a6', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Message *</label>
              <textarea className={styles.formInput} rows={5} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us what's on your mind..." style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical' }} />
            </div>
            <button className={styles.btnPrimary} onClick={handleSend} style={{ width: '100%', justifyContent: 'center', padding: '16px' }}>
              <span className="material-icons" style={{ fontSize: '18px' }}>send</span>
              Send Message
            </button>
          </div>
        </div>
      </div>
    </WebLayout>
  );
};

export default ContactUsPage;
