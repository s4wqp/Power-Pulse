import React from 'react';
import { useNavigate } from 'react-router-dom';
import WebLayout from '../../components/WebLayout';
import styles from '../../components/WebLayout.module.css';

const AppSettingsPage = () => {
  const navigate = useNavigate();

  const settingItems = [
    { icon: 'notifications', label: 'Notification Settings', path: '/trainee/notification-settings' },
    { icon: 'description', label: 'Terms & Privacy', path: '/trainee/terms' },
    { icon: 'mail', label: 'Contact Us', path: '/trainee/contact-us' },
  ];

  return (
    <WebLayout title="Settings" subtitle="App settings and preferences">
      <div className={styles.card}>
        {settingItems.map((item) => (
          <div
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 8px',
              borderBottom: '1px solid #f5f5f5', cursor: 'pointer',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span className="material-icons" style={{ color: '#17A073', fontSize: 22 }}>{item.icon}</span>
            <span style={{ flex: 1, fontSize: 15, fontWeight: 500 }}>{item.label}</span>
            <span className="material-icons" style={{ color: '#ccc', fontSize: 18 }}>chevron_right</span>
          </div>
        ))}
      </div>
    </WebLayout>
  );
};

export default AppSettingsPage;
