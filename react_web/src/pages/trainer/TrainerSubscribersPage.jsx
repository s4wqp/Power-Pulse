import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { trainerService } from '../../services/trainerService';
import WebLayout from '../../components/WebLayout';
import CachedImage from '../../components/CachedImage';
import styles from '../../components/WebLayout.module.css';

const TrainerSubscribersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user?.id) loadSubscribers();
  }, [user?.id]);

  const loadSubscribers = async () => {
    try {
      const data = await trainerService.getTrainerSubscriptions(user.id);
      setSubscribers(data || []);
    } catch {
      setSubscribers([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = subscribers.filter(s =>
    (s.traineeName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <WebLayout title="Subscribers" subtitle="View and manage your active subscribers">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div className={styles.searchBar}>
          <span className="material-icons">search</span>
          <input placeholder="Search subscribers..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <span className={styles.badge} style={{ background: 'rgba(23,160,115,0.1)', color: '#17A073', fontSize: 14, padding: '8px 16px' }}>
          {subscribers.length} Total
        </span>
      </div>

      {loading ? (
        <div className={styles.loadingSpinner}><div className={styles.spinner} /></div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <span className="material-icons">people_outline</span>
          <p>No subscribers found</p>
        </div>
      ) : (
        <div className={styles.card}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Client</th>
                <th>Plan</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sub) => {
                const endDate = sub.endDate ? new Date(sub.endDate) : null;
                const isActive = endDate ? endDate > new Date() : false;
                const finalImageUrl = sub.traineeProfileImageUrl || sub.profileImageUrl || sub.imageUrl || sub.traineeImage || sub.trainee?.profileImageUrl || sub.trainee?.imageUrl;
                return (
                  <tr key={sub.id || sub.traineeId}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f0f0f0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {finalImageUrl ? (
                          <CachedImage imageUrl={finalImageUrl} width="100%" height="100%" fit="cover" />
                        ) : (
                          <span className="material-icons" style={{ fontSize: 18, color: '#ccc' }}>person</span>
                        )}
                      </div>
                      {sub.traineeName || 'Unknown'}
                    </td>
                    <td>{sub.planName || sub.trainingPlanName || 'N/A'}</td>
                    <td>{sub.startDate ? new Date(sub.startDate).toLocaleDateString() : 'N/A'}</td>
                    <td>{endDate ? endDate.toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <span className={`${styles.badge} ${isActive ? styles.badgeGreen : styles.badgeRed}`}>
                        {isActive ? 'Active' : 'Expired'}
                      </span>
                    </td>
                    <td>
                      <button className={styles.btnSecondary} style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => navigate(`/trainer/chat/${sub.traineeId}`, { state: { contact: { userId: sub.traineeId, name: sub.traineeName, profileImageUrl: finalImageUrl } } })}>
                        <span className="material-icons" style={{ fontSize: 16 }}>chat</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </WebLayout>
  );
};

export default TrainerSubscribersPage;
