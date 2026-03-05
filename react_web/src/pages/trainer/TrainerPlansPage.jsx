import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { trainerService } from '../../services/trainerService';
import WebLayout from '../../components/WebLayout';
import styles from '../../components/WebLayout.module.css';
import toast from 'react-hot-toast';

const TrainerPlansPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) loadPlans();
  }, [user?.id]);

  const loadPlans = async () => {
    try {
      const data = await trainerService.getPlans(user.id);
      setPlans(data || []);
    } catch {
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (planId) => {
    if (!window.confirm('Delete this plan?')) return;
    try {
      await trainerService.deletePlan(user.id, planId);
      setPlans(prev => prev.filter(p => (p.id || p.trainingPlanId) !== planId));
      toast.success('Plan deleted');
    } catch {
      toast.error('Failed to delete plan');
    }
  };

  return (
    <WebLayout title="Training Plans" subtitle="Create and manage your subscription plans">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
        <button className={styles.btnPrimary} onClick={() => navigate('/trainer/add-plan')}>
          <span className="material-icons">add</span> Create Plan
        </button>
      </div>

      {loading ? (
        <div className={styles.loadingSpinner}><div className={styles.spinner} /></div>
      ) : plans.length === 0 ? (
        <div className={styles.emptyState}>
          <span className="material-icons">assignment</span>
          <p>No plans created yet. Create your first plan!</p>
        </div>
      ) : (
        <div className={styles.itemsGrid}>
          {plans.map((plan) => {
            const id = plan.id || plan.trainingPlanId;
            return (
              <div key={id} className={styles.itemCard} style={{ cursor: 'default' }}>
                <div style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700 }}>{plan.name}</h3>
                      {plan.badge && <span className={styles.badgeBlue}>{plan.badge}</span>}
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#17A073' }}>{plan.price} EGP</div>
                  </div>

                  <p style={{ fontSize: 13, color: '#666', margin: '12px 0', lineHeight: 1.5 }}>{plan.description || 'No description'}</p>

                  <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#888', marginBottom: 14 }}>
                    {plan.durationDays > 0 && <span>📅 {plan.durationDays} days</span>}
                    {plan.durationMonths > 0 && <span>📅 {plan.durationMonths} months</span>}
                    {plan.durationHours > 0 && <span>⏱️ {plan.durationHours} hrs</span>}
                  </div>

                  {plan.features?.length > 0 && (
                    <ul style={{ margin: '0 0 14px', paddingLeft: 18, fontSize: 13, color: '#555' }}>
                      {plan.features.map((f, i) => <li key={i} style={{ marginBottom: 4 }}>{f}</li>)}
                    </ul>
                  )}

                  <div style={{ display: 'flex', gap: 8, borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
                    <button className={styles.btnSecondary} style={{ padding: '6px 14px', fontSize: 13 }} onClick={() => navigate('/trainer/add-plan', { state: { plan } })}>
                      <span className="material-icons" style={{ fontSize: 16 }}>edit</span> Edit
                    </button>
                    <button style={{ background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: 'none', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => handleDelete(id)}>
                      <span className="material-icons" style={{ fontSize: 16 }}>delete</span> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </WebLayout>
  );
};

export default TrainerPlansPage;
