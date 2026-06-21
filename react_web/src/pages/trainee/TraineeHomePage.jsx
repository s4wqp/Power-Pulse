import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { displayRating } from '../../utils/fakeRating';
import useAuthStore from '../../stores/authStore';
import useTraineeStore from '../../stores/traineeStore';
import { trainerService } from '../../services/trainerService';
import { productService } from '../../services/productService';
import WebLayout from '../../components/WebLayout';
import CachedImage from '../../components/CachedImage';
import styles from '../../components/WebLayout.module.css';

const TraineeHomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { trainee, fetchProfile } = useTraineeStore();
  const [trainers, setTrainers] = useState([]);
  const [loadingTrainers, setLoadingTrainers] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('All');
  const [specializations, setSpecializations] = useState([]);

  useEffect(() => {
    if (user?.id) fetchProfile(user.id);
    loadTrainers();
    loadSpecializations();
  }, [user?.id, fetchProfile]);

  const loadSpecializations = async () => {
    try {
      const data = await productService.getSpecializations();
      setSpecializations(data || []);
    } catch {
      setSpecializations([]);
    }
  };

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

  const filteredTrainers = trainers.filter(trainer => {
    // 1. Text Search matches trainer name.
    const matchesSearch = trainer.name?.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Specialization Dropdown matching. 
    // trainer.specializations can be an array of strings or objects.
    let matchesSpecialization = true;
    if (selectedSpecialization !== 'All') {
      if (trainer.specializations && trainer.specializations.length > 0) {
        matchesSpecialization = trainer.specializations.some(s => {
          const specName = s.name || s;
          return specName === selectedSpecialization;
        });
      } else {
        // If a specific specialization is selected and the trainer has none, it shouldn't match.
        matchesSpecialization = false;
      }
    }

    return matchesSearch && matchesSpecialization;
  });

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
      </div>

      {/* Trainers Section */}
      <div className={styles.card}>
        <div className={styles.cardHeader} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 16 }}>
          <h2 className={styles.cardTitle}>Available Trainers</h2>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div className={styles.searchBar} style={{ flex: '1 1 200px', margin: 0 }}>
              <span className="material-icons">search</span>
              <input
                placeholder="Search trainers..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ flex: '0 0 auto' }}>
              <select
                className={styles.selectInput}
                value={selectedSpecialization}
                onChange={e => setSelectedSpecialization(e.target.value)}
                style={{ padding: '10px 16px', borderRadius: 12, border: '1px solid #ddd', minWidth: 150, height: 44 }}
              >
                <option value="All">All Specializations</option>
                {specializations.map((spec, i) => (
                  <option key={i} value={spec.name || spec}>{spec.name || spec}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {loadingTrainers ? (
          <div className={styles.loadingSpinner}><div className={styles.spinner} /></div>
        ) : filteredTrainers.length === 0 ? (
          <div className={styles.emptyState}>
            <span className="material-icons">person_search</span>
            <p>No trainers match your filters</p>
          </div>
        ) : (
          <div className={styles.itemsGrid}>
            {filteredTrainers.map((trainer) => (
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
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{displayRating(trainer.rating, trainer.id)}</span>
                    <span style={{ fontSize: 12, color: '#aaa', marginLeft: 8 }}>{trainer.experienceYears || 0} yrs exp</span>
                  </div>
                  {trainer.specializations?.length > 0 && (
                    <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {trainer.specializations.slice(0, 2).map((s, i) => (
                        <span key={i} style={{ fontSize: 10, background: 'rgba(23, 160, 115, 0.1)', color: 'var(--color-primary)', padding: '2px 6px', borderRadius: 4 }}>{s.name || s}</span>
                      ))}
                      {trainer.specializations.length > 2 && <span style={{ fontSize: 10, color: '#888' }}>+{trainer.specializations.length - 2}</span>}
                    </div>
                  )}
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
