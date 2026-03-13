import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { trainerService } from '../../services/trainerService';
import WebLayout from '../../components/WebLayout';
import CachedImage from '../../components/CachedImage';
import styles from '../../components/WebLayout.module.css';

const toNumber = (v) => {
  if (v == null) return 0;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

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

const extractPlanPrice = (sub, plansById) => {
  const direct =
    sub?.priceSnapshot ??
    sub?.PriceSnapshot ??
    sub?.planPrice ??
    sub?.PlanPrice ??
    sub?.plan_price ??
    sub?.price ??
    sub?.Price ??
    sub?.plan?.price ??
    sub?.trainingPlan?.price;
  if (direct != null) return toNumber(direct);

  const planId = extractPlanId(sub);
  if (planId == null) return 0;
  return toNumber(plansById?.get?.(String(planId))?.price);
};

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
      const [trainerData, subsData, plansData] = await Promise.all([
        trainerService.getTrainerDetails(user.id),
        trainerService.getTrainerSubscriptions(user.id),
        trainerService.getPlans(user.id),
      ]);
      setTrainer(trainerData);
      const subs = subsData || [];
      const plans = plansData || [];
      const plansById = new Map(
        plans
          .filter(p => p && (p.id != null || p.trainingPlanId != null || p.ID != null || p.Id != null))
          .map(p => [String(p.id ?? p.trainingPlanId ?? p.ID ?? p.Id), p])
      );

      const enrichedSubs = subs.map((s) => ({
        ...s,
        __resolvedPlanName: extractPlanName(s, plansById),
        __resolvedPlanPrice: extractPlanPrice(s, plansById),
      }));
      setSubscribers(enrichedSubs);

      // Compute trainer stats on the frontend using subscription data
      const totalClients = subs.length;
      const totalAmount = enrichedSubs.reduce(
        (sum, s) => sum + toNumber(s.__resolvedPlanPrice),
        0
      );

      // Optional: amount earned from subscriptions that start today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayAmount = enrichedSubs.reduce((sum, s) => {
        const startRaw = s.startDate || s.StartDate;
        if (!startRaw) return sum;
        const d = new Date(startRaw);
        d.setHours(0, 0, 0, 0);
        const isToday = d.getTime() === today.getTime();
        return isToday ? sum + toNumber(s.__resolvedPlanPrice) : sum;
      }, 0);

      setStats({
        totalClients,
        todayAmount,
        totalAmount,
      });

    } catch (err) {
      console.error('Error loading trainer data:', err);
      setStats({ totalClients: 0, todayAmount: 0, totalAmount: 0 }); // Ensure stats are reset on error
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
                const endDate = (sub.endDate || sub.EndDate) ? new Date(sub.endDate || sub.EndDate) : null;
                const isActive = endDate ? endDate > new Date() : false;
                const finalImageUrl = sub.traineeProfileImageUrl || sub.TraineeProfileImageUrl || sub.profileImageUrl || sub.ProfileImageUrl || sub.imageUrl || sub.imageUrl || sub.traineeImage || sub.trainee?.profileImageUrl || sub.trainee?.imageUrl;
                const planName = sub.__resolvedPlanName || null;
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
                      {sub.traineeName || sub.TraineeName || 'Unknown'}
                    </td>
                    <td>{planName || 'N/A'}</td>
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
