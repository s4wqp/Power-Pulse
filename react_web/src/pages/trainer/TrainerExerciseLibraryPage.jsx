import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { trainerService } from '../../services/trainerService';
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

const TrainerExerciseLibraryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [categories, setCategories] = useState(MUSCLE_CATEGORIES);
  const [selectedCat, setSelectedCat] = useState(MUSCLE_CATEGORIES[0].name);


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
    return w.targetMuscle || 'Other';
  };

  const currentExercises = filtered.filter(w => {
    const target = parseTarget(w);
    // Include "Other" matching if selectedCat is "Other"
    if (selectedCat === 'Other') {
      return !muscles.some(m => m.name.toLowerCase() === target.toLowerCase());
    }
    return target.toLowerCase() === selectedCat.toLowerCase();
  });

  const getDriveThumbnail = (url) => {
    if (!url) return null;
    const match = url.match(/[?&]id=([^&]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`;
    }
    const match2 = url.match(/\/file\/d\/([^\/]+)/);
    if (match2 && match2[1]) {
      return `https://drive.google.com/thumbnail?id=${match2[1]}&sz=w800`;
    }
    return null;
  };

  const getEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/[?&]id=([^&]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    const match2 = url.match(/\/file\/d\/([^\/]+)/);
    if (match2 && match2[1]) {
      return `https://drive.google.com/file/d/${match2[1]}/preview`;
    }
    return url;
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
        {categories.map((cat, idx) => {
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

      {loading ? (
        <div className={styles.loadingSpinner}><div className={styles.spinner} /></div>
      ) : currentExercises.length === 0 ? (
        <div className={styles.emptyState}>
          <span className="material-icons">fitness_center</span>
          <p>No {selectedCat} exercises found.</p>
        </div>
      ) : (
        <div className={styles.itemsGrid}>
          {currentExercises.map((workout) => (
            <div
              key={workout.id}
              className={styles.itemCard}
              onClick={() => navigate('/trainer/exercises/details', { state: { workout } })}
            >
              <div className={styles.itemImage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', position: 'relative', overflow: 'hidden' }}>
                {workout.imageUrl ? (
                  <CachedImage imageUrl={workout.imageUrl} width="100%" height="100%" fit="cover" />
                ) : getDriveThumbnail(workout.videoUrl) ? (
                  <CachedImage imageUrl={getDriveThumbnail(workout.videoUrl)} width="100%" height="100%" fit="cover" />
                ) : (
                  <span className="material-icons" style={{ fontSize: 48, color: '#ddd' }}>{workout.videoUrl ? 'videocam' : 'fitness_center'}</span>
                )}
                {workout.videoUrl && (
                  <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                    <span className="material-icons" style={{ color: 'white', fontSize: 40, backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: '8px' }}>play_arrow</span>
                  </div>
                )}
              </div>
              <div className={styles.itemBody}>
                <div className={styles.itemName}>{parseWorkoutName(workout)}</div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {workout.description || 'No description available'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </WebLayout>
  );
};

export default TrainerExerciseLibraryPage;
