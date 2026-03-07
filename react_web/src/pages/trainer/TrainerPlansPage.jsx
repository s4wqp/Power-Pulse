import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { trainerService } from '../../services/trainerService';
import WebLayout from '../../components/WebLayout';
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
      toast.success('Plan deleted successfully');
    } catch {
      toast.error('Failed to delete plan');
    }
  };

  const handleToggleActive = async (plan) => {
    try {
      const planId = plan.id || plan.trainingPlanId;
      const updatedPlan = { ...plan, isActive: !plan.isActive };
      await trainerService.updatePlan(user.id, planId, updatedPlan);
      // Optimistic update
      setPlans(prev => prev.map(p => (p.id || p.trainingPlanId) === planId ? updatedPlan : p));
    } catch (err) {
      toast.error('Failed to update status');
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

  return (
    <WebLayout title="" subtitle="">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'calc(100vh - 48px)',
        backgroundColor: '#1a1a2e',
        margin: '-24px', // Full bleed to counter WebLayout padding
        position: 'relative',
      }}>
        {/* Dark Header Section */}
        <div style={{
          padding: '24px 32px 40px 32px',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          backgroundImage: 'url(/assets/images/trainer_bg_appbar.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                cursor: 'pointer', padding: '8px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              onClick={() => navigate(-1)}
            >
              <span className="material-icons" style={{ fontSize: '20px', color: '#fff' }}>arrow_back_ios_new</span>
            </div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold' }}>Manage Plans</h1>
          </div>
        </div>

        {/* White Content Box */}
        <div style={{
          flexGrow: 1,
          backgroundColor: '#fff',
          borderTopLeftRadius: '30px',
          borderTopRightRadius: '30px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
        }}>
          {/* Content Wrapper for standard central width */}
          <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', padding: '24px' }}>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                <span className="material-icons" style={{ fontSize: '40px', color: '#17A073', animation: 'spin 1s linear infinite' }}>autorenew</span>
              </div>
            ) : plans.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
                <span className="material-icons" style={{ fontSize: '64px', color: '#e0e0e0', marginBottom: '16px' }}>assignment_outlined</span>
                <p style={{ color: '#aaa', fontSize: '16px', lineHeight: '1.5' }}>No plans found.<br />Add your first coaching plan!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '80px' }}>
                {plans.map((plan) => {
                  const id = plan.id || plan.trainingPlanId;
                  const isActive = plan.isActive !== false; // Default true if undefined

                  return (
                    <div key={id} style={{
                      backgroundColor: '#fff',
                      borderRadius: '15px',
                      boxShadow: '0 5px 10px rgba(0,0,0,0.05)',
                      border: `1.5px solid ${isActive ? 'rgba(23,160,115,0.5)' : '#e0e0e0'}`,
                      padding: '16px',
                      opacity: isActive ? 1.0 : 0.6,
                      transition: 'all 0.3s ease',
                    }}>
                      {/* Title & Badge Row */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', flex: 1 }}>
                          <span style={{ fontSize: '18px', fontWeight: 'bold', color: isActive ? '#333' : '#777' }}>
                            {plan.name}
                          </span>
                          {plan.badge && (
                            <div style={{
                              padding: '4px 8px',
                              backgroundColor: isActive ? 'rgba(23,160,115,0.1)' : 'rgba(0,0,0,0.05)',
                              borderRadius: '12px',
                              color: isActive ? '#17A073' : '#888',
                              fontSize: '10px',
                              fontWeight: 'bold',
                            }}>
                              {plan.badge}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleDelete(id)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#ff8a8a', padding: '4px', display: 'flex',
                          }}
                        >
                          <span className="material-icons" style={{ fontSize: '20px' }}>delete_outline</span>
                        </button>
                      </div>

                      {/* Description */}
                      <p style={{ fontSize: '12px', color: isActive ? '#777' : '#aaa', margin: '0 0 8px 0' }}>
                        {plan.description}
                      </p>

                      {/* Price & Duration */}
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '12px' }}>
                        <span style={{ fontSize: '20px', fontWeight: 'bold', color: isActive ? '#17A073' : '#aaa' }}>
                          {Number(plan.price).toFixed(0)} EGP
                        </span>
                        <span style={{ fontSize: '12px', color: isActive ? '#888' : '#aaa' }}>
                          / {formatDuration(plan)}
                        </span>
                      </div>

                      <div style={{ height: '1px', backgroundColor: '#f0f0f0', margin: '12px 0' }} />

                      {/* Features */}
                      {plan.features && plan.features.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                          {plan.features.map((feature, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                              <span className="material-icons" style={{ fontSize: '16px', color: '#17A073', marginTop: '2px' }}>check</span>
                              <span style={{ fontSize: '14px', color: '#666', flex: 1 }}>{feature}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Action Row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }} onClick={() => handleToggleActive(plan)}>
                          <div style={{
                            width: '36px', height: '20px', borderRadius: '10px',
                            backgroundColor: isActive ? '#17A073' : '#e0e0e0',
                            position: 'relative', transition: 'background-color 0.2s',
                          }}>
                            <div style={{
                              width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#fff',
                              position: 'absolute', top: '2px', left: isActive ? '18px' : '2px',
                              transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                            }} />
                          </div>
                          <span style={{ fontSize: '12px', color: isActive ? '#333' : '#888', userSelect: 'none' }}>
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <button
                          onClick={() => navigate('/trainer/add-plan', { state: { plan } })}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#17A073', fontSize: '14px', fontWeight: '600', padding: '4px 8px'
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Floating Action Button */}
        <button
          onClick={() => navigate('/trainer/add-plan')}
          style={{
            position: 'absolute', right: '24px', bottom: '24px',
            backgroundColor: '#17A073', color: '#fff', border: 'none',
            borderRadius: '16px', width: '56px', height: '56px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(23,160,115,0.4)', cursor: 'pointer',
            zIndex: 10
          }}
        >
          <span className="material-icons" style={{ fontSize: '28px' }}>add</span>
        </button>

      </div>
    </WebLayout>
  );
};

export default TrainerPlansPage;
