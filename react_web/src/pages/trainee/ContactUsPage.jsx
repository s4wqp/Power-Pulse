import React from 'react';
import WebLayout from '../../components/WebLayout';
import styles from '../../components/WebLayout.module.css';

const ContactUsPage = () => {
  return (
    <WebLayout title="Contact Us" subtitle="Get in touch with our team">
      <div className={styles.card}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Email</label>
            <div style={{ fontSize: 15, color: '#333', padding: '12px 0' }}>support@powerpulse.com</div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Phone</label>
            <div style={{ fontSize: 15, color: '#333', padding: '12px 0' }}>+20 123 456 7890</div>
          </div>
          <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
            <label className={styles.formLabel}>Address</label>
            <div style={{ fontSize: 15, color: '#333', padding: '12px 0' }}>Cairo, Egypt</div>
          </div>
          <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
            <label className={styles.formLabel}>Send us a message</label>
            <textarea className={styles.formInput} rows={4} placeholder="Type your message here..." />
          </div>
          <div className={styles.formGroup}>
            <button className={styles.btnPrimary}>Send Message</button>
          </div>
        </div>
      </div>
    </WebLayout>
  );
};

export default ContactUsPage;
