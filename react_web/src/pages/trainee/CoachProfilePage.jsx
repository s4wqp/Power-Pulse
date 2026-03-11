import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { trainerService } from '../../services/trainerService';
import { traineeService } from '../../services/traineeService';
import WebLayout from '../../components/WebLayout';
import CachedImage from '../../components/CachedImage';
import styles from '../../components/WebLayout.module.css';
import toast from 'react-hot-toast';

const CoachProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [trainer, setTrainer] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    loadTrainerData();
  }, [id]);

  const loadTrainerData = async () => {
    try {
      const [trainerData, plansData] = await Promise.all([
        trainerService.getTrainerDetails(id),
        trainerService.getPlans(id),
      ]);
      setTrainer(trainerData);
      setPlans((plansData || []).filter(p => p.isActive !== false));
    } catch (err) {
      console.error('Error loading trainer:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId) => {
    if (!user?.id) return;
    setSubscribing(true);
    try {
      await traineeService.subscribe(user.id, planId);
      toast.success('Subscribed successfully!');
      navigate('/trainee/chat');
    } catch (err) {
      toast.error('Failed to subscribe: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <WebLayout title="Coach Profile">
        <div className={styles.loadingSpinner}><div className={styles.spinner} /></div>
      </WebLayout>
    );
  }

  if (!trainer) {
    return (
      <WebLayout title="Coach Profile">
        <div className={styles.emptyState}>
          <span className="material-icons">person_off</span>
          <p>Trainer not found</p>
        </div>
      </WebLayout>
    );
  }

  return (
    <WebLayout title={trainer.name || 'Coach Profile'} subtitle={trainer.professionalTitle || 'Personal Trainer'}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
        {/* Left: Profile card */}
        <div className={styles.card} style={{ textAlign: 'center' }}>
          <div style={{ width: 120, height: 120, borderRadius: 24, overflow: 'hidden', margin: '0 auto 16px', background: 'linear-gradient(135deg, #17A073, #14c486)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {trainer.profileImageUrl ? (
              <CachedImage imageUrl={trainer.profileImageUrl} width="100%" height="100%" fit="cover" />
            ) : (
              <span style={{ fontSize: 48, color: 'white', fontWeight: 700 }}>{trainer.name?.charAt(0)}</span>
            )}
          </div>
          <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700 }}>{trainer.name}</h2>
          <p style={{ color: '#888', fontSize: 14, margin: '0 0 12px' }}>{trainer.professionalTitle || 'Trainer'}</p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#17A073' }}>{trainer.experienceYears || 0}</div>
              <div style={{ fontSize: 12, color: '#888' }}>Years Exp</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#4285f4' }}>{trainer.rating?.toFixed(1) || '0.0'}</div>
              <div style={{ fontSize: 12, color: '#888' }}>Rating</div>
            </div>
          </div>

          {trainer.bio && <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>{trainer.bio}</p>}

          {trainer.specializations?.length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
              {trainer.specializations.map((s, i) => (
                <span key={i} className={styles.badgeGreen} style={{ fontSize: 12 }}>{s.name || s}</span>
              ))}
            </div>
          )}
        </div>

        {/* Right: Plans */}
        <div>
          <div className={styles.card}>
            <h2 className={styles.cardTitle} style={{ marginBottom: 20 }}>Training Plans</h2>
            {plans.length === 0 ? (
              <div className={styles.emptyState}>
                <span className="material-icons">assignment</span>
                <p>No plans available</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 16 }}>
                {plans.map((plan) => {
                  const planId = plan.id || plan.trainingPlanId;
                  return (
                    <div key={planId} style={{ border: '1px solid #f0f0f0', borderRadius: 14, padding: 20, transition: 'box-shadow 0.2s' }} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'} onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{plan.name}</h3>
                        <span style={{ fontSize: 20, fontWeight: 700, color: '#17A073' }}>{plan.price} EGP</span>
                      </div>
                      <p style={{ fontSize: 13, color: '#666', lineHeight: 1.5, margin: '0 0 12px' }}>{plan.description || 'No description'}</p>
                      <div style={{ display: 'flex', gap: 12, fontSize: 13, color: '#888', marginBottom: 14 }}>
                        {plan.durationDays > 0 && <span>📅 {plan.durationDays} days</span>}
                        {plan.durationMonths > 0 && <span>📅 {plan.durationMonths} months</span>}
                      </div>
                      <button
                        className={styles.btnPrimary}
                        onClick={() => handleSubscribe(planId)}
                        disabled={subscribing}
                        style={{ width: '100%', justifyContent: 'center' }}
                      >
                        {subscribing ? 'Subscribing...' : 'Subscribe'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </WebLayout>
  );
};

export default CoachProfilePage;
