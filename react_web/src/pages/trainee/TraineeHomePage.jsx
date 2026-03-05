import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import useTraineeStore from '../../stores/traineeStore';
import { trainerService } from '../../services/trainerService';
import WebLayout from '../../components/WebLayout';
import CachedImage from '../../components/CachedImage';
import styles from '../../components/WebLayout.module.css';

const TraineeHomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { trainee, fetchProfile } = useTraineeStore();
  const [trainers, setTrainers] = useState([]);
  const [loadingTrainers, setLoadingTrainers] = useState(true);

  useEffect(() => {
    if (user?.id) fetchProfile(user.id);
    loadTrainers();
  }, [user?.id, fetchProfile]);

  const loadTrainers = async () => {
    try {
      const data = await trainerService.getTrainers();
      setTrainers(data || []);
    } catch {
      setTrainers([]);
    } finally {
      setLoadingTrainers(false);
    }
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <WebLayout title={`${greeting()}, ${trainee?.name || user?.fullName || 'Champ'}!`} subtitle="Welcome back to PowerPulse">
      {/* Quick Actions */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard} style={{ cursor: 'pointer' }} onClick={() => navigate('/trainee/food')}>
          <div className={styles.statIcon} style={{ background: 'rgba(23,160,115,0.1)', color: '#17A073' }}>
            <span className="material-icons">restaurant_menu</span>
          </div>
          <div className={styles.statLabel}>Food Store</div>
          <div style={{ fontSize: 13, color: '#aaa', marginTop: 4 }}>Healthy meals & snacks</div>
        </div>
        <div className={styles.statCard} style={{ cursor: 'pointer' }} onClick={() => navigate('/trainee/supplements')}>
          <div className={styles.statIcon} style={{ background: 'rgba(66,133,244,0.1)', color: '#4285f4' }}>
            <span className="material-icons">medication</span>
          </div>
          <div className={styles.statLabel}>Supplements</div>
          <div style={{ fontSize: 13, color: '#aaa', marginTop: 4 }}>Protein & vitamins</div>
        </div>
        <div className={styles.statCard} style={{ cursor: 'pointer' }} onClick={() => navigate('/trainee/clothes')}>
          <div className={styles.statIcon} style={{ background: 'rgba(255,152,0,0.1)', color: '#ff9800' }}>
            <span className="material-icons">checkroom</span>
          </div>
          <div className={styles.statLabel}>Clothes</div>
          <div style={{ fontSize: 13, color: '#aaa', marginTop: 4 }}>Gym wear & apparel</div>
        </div>
        <div className={styles.statCard} style={{ cursor: 'pointer' }} onClick={() => navigate('/trainee/exercises')}>
          <div className={styles.statIcon} style={{ background: 'rgba(156,39,176,0.1)', color: '#9c27b0' }}>
            <span className="material-icons">fitness_center</span>
          </div>
          <div className={styles.statLabel}>Exercises</div>
          <div style={{ fontSize: 13, color: '#aaa', marginTop: 4 }}>Workout library</div>
        </div>
      </div>

      {/* Trainers Section */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Available Trainers</h2>
        </div>
        {loadingTrainers ? (
          <div className={styles.loadingSpinner}><div className={styles.spinner} /></div>
        ) : trainers.length === 0 ? (
          <div className={styles.emptyState}>
            <span className="material-icons">person_search</span>
            <p>No trainers available right now</p>
          </div>
        ) : (
          <div className={styles.itemsGrid}>
            {trainers.map((trainer) => (
              <div
                key={trainer.id}
                className={styles.itemCard}
                onClick={() => navigate(`/trainee/coach/${trainer.id}`)}
              >
                <div style={{ height: 160, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {trainer.profileImageUrl ? (
                    <CachedImage imageUrl={trainer.profileImageUrl} width="100%" height="100%" fit="cover" />
                  ) : (
                    <span className="material-icons" style={{ fontSize: 48, color: '#ccc' }}>person</span>
                  )}
                </div>
                <div className={styles.itemBody}>
                  <div className={styles.itemName}>{trainer.name}</div>
                  <div className={styles.itemMeta}>{trainer.professionalTitle || 'Personal Trainer'}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                    <span className="material-icons" style={{ fontSize: 16, color: '#EEE720' }}>star</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{trainer.rating?.toFixed(1) || '0.0'}</span>
                    <span style={{ fontSize: 12, color: '#aaa', marginLeft: 8 }}>{trainer.experienceYears || 0} yrs exp</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </WebLayout>
  );
};

export default TraineeHomePage;
