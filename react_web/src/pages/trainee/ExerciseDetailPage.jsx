import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import WebLayout from '../../components/WebLayout';
import CachedImage from '../../components/CachedImage';
import styles from '../../components/WebLayout.module.css';

const ExerciseDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { exercise, category } = location.state || {};

  if (!exercise) {
    navigate('/trainee/exercises');
    return null;
  }

  return (
    <WebLayout title={exercise.title || exercise.name || 'Exercise Details'} subtitle="Review exercise instructions and form">
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>

        {/* Left Column: Media */}
        <div className={styles.card} style={{ flex: '1 1 400px', padding: 0, overflow: 'hidden' }}>
          <div style={{ height: 400, width: '100%', backgroundColor: '#f0f0f0', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {exercise.imageUrl ? (
              <CachedImage imageUrl={exercise.imageUrl} width="100%" height="100%" fit="cover" />
            ) : (
              <span className="material-icons" style={{ fontSize: 80, color: '#ccc' }}>fitness_center</span>
            )}

            {exercise.videoUrl && (
              <a
                href={exercise.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ position: 'absolute', width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', textDecoration: 'none' }}
              >
                <span className="material-icons" style={{ color: 'white', fontSize: 36 }}>play_arrow</span>
              </a>
            )}
          </div>
        </div>

        {/* Right Column: Details */}
        <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          <div className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <h1 className={styles.cardTitle}>{exercise.title || exercise.name}</h1>
              {category && (
                <span style={{ backgroundColor: 'rgba(23, 160, 115, 0.1)', color: 'var(--color-primary)', padding: '6px 12px', borderRadius: 12, fontSize: 13, fontWeight: 'bold' }}>
                  {category}
                </span>
              )}
            </div>

            {(exercise.targetMuscle || exercise.assistantMuscle) && (
              <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                {exercise.targetMuscle && (
                  <div>
                    <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>Target Muscle</div>
                    <div style={{ fontWeight: 600 }}>{exercise.targetMuscle}</div>
                  </div>
                )}
                {exercise.assistantMuscle && (
                  <div>
                    <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>Assistant Muscle</div>
                    <div style={{ fontWeight: 600 }}>{exercise.assistantMuscle}</div>
                  </div>
                )}
              </div>
            )}

            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Instructions</h2>
            <p style={{ color: '#666', lineHeight: 1.6, fontSize: 15, whiteSpace: 'pre-wrap' }}>
              {exercise.description || 'No specific instructions provided for this exercise.'}
            </p>
          </div>

          <div className={styles.card} style={{ backgroundColor: 'rgba(238, 231, 32, 0.05)', borderColor: 'rgba(238, 231, 32, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <span className="material-icons" style={{ color: '#D4AC0D' }}>lightbulb</span>
              <div>
                <div style={{ fontWeight: 600, color: '#B7950B', marginBottom: 4 }}>Pro Tip</div>
                <span style={{ fontSize: 14, color: '#666', lineHeight: 1.5 }}>
                  Keep your core tight and maintain proper form throughout the movement to avoid injury and maximize muscle engagement. If you are unsure, consult your trainer.
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </WebLayout>
  );
};

export default ExerciseDetailPage;
