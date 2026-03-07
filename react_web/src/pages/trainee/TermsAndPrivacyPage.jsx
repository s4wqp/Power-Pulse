import React from 'react';
import WebLayout from '../../components/WebLayout';
import styles from '../../components/WebLayout.module.css';

const TermsAndPrivacyPage = () => {
  const sections = [
    {
      icon: 'gavel',
      title: 'Terms of Service',
      color: '#17A073',
      bgColor: 'rgba(23,160,115,0.1)',
      content: [
        'By using PowerPulse, you agree to these terms of service. PowerPulse provides a platform connecting fitness trainees with certified personal trainers, along with a store for healthy food, supplements, and gym apparel.',
        'Users must provide accurate information during registration. The platform reserves the right to terminate accounts that violate community guidelines.',
        'All subscription fees are non-refundable unless otherwise stated. Trainers set their own pricing for training plans and the platform facilitates the connection.',
      ]
    },
    {
      icon: 'security',
      title: 'Privacy Policy',
      color: '#4285f4',
      bgColor: 'rgba(66,133,244,0.1)',
      content: [
        'We value your privacy. Personal information collected during registration and usage is securely stored and only used to provide our services. We do not sell your data to third parties.',
        'Your health and fitness data (weight, height, workout preferences) is used solely to personalize your training experience and is never shared without your explicit consent.',
        'We use industry-standard encryption to protect sensitive data including payment information and personal communications between trainees and trainers.',
      ]
    },
    {
      icon: 'cookie',
      title: 'Data Collection',
      color: '#ff9800',
      bgColor: 'rgba(255,152,0,0.1)',
      content: [
        'We collect usage data to improve our platform, including page views, feature interactions, and performance metrics. This data is anonymized and cannot be traced back to individual users.',
        'You can request a complete copy of your data or request permanent deletion of your account at any time by contacting support@powerpulse.com.',
      ]
    },
  ];

  return (
    <WebLayout title="Terms & Privacy" subtitle="Legal information and policies">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {sections.map((section, idx) => (
          <div key={idx} className={styles.card}>
            {/* Section Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: section.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <span className="material-icons" style={{ color: section.color, fontSize: '22px' }}>{section.icon}</span>
              </div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1a1a2e' }}>{section.title}</h2>
            </div>

            {/* Section Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {section.content.map((paragraph, pIdx) => (
                <p key={pIdx} style={{
                  fontSize: '14px', color: '#555', lineHeight: '1.8', margin: 0,
                  paddingLeft: '16px', borderLeft: `3px solid ${section.bgColor}`
                }}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        ))}

        {/* Contact info */}
        <div className={styles.card} style={{ textAlign: 'center', padding: '32px' }}>
          <span className="material-icons" style={{ fontSize: '36px', color: '#17A073', marginBottom: '12px', display: 'block' }}>help_outline</span>
          <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '700', color: '#1a1a2e' }}>Have Questions?</h3>
          <p style={{ margin: 0, fontSize: '14px', color: '#8a92a6' }}>
            Contact us at <a href="mailto:support@powerpulse.com" style={{ color: '#17A073', fontWeight: '600', textDecoration: 'none' }}>support@powerpulse.com</a>
          </p>
        </div>
      </div>
    </WebLayout>
  );
};

export default TermsAndPrivacyPage;
