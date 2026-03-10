import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { trainerService } from '../../services/trainerService';
import WebLayout from '../../components/WebLayout';
import CachedImage from '../../components/CachedImage';
import styles from '../../components/WebLayout.module.css';

const TrainerHomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [trainer, setTrainer] = useState(null);
  const [stats, setStats] = useState({ totalClients: 0, todayAmount: 0, totalAmount: 0 });
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) loadData();
  }, [user?.id]);

  const loadData = async () => {
    try {
      const [trainerData, statsData, subsData] = await Promise.all([
        trainerService.getTrainerDetails(user.id),
        trainerService.getTrainerStats(user.id),
        trainerService.getTrainerSubscriptions(user.id),
      ]);
      setTrainer(trainerData);
      setStats(statsData || { totalClients: 0, todayAmount: 0, totalAmount: 0 });
      setSubscribers(subsData || []);
    } catch (err) {
      console.error('Error loading trainer data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <WebLayout title="Home">
        <div className={styles.loadingSpinner}><div className={styles.spinner} /></div>
      </WebLayout>
    );
  }

  return (
    <WebLayout title="Trainer Home" subtitle={`Welcome back, ${trainer?.name || user?.fullName || 'Coach'}!`}>
      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(23,160,115,0.1)', color: '#17A073' }}>
            <span className="material-icons">people</span>
          </div>
          <div className={styles.statValue}>{stats.totalClients}</div>
          <div className={styles.statLabel}>Today's Clients</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(255,152,0,0.1)', color: '#ff9800' }}>
            <span className="material-icons">account_balance_wallet</span>
          </div>
          <div className={styles.statValue}>{stats.totalAmount?.toFixed(0)}</div>
          <div className={styles.statLabel}>Total Amount (EGP)</div>
        </div>
      </div>

      {/* Recent Subscribers */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Active Subscribers</h2>
          <button className={styles.btnSecondary} onClick={() => navigate('/trainer/subscribers')}>
            View All
          </button>
        </div>
        {subscribers.length === 0 ? (
          <div className={styles.emptyState}>
            <span className="material-icons">people_outline</span>
            <p>No active subscribers yet</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Client</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Expires</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.slice(0, 10).map((sub) => {
                const endDate = sub.endDate ? new Date(sub.endDate) : null;
                const isActive = endDate ? endDate > new Date() : false;
                const finalImageUrl = sub.traineeProfileImageUrl || sub.profileImageUrl || sub.imageUrl || sub.traineeImage || sub.trainee?.profileImageUrl || sub.trainee?.imageUrl;
                return (
                  <tr key={sub.id || sub.traineeId}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {finalImageUrl ? (
                          <CachedImage imageUrl={finalImageUrl} width="100%" height="100%" fit="cover" />
                        ) : (
                          <span className="material-icons" style={{ fontSize: 18, color: '#ccc' }}>person</span>
                        )}
                      </div>
                      {sub.traineeName || 'Unknown'}
                    </td>
                    <td>{sub.planName || sub.trainingPlanName || 'N/A'}</td>
                    <td>
                      <span className={`${styles.badge} ${isActive ? styles.badgeGreen : styles.badgeRed}`}>
                        {isActive ? 'Active' : 'Expired'}
                      </span>
                    </td>
                    <td>{endDate ? endDate.toLocaleDateString() : 'N/A'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick Links */}
      <div className={styles.statsGrid} style={{ marginTop: 8 }}>
        <div className={styles.statCard} style={{ cursor: 'pointer' }} onClick={() => navigate('/trainer/exercises')}>
          <span className="material-icons" style={{ color: '#17A073', marginBottom: 8 }}>fitness_center</span>
          <div className={styles.statLabel}>Exercise Library</div>
        </div>
        <div className={styles.statCard} style={{ cursor: 'pointer' }} onClick={() => navigate('/trainer/plans')}>
          <span className="material-icons" style={{ color: '#4285f4', marginBottom: 8 }}>assignment</span>
          <div className={styles.statLabel}>Manage Plans</div>
        </div>
        <div className={styles.statCard} style={{ cursor: 'pointer' }} onClick={() => navigate('/trainer/chat')}>
          <span className="material-icons" style={{ color: '#ff9800', marginBottom: 8 }}>chat</span>
          <div className={styles.statLabel}>Messages</div>
        </div>
      </div>
    </WebLayout>
  );
};

export default TrainerHomePage;
