import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { trainerService } from '../../services/trainerService';
import WebLayout from '../../components/WebLayout';
import CachedImage from '../../components/CachedImage';
import styles from '../../components/WebLayout.module.css';

const TrainerExerciseLibraryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user?.id) loadWorkouts();
  }, [user?.id]);

  const loadWorkouts = async () => {
    try {
      const data = await trainerService.getWorkouts(user.id);
      setWorkouts(data || []);
    } catch {
      setWorkouts([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = workouts.filter(w =>
    (w.title || w.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const parseWorkoutName = (w) => w.title || w.name || w.workoutName || 'Untitled';
  const parseTarget = (w) => {
    if (w.muscles && Array.isArray(w.muscles)) {
      const primary = w.muscles.find(m => m.isPrimary);
      return primary?.muscleName || '';
    }
    return w.targetMuscle || '';
  };

  return (
    <WebLayout title="Exercise Library" subtitle="Manage your workout exercises">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div className={styles.searchBar}>
          <span className="material-icons">search</span>
          <input placeholder="Search exercises..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <button className={styles.btnPrimary} onClick={() => navigate('/trainer/add-workout')}>
          <span className="material-icons">add</span> Add Workout
        </button>
      </div>

      {loading ? (
        <div className={styles.loadingSpinner}><div className={styles.spinner} /></div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <span className="material-icons">fitness_center</span>
          <p>No exercises found. Add your first workout!</p>
        </div>
      ) : (
        <div className={styles.itemsGrid}>
          {filtered.map((workout) => (
            <div key={workout.id} className={styles.itemCard}>
              <div className={styles.itemImage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
                {workout.imageUrl ? (
                  <CachedImage imageUrl={workout.imageUrl} width="100%" height="100%" fit="cover" />
                ) : (
                  <span className="material-icons" style={{ fontSize: 48, color: '#ddd' }}>fitness_center</span>
                )}
              </div>
              <div className={styles.itemBody}>
                <div className={styles.itemName}>{parseWorkoutName(workout)}</div>
                {parseTarget(workout) && (
                  <div className={styles.itemMeta}>Target: {parseTarget(workout)}</div>
                )}
                {workout.description && (
                  <div style={{ fontSize: 12, color: '#999', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {workout.description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </WebLayout>
  );
};

export default TrainerExerciseLibraryPage;
