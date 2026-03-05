import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import WebLayout from '../../components/WebLayout';
import styles from '../../components/WebLayout.module.css';

const TrainerAccountPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const menuItems = [
    { icon: 'badge', label: 'Personal Information', path: '/trainer/information' },
    { icon: 'edit', label: 'Edit Profile', path: '/trainer/edit-profile' },
    { icon: 'assignment', label: 'Manage Plans', path: '/trainer/plans' },
    { icon: 'fitness_center', label: 'Exercise Library', path: '/trainer/exercises' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <WebLayout title="Account Settings" subtitle="Manage your trainer account">
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

export default TrainerAccountPage;
