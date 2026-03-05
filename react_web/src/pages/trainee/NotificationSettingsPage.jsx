import React, { useState } from 'react';
import WebLayout from '../../components/WebLayout';
import styles from '../../components/WebLayout.module.css';

const NotificationSettingsPage = () => {
  const [settings] = useState({
    pushNotifications: true,
    emailNotifications: false,
    chatNotifications: true,
    orderUpdates: true,
    promotions: false,
  });

  return (
    <WebLayout title="Notification Settings" subtitle="Manage your notification preferences">
      <div className={styles.card}>
        {Object.entries(settings).map(([key, value]) => (
          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 8px', borderBottom: '1px solid #f5f5f5' }}>
            <span style={{ fontSize: 15, fontWeight: 500, textTransform: 'capitalize' }}>
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </span>
            <div style={{
              width: 48, height: 26, borderRadius: 13, background: value ? '#17A073' : '#e0e0e0',
              position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', background: 'white',
                position: 'absolute', top: 2, left: value ? 24 : 2,
                transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </div>
          </div>
        ))}
      </div>
    </WebLayout>
  );
};

export default NotificationSettingsPage;
