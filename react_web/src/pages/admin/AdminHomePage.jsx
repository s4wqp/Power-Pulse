import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import WebLayout from '../../components/WebLayout';
import styles from '../../components/WebLayout.module.css';

const AdminHomePage = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const categories = [
    { name: 'Food Category', icon: 'restaurant_menu', path: '/admin/category/Food', color: '#17A073', bg: 'rgba(23,160,115,0.1)', desc: 'Manage healthy meals & food items' },
    { name: 'Supplements Category', icon: 'medication', path: '/admin/category/Supplements', color: '#4285f4', bg: 'rgba(66,133,244,0.1)', desc: 'Manage supplements & proteins' },
    { name: 'Clothes Category', icon: 'checkroom', path: '/admin/category/Clothes', color: '#ff9800', bg: 'rgba(255,152,0,0.1)', desc: 'Manage apparel & gym wear' },
  ];

  return (
    <WebLayout title="Admin Dashboard" subtitle="Manage your store categories">
      <div className={styles.statsGrid}>
        {categories.map((cat) => (
          <div
            key={cat.path}
            className={styles.statCard}
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(cat.path)}
          >
            <div className={styles.statIcon} style={{ background: cat.bg, color: cat.color }}>
              <span className="material-icons">{cat.icon}</span>
            </div>
            <div className={styles.statValue} style={{ fontSize: 18 }}>{cat.name}</div>
            <div className={styles.statLabel}>{cat.desc}</div>
          </div>
        ))}
      </div>

      <div className={styles.card} style={{ marginTop: 20 }}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Quick Actions</h2>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className={styles.btnPrimary} onClick={() => navigate('/admin/category/Food/add')}>
            <span className="material-icons">add</span> Add Food Item
          </button>
          <button className={styles.btnPrimary} onClick={() => navigate('/admin/category/Supplements/add')}>
            <span className="material-icons">add</span> Add Supplement
          </button>
          <button className={styles.btnPrimary} onClick={() => navigate('/admin/category/Clothes/add')}>
            <span className="material-icons">add</span> Add Clothing
          </button>
          <button className={styles.btnSecondary} onClick={() => { logout(); navigate('/login'); }}>
            <span className="material-icons" style={{ fontSize: 18 }}>logout</span> Logout
          </button>
        </div>
      </div>
    </WebLayout>
  );
};

export default AdminHomePage;
