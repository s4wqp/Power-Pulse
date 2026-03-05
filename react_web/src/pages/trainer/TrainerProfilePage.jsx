import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import WebLayout from '../../components/WebLayout';
import CachedImage from '../../components/CachedImage';
import styles from '../../components/WebLayout.module.css';

const TrainerProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const menuItems = [
    { icon: 'badge', label: 'Personal Information', path: '/trainer/information' },
    { icon: 'edit', label: 'Edit Profile', path: '/trainer/edit-profile' },
    { icon: 'assignment', label: 'Manage Plans', path: '/trainer/plans' },
    { icon: 'fitness_center', label: 'Exercise Library', path: '/trainer/exercises' },
    { icon: 'manage_accounts', label: 'Account Settings', path: '/trainer/account' },
  ];

  return (
    <WebLayout title="Trainer Profile" subtitle="View and manage your professional profile">
      <div className={styles.card} style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
        <div style={{ width: 80, height: 80, borderRadius: 20, overflow: 'hidden', background: 'linear-gradient(135deg, #17A073, #14c486)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 32, fontWeight: 700, color: 'white' }}>{(user?.fullName || 'T').charAt(0).toUpperCase()}</span>
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 22 }}>{user?.fullName || 'Trainer'}</h2>
          <p style={{ margin: '4px 0 0', color: '#888', fontSize: 14 }}>Professional Trainer</p>
        </div>
      </div>

      <div className={styles.card}>
        {menuItems.map((item) => (
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

export default TrainerProfilePage;
