import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import useTraineeStore from '../../stores/traineeStore';
import { productService } from '../../services/productService';
import WebLayout from '../../components/WebLayout';
import CachedImage from '../../components/CachedImage';
import styles from '../../components/WebLayout.module.css';

const ExerciseLibraryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { trainerWorkouts, fetchTrainerWorkouts, isLoading: loadingWorkouts } = useTraineeStore();

  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState('');
  const [loadingCats, setLoadingCats] = useState(true);

  useEffect(() => {
    loadCategories();
    if (user?.id) {
      fetchTrainerWorkouts(user.id);
    }
  }, [user?.id]);

  const loadCategories = async () => {
    try {
      const data = await productService.getMuscles();
      setCategories(data || []);
      if (data && data.length > 0) {
        setSelectedCat(data[0].name);
      }
    } catch {
      setCategories([]);
    } finally {
      setLoadingCats(false);
    }
  };

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
      <div style={{ display: 'flex', overflowX: 'auto', gap: 16, paddingBottom: 16, marginBottom: 24, scrollbarWidth: 'none' }}>
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
                opacity: isSelected ? 1 : 0.6,
                minWidth: 70
              }}
            >
              <div style={{
                width: 60, height: 60, borderRadius: 30,
                backgroundColor: isSelected ? 'var(--color-primary)' : '#f5f5f5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 12,
                boxShadow: isSelected ? '0 4px 8px rgba(23,160,115,0.3)' : 'none',
                transition: 'all 0.2s'
              }}>
                {cat.iconUrl ? (
                  <CachedImage imageUrl={cat.iconUrl} width="100%" height="100%" fit="contain" />
                ) : (
                  <span className="material-icons" style={{ color: isSelected ? '#fff' : '#999' }}>fitness_center</span>
                )}
              </div>
              <span style={{ fontSize: 13, fontWeight: 'bold', marginTop: 8, color: isSelected ? 'var(--color-black)' : '#666' }}>
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
