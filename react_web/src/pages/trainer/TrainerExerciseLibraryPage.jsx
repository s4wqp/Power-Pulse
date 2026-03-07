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
    return w.targetMuscle || 'Other';
  };

  const muscles = [
    { name: 'Chest', image: '/assets/images/chest.png' },
    { name: 'Back', image: '/assets/images/back.png' },
    { name: 'Shoulders', image: '/assets/images/shoulder.png' },
    { name: 'Arms', image: '/assets/images/arms.png' },
    { name: 'Legs', image: '/assets/images/legs.png' },
    { name: 'Abs', image: '/assets/images/abs.png' },
  ];

  // Group workouts by muscle
  const groupedWorkouts = muscles.map(muscle => {
    return {
      ...muscle,
      workouts: filtered.filter(w => parseTarget(w) === muscle.name)
    };
  }).filter(group => group.workouts.length > 0);

  const otherWorkouts = filtered.filter(w => !muscles.some(m => m.name === parseTarget(w)));
  if (otherWorkouts.length > 0) {
    groupedWorkouts.push({
      name: 'Other',
      image: null,
      workouts: otherWorkouts
    });
  }

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

      {loading ? (
        <div className={styles.loadingSpinner}><div className={styles.spinner} /></div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <span className="material-icons">fitness_center</span>
          <p>No exercises found. Add your first workout!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {groupedWorkouts.map((group) => (
            <div key={group.name}>
              {/* Category Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid rgba(23,160,115,0.1)' }}>
                {group.image ? (
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f5f6f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={group.image} alt={group.name} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                  </div>
                ) : (
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f5f6f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-icons" style={{ color: '#17A073' }}>fitness_center</span>
                  </div>
                )}
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1a1a2e' }}>
                  {group.name} <span style={{ color: '#8a92a6', fontSize: '14px', fontWeight: '500' }}>({group.workouts.length})</span>
                </h3>
              </div>

              {/* Category Grid */}
              <div className={styles.itemsGrid}>
                {group.workouts.map((workout) => (
                  <div key={workout.id} className={styles.itemCard} onClick={() => navigate('/trainer/exercises/details', { state: { workout } })} style={{ cursor: 'pointer' }}>
                    <div className={styles.itemImage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', position: 'relative', overflow: 'hidden' }}>
                      {workout.imageUrl ? (
                        <>
                          <CachedImage imageUrl={workout.imageUrl} width="100%" height="100%" fit="cover" />
                          {workout.videoUrl && <span className="material-icons" style={{ position: 'absolute', color: 'white', fontSize: '32px', backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.4)', borderRadius: '50%', padding: '4px' }}>play_arrow</span>}
                        </>
                      ) : getDriveThumbnail(workout.videoUrl) ? (
                        <>
                          <CachedImage imageUrl={getDriveThumbnail(workout.videoUrl)} width="100%" height="100%" fit="cover" />
                          <span className="material-icons" style={{ position: 'absolute', color: 'white', fontSize: '32px', backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.4)', borderRadius: '50%', padding: '4px' }}>play_arrow</span>
                        </>
                      ) : (
                        <>
                          <span className="material-icons" style={{ fontSize: 48, color: '#333' }}>{workout.videoUrl ? 'videocam' : 'fitness_center'}</span>
                          {workout.videoUrl && <span className="material-icons" style={{ position: 'absolute', color: 'white', fontSize: '32px', backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.4)', borderRadius: '50%', padding: '4px' }}>play_arrow</span>}
                        </>
                      )}
                    </div>
                    <div className={styles.itemBody}>
                      <div className={styles.itemName} style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a2e' }}>{parseWorkoutName(workout)}</div>
                      {workout.description && (
                        <div style={{ fontSize: '13px', color: '#666', marginTop: '6px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {workout.description}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </WebLayout>
  );
};

export default TrainerExerciseLibraryPage;
