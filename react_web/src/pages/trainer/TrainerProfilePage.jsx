import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import useTrainerStore from '../../stores/trainerStore';
import WebLayout from '../../components/WebLayout';
import CachedImage from '../../components/CachedImage';
import styles from '../../components/WebLayout.module.css';

const TrainerProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { currentTrainer, fetchCurrentTrainer } = useTrainerStore();

  useEffect(() => {
    if (user?.id && !currentTrainer) fetchCurrentTrainer(user.id);
  }, [user?.id, currentTrainer, fetchCurrentTrainer]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: 'person_outline', label: 'My Account', path: '/trainer/account' },
    { icon: 'credit_card', label: 'Payment Details', path: '/trainer/payment-details' },
    { icon: 'people_outline', label: 'Subscribers', path: '/trainer/subscribers' },
    { icon: 'monetization_on', label: 'Manage Plans', path: '/trainer/plans' },
    { icon: 'headset_mic', label: 'Contact us', path: '/trainer/contact-us' },
    { icon: 'shield', label: 'Privacy Policy', path: '/trainer/terms' },
    { icon: 'logout', label: 'Logout', action: handleLogout, color: '#ff4d4d' },
  ];

  return (
    <WebLayout title="Trainer Profile" subtitle="View and manage your professional profile">
      <div className={styles.card} style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
          {(currentTrainer?.profileImageUrl || user?.profileImageUrl) ? (
            <CachedImage imageUrl={currentTrainer?.profileImageUrl || user?.profileImageUrl} width="100%" height="100%" fit="cover" />
          ) : (
            <span style={{ fontSize: 32, fontWeight: 700, color: '#999' }}>{(user?.fullName || 'T').charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 22 }}>{user?.fullName || 'Trainer'}</h2>
          <p style={{ margin: '4px 0 0', color: '#888', fontSize: 14 }}>Professional Trainer</p>
        </div>
      </div>

      <div className={styles.card}>
        {menuItems.map((item) => (
          <div
            key={item.label}
            onClick={() => item.action ? item.action() : navigate(item.path)}
            style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '16px 8px',
              borderBottom: item.label === 'Logout' ? 'none' : '1px solid #f5f5f5', cursor: 'pointer',
              color: item.color || '#333'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span className="material-icons" style={{ color: item.color || '#17A073', fontSize: 24 }}>{item.icon}</span>
            <span style={{ flex: 1, fontSize: 16, fontWeight: 600 }}>{item.label}</span>
            {item.label !== 'Logout' && <span className="material-icons" style={{ color: '#ccc', fontSize: 18 }}>chevron_right</span>}
          </div>
        ))}
      </div>
    </WebLayout>
  );
};

export default TrainerProfilePage;
