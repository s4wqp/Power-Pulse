import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import useTraineeStore from '../../stores/traineeStore';
import WebLayout from '../../components/WebLayout';
import CachedImage from '../../components/CachedImage';
import styles from '../../components/WebLayout.module.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { trainee } = useTraineeStore();

  const menuItems = [
    { icon: 'person', label: 'Personal Details', path: '/trainee/personal-details' },
    { icon: 'location_on', label: 'Delivery Addresses', path: '/trainee/addresses' },
    { icon: 'credit_card', label: 'Payment Details', path: '/trainee/payment-details' },
    { icon: 'receipt_long', label: 'My Orders', path: '/trainee/orders' },
    { icon: 'notifications', label: 'Notification Settings', path: '/trainee/notification-settings' },
    { icon: 'settings', label: 'App Settings', path: '/trainee/settings' },
    { icon: 'mail', label: 'Contact Us', path: '/trainee/contact-us' },
    { icon: 'description', label: 'Terms & Privacy', path: '/trainee/terms' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <WebLayout title="My Profile" subtitle="Manage your account settings">
      {/* Profile Card */}
      <div className={styles.card} style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
        <div style={{ width: 80, height: 80, borderRadius: 20, overflow: 'hidden', background: 'linear-gradient(135deg, #17A073, #14c486)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {trainee?.profileImageUrl ? (
            <CachedImage imageUrl={trainee.profileImageUrl} width="100%" height="100%" fit="cover" />
          ) : (
            <span style={{ fontSize: 32, fontWeight: 700, color: 'white' }}>{(trainee?.name || user?.fullName || 'U').charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{trainee?.name || user?.fullName || 'User'}</h2>
          <p style={{ margin: '4px 0 0', color: '#888', fontSize: 14 }}>{trainee?.email || user?.email || ''}</p>
          {trainee?.phone && <p style={{ margin: '2px 0 0', color: '#aaa', fontSize: 13 }}>{trainee.phone}</p>}
        </div>
      </div>

      {/* Menu Items */}
      <div className={styles.card}>
        {menuItems.map((item) => (
          <div
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 8px',
              borderBottom: '1px solid #f5f5f5', cursor: 'pointer', transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span className="material-icons" style={{ color: '#17A073', fontSize: 22 }}>{item.icon}</span>
            <span style={{ flex: 1, fontSize: 15, fontWeight: 500 }}>{item.label}</span>
            <span className="material-icons" style={{ color: '#ccc', fontSize: 18 }}>chevron_right</span>
          </div>
        ))}
        <div
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '14px 8px',
            cursor: 'pointer', marginTop: 8, color: '#ff4d4d',
          }}
        >
          <span className="material-icons" style={{ fontSize: 22 }}>logout</span>
          <span style={{ fontSize: 15, fontWeight: 500 }}>Logout</span>
        </div>
      </div>
    </WebLayout>
  );
};

export default ProfilePage;
