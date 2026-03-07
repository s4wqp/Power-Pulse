import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import useTraineeStore from '../../stores/traineeStore';
import { productService } from '../../services/productService';
import WebLayout from '../../components/WebLayout';
import CachedImage from '../../components/CachedImage';
import styles from '../../components/WebLayout.module.css';

// Import muscle images
import chestImg from '../../assets/images/chest.png';
import backImg from '../../assets/images/back.png';
import shoulderImg from '../../assets/images/shoulder.png';
import armsImg from '../../assets/images/arms.png';
import absImg from '../../assets/images/abs.png';
import legsImg from '../../assets/images/legs.png';

const MUSCLE_CATEGORIES = [
  { name: 'Chest', iconUrl: chestImg },
  { name: 'Back', iconUrl: backImg },
  { name: 'Shoulders', iconUrl: shoulderImg },
  { name: 'Arms', iconUrl: armsImg },
  { name: 'Abs', iconUrl: absImg },
  { name: 'Legs', iconUrl: legsImg },
];

const ExerciseLibraryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { trainerWorkouts, fetchTrainerWorkouts, isLoading: loadingWorkouts } = useTraineeStore();

  const [categories, setCategories] = useState(MUSCLE_CATEGORIES);
  const [selectedCat, setSelectedCat] = useState(MUSCLE_CATEGORIES[0].name);
  const [loadingCats, setLoadingCats] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchTrainerWorkouts(user.id);
    }
  }, [user?.id, fetchTrainerWorkouts]);

  // Filter workouts by selected category (muscle) and deduplicate
  const seenIds = new Set();
  const currentExercises = trainerWorkouts.filter(w => {
    if (!w.targetMuscle) return false;
    const matches = w.targetMuscle.trim().toLowerCase() === selectedCat.trim().toLowerCase();
    if (!matches) return false;

    // Filter out replacements based on title suffix (like Flutter app does)
    if (w.title?.endsWith('(Alt 1)') || w.title?.endsWith('(Alt 2)')) return false;

    if (seenIds.has(w.id)) return false;
    seenIds.add(w.id);
    return true;
  });

  return (
    <WebLayout title="Exercise Library" subtitle="Workouts assigned by your coach">
      {/* Categories Horizontal List */}
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        gap: 16,
        paddingBottom: 24,
        marginBottom: 24,
        scrollbarWidth: 'none',
        borderBottom: '1px solid #eee'
      }}>
        {loadingCats ? (
          <div className={styles.loadingSpinner}><div className={styles.spinner} style={{ width: 24, height: 24 }} /></div>
        ) : categories.map((cat, idx) => {
          const isSelected = selectedCat === cat.name;
          return (
            <div
              key={idx}
              onClick={() => setSelectedCat(cat.name)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer',
                opacity: 1,
                backgroundColor: isSelected ? 'var(--color-primary)' : '#fff',
                padding: '16px 12px',
                borderRadius: 16,
                border: isSelected ? '2px solid var(--color-primary)' : '2px solid transparent',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                transition: 'all 0.2s',
                minWidth: 100,
                flexShrink: 0
              }}
            >
              <div style={{
                width: 60, height: 60,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 12,
              }}>
                {cat.iconUrl ? (
                  <img
                    src={cat.iconUrl}
                    alt={cat.name}
                    style={{
                      width: '100%', height: '100%', objectFit: 'contain'
                    }}
                  />
                ) : (
                  <span className="material-icons" style={{ fontSize: 40, color: isSelected ? '#fff' : '#999' }}>fitness_center</span>
                )}
              </div>
              <span style={{
                fontSize: 14, fontWeight: 'bold',
                color: isSelected ? '#fff' : '#777'
              }}>
                {cat.name}
              </span>
            </div>
          );
        })}
      </div>

      {loadingWorkouts ? (
        <div className={styles.loadingSpinner}><div className={styles.spinner} /></div>
      ) : currentExercises.length === 0 ? (
        <div className={styles.emptyState}>
          <span className="material-icons">fitness_center</span>
          <p>Your trainer hasn't added {selectedCat} exercises yet.</p>
        </div>
      ) : (
        <div className={styles.itemsGrid}>
          {currentExercises.map((ex) => (
            <div
              key={ex.id}
              className={styles.itemCard}
              onClick={() => navigate('/trainee/exercises/details', { state: { exercise: ex, category: selectedCat, allWorkouts: trainerWorkouts } })}
            >
              <div className={styles.itemImage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
                {ex.imageUrl ? (
                  <CachedImage imageUrl={ex.imageUrl} width="100%" height="100%" fit="cover" />
                ) : (
                  <span className="material-icons" style={{ fontSize: 40, color: '#ddd' }}>fitness_center</span>
                )}
              </div>
              <div className={styles.itemBody}>
                <div className={styles.itemName}>{ex.title || `Exercise #${ex.id}`}</div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {ex.description || 'No description available'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </WebLayout>
  );
};

export default ExerciseLibraryPage;
