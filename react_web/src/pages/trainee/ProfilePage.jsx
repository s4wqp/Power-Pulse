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
    { icon: 'person', label: 'Personal Details', desc: 'Manage your account info', path: '/trainee/personal-details', color: '#17A073', bg: 'rgba(23,160,115,0.1)' },
    { icon: 'location_on', label: 'Delivery Addresses', desc: 'Add or edit addresses', path: '/trainee/addresses', color: '#4285f4', bg: 'rgba(66,133,244,0.1)' },
    { icon: 'credit_card', label: 'Payment Details', desc: 'Manage your cards', path: '/trainee/payment-details', color: '#9C27B0', bg: 'rgba(156,39,176,0.1)' },
    { icon: 'receipt_long', label: 'My Orders', desc: 'Track your order history', path: '/trainee/orders', color: '#ff9800', bg: 'rgba(255,152,0,0.1)' },
    { icon: 'mail', label: 'Contact Us', desc: 'Get help from our team', path: '/trainee/contact-us', color: '#00BCD4', bg: 'rgba(0,188,212,0.1)' },
    { icon: 'description', label: 'Terms & Privacy', desc: 'Legal information', path: '/trainee/terms', color: '#607D8B', bg: 'rgba(96,125,139,0.1)' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <WebLayout title="My Profile" subtitle="Manage your account settings">
      {/* Profile Hero Card */}
      <div className={styles.card} style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '28px', position: 'relative', overflow: 'hidden' }}>
        {/* Background accent */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(23,160,115,0.06) 0%, transparent 70%)', borderRadius: '50%', transform: 'translate(30%, -30%)' }} />

        <div style={{ width: '90px', height: '90px', borderRadius: '22px', overflow: 'hidden', background: 'linear-gradient(135deg, #17A073, #14c486)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 16px rgba(23,160,115,0.3)' }}>
          {trainee?.profileImageUrl ? (
            <CachedImage imageUrl={trainee.profileImageUrl} width="100%" height="100%" fit="cover" />
          ) : (
            <span style={{ fontSize: '36px', fontWeight: '800', color: 'white' }}>{(trainee?.name || user?.fullName || 'U').charAt(0).toUpperCase()}</span>
          )}
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: '800', color: '#1a1a2e' }}>{trainee?.name || user?.fullName || 'User'}</h2>
          <p style={{ margin: '0 0 2px', color: '#8a92a6', fontSize: '14px', fontWeight: '500' }}>{trainee?.email || user?.email || ''}</p>
          {trainee?.phone && <p style={{ margin: 0, color: '#aab0bc', fontSize: '13px' }}>{trainee.phone}</p>}
        </div>
      </div>

      {/* Menu Items */}
      <div className={styles.card} style={{ padding: '8px 12px' }}>
        {menuItems.map((item, idx) => (
          <div
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 12px',
              borderBottom: idx < menuItems.length - 1 ? '1px solid #f5f6f8' : 'none',
              cursor: 'pointer', transition: 'all 0.2s ease', borderRadius: '12px',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f8fafb'; e.currentTarget.style.transform = 'translateX(4px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'none'; }}
          >
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span className="material-icons" style={{ color: item.color, fontSize: '22px' }}>{item.icon}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a2e' }}>{item.label}</div>
              <div style={{ fontSize: '12px', color: '#8a92a6', marginTop: '2px' }}>{item.desc}</div>
            </div>
            <span className="material-icons" style={{ color: '#ccc', fontSize: '18px' }}>chevron_right</span>
          </div>
        ))}

        {/* Logout */}
        <div
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 12px',
            cursor: 'pointer', marginTop: '8px', borderRadius: '12px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,77,77,0.05)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,77,77,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span className="material-icons" style={{ color: '#ff4d4d', fontSize: '22px' }}>logout</span>
          </div>
          <span style={{ fontSize: '15px', fontWeight: '600', color: '#ff4d4d' }}>Logout</span>
        </div>
      </div>
    </WebLayout>
  );
};

export default ProfilePage;
