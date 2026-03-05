import React from 'react';
import WebLayout from '../../components/WebLayout';
import styles from '../../components/WebLayout.module.css';

const TermsAndPrivacyPage = () => {
  return (
    <WebLayout title="Terms & Privacy" subtitle="Legal information and policies">
      <div className={styles.card}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#1a1a2e' }}>Terms of Service</h2>
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.8, marginBottom: 20 }}>
          By using PowerPulse, you agree to these terms of service. PowerPulse provides a platform
          connecting fitness trainees with certified personal trainers, along with a store for healthy
          food, supplements, and gym apparel.
        </p>
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.8, marginBottom: 20 }}>
          Users must provide accurate information during registration. The platform reserves the right
          to terminate accounts that violate community guidelines.
        </p>

        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, marginTop: 32, color: '#1a1a2e' }}>Privacy Policy</h2>
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.8, marginBottom: 20 }}>
          We value your privacy. Personal information collected during registration and usage is
          securely stored and only used to provide our services. We do not sell your data to third parties.
        </p>
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.8 }}>
          For questions about our privacy practices, please contact us at support@powerpulse.com.
        </p>
      </div>
    </WebLayout>
  );
};

export default TermsAndPrivacyPage;
