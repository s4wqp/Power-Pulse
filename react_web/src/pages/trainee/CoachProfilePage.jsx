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

  const formatDuration = (plan) => {
    if (plan.durationMonths && plan.durationMonths > 0) {
      return `${plan.durationMonths} ${plan.durationMonths === 1 ? 'Month' : 'Months'}`;
    }
    if (plan.durationHours && plan.durationHours > 0) {
      if (plan.durationHours < 1.0) {
        const mins = Math.round(plan.durationHours * 60);
        return `${mins} ${mins === 1 ? 'Minute' : 'Minutes'}`;
      }
      return `${plan.durationHours} ${plan.durationHours === 1 ? 'Hour' : 'Hours'}`;
    }
    const days = plan.durationDays || 0;
    return `${days} ${days === 1 ? 'Day' : 'Days'}`;
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
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: 24, alignItems: 'start' }}>
        {/* Left: Profile card */}
        <div className={styles.card} style={{ textAlign: 'center', position: 'sticky', top: 24 }}>
          <div style={{ width: 120, height: 120, borderRadius: 24, overflow: 'hidden', margin: '0 auto 16px', background: 'linear-gradient(135deg, #17A073, #14c486)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(23,160,115,0.2)' }}>
            {trainer.profileImageUrl ? (
              <CachedImage imageUrl={trainer.profileImageUrl} width="100%" height="100%" fit="cover" />
            ) : (
              <span style={{ fontSize: 48, color: 'white', fontWeight: 700 }}>{trainer.name?.charAt(0)}</span>
            )}
          </div>
          <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700 }}>{trainer.name}</h2>
          <p style={{ color: '#17A073', fontSize: 14, fontWeight: 600, margin: '0 0 16px' }}>{trainer.professionalTitle || 'Trainer'}</p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 20, padding: '12px 0', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#333' }}>{trainer.experienceYears || 0}</div>
              <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Years Exp</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#333' }}>{trainer.rating?.toFixed(1) || '0.0'}</div>
              <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rating</div>
            </div>
          </div>

          {trainer.bio && <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6, textAlign: 'left', marginBottom: 20 }}>{trainer.bio}</p>}

          {trainer.specializations?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {trainer.specializations.map((s, i) => (
                <span key={i} className={styles.badgeGreen} style={{ fontSize: 11, padding: '4px 10px', borderRadius: '8px' }}>{s.name || s}</span>
              ))}
            </div>
          )}
        </div>

        {/* Right: Plans */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px' }}>Choose Your Transformation</h2>
          <p style={{ color: '#888', margin: '0 0 12px' }}>Select a package that fits your goals.</p>

          {plans.length === 0 ? (
            <div className={styles.card} style={{ textAlign: 'center', padding: '48px' }}>
              <span className="material-icons" style={{ fontSize: 48, color: '#e0e0e0', marginBottom: 16 }}>assignment</span>
              <p style={{ color: '#999' }}>No active plans available from this coach right now.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              {plans.map((plan) => {
                const planId = plan.id || plan.trainingPlanId;
                return (
                  <div key={planId} className={styles.card} style={{ padding: 24, transition: 'all 0.3s ease', border: '1.5px solid #f0f0f0' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#17A073'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.06)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#f0f0f0'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#333' }}>{plan.name}</h3>
                        {plan.badge && (
                          <span style={{ backgroundColor: 'rgba(23, 160, 115, 0.1)', color: '#17A073', padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>
                            {plan.badge}
                          </span>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#17A073' }}>{plan.price} EGP</div>
                        <div style={{ fontSize: 12, color: '#aaa' }}>/ {formatDuration(plan)}</div>
                      </div>
                    </div>

                    <p style={{ fontSize: 14, color: '#666', lineHeight: 1.5, margin: '0 0 20px' }}>{plan.description || 'No description'}</p>

                    {plan.features?.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px 16px', marginBottom: 24, padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '12px' }}>
                        {plan.features.map((feature, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className="material-icons" style={{ fontSize: 16, color: '#17A073' }}>check_circle</span>
                            <span style={{ fontSize: 13, color: '#555' }}>{feature}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      className={styles.btnPrimary}
                      onClick={() => handleSubscribe(planId)}
                      disabled={subscribing}
                      style={{ width: '100%', justifyContent: 'center', height: 48, borderRadius: 12, fontSize: 16, fontWeight: 700 }}
                    >
                      {subscribing ? 'Processing...' : 'Subscribe with Coach'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </WebLayout>
  );
};

export default CoachProfilePage;
