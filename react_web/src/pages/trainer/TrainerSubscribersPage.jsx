import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { trainerService } from '../../services/trainerService';
import WebLayout from '../../components/WebLayout';
import CachedImage from '../../components/CachedImage';
import styles from '../../components/WebLayout.module.css';

const extractPlanId = (sub) =>
  sub?.trainingPlanId ??
  sub?.TrainingPlanId ??
  sub?.trainingPlanID ??
  sub?.TrainingPlanID ??
  sub?.training_plan_id ??
  sub?.planId ??
  sub?.PlanId ??
  sub?.planID ??
  sub?.PlanID ??
  sub?.plan_id ??
  sub?.trainingPlan?.id ??
  sub?.trainingPlan?.Id ??
  sub?.plan?.id ??
  sub?.plan?.Id ??
  null;

const extractPlanName = (sub, plansById) => {
  const direct =
    sub?.planNameSnapshot ||
    sub?.PlanNameSnapshot ||
    sub?.planName ||
    sub?.PlanName ||
    sub?.trainingPlanName ||
    sub?.TrainingPlanName ||
    sub?.plan?.name ||
    sub?.trainingPlan?.name;
  if (direct) return direct;

  const planId = extractPlanId(sub);
  if (planId == null) return null;
  return plansById?.get?.(String(planId))?.name || null;
};

const TrainerSubscribersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [subscribers, setSubscribers] = useState([]);
  const [plansById, setPlansById] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user?.id) loadSubscribers();
  }, [user?.id]);

  const loadSubscribers = async () => {
    try {
      const [data, plans] = await Promise.all([
        trainerService.getTrainerSubscriptions(user.id),
        trainerService.getPlans(user.id),
      ]);
      setSubscribers(data || []);
      const map = new Map(
        (plans || [])
          .filter(p => p && (p.id != null || p.trainingPlanId != null || p.ID != null || p.Id != null))
          .map(p => [String(p.id ?? p.trainingPlanId ?? p.ID ?? p.Id), p])
      );
      setPlansById(map);
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
                const endDate = (sub.endDate || sub.EndDate) ? new Date(sub.endDate || sub.EndDate) : null;
                const isActive = endDate ? endDate > new Date() : false;
                const finalImageUrl = sub.traineeProfileImageUrl || sub.TraineeProfileImageUrl || sub.profileImageUrl || sub.ProfileImageUrl || sub.imageUrl || sub.imageUrl || sub.traineeImage || sub.trainee?.profileImageUrl || sub.trainee?.imageUrl;
                const planName = extractPlanName(sub, plansById);
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
                      {sub.traineeName || sub.TraineeName || 'Unknown'}
                    </td>
                    <td>{planName || 'N/A'}</td>
                    <td>{(sub.startDate || sub.StartDate) ? new Date(sub.startDate || sub.StartDate).toLocaleDateString() : 'N/A'}</td>
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
