import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import WebLayout from '../../components/WebLayout';
import CachedImage from '../../components/CachedImage';
import styles from '../../components/WebLayout.module.css';

const TrainerExerciseDetailPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const workout = location.state?.workout;

    if (!workout) {
        return (
            <WebLayout title="Exercise Details" subtitle="Workout information">
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p>Workout not found.</p>
                    <button className={styles.btnPrimary} onClick={() => navigate(-1)}>Go Back</button>
                </div>
            </WebLayout>
        );
    }

    const getEmbedUrl = (url) => {
        if (!url) return null;

        // Handle YouTube
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoIdMatch = url.match(/(?:youtu\.be\/|v=|\/v\/|\/embed\/)([^&?\/\s]+)/);
            if (videoIdMatch && videoIdMatch[1]) {
                return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
            }
        }

        // Handle Google Drive
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

    const parseTarget = (w) => {
        if (w.muscles && Array.isArray(w.muscles)) {
            const primary = w.muscles.find(m => m.isPrimary);
            return primary?.muscleName || '';
        }
        return w.targetMuscle || 'General';
    };

    const name = workout.title || workout.name || workout.workoutName || 'Untitled';
    const targetMuscle = parseTarget(workout);
    const assistantMuscle = workout.assistantMuscle;

    return (
        <WebLayout title={name} subtitle="Review your exercise instructions and form">
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>

                {/* Left Column: Media */}
                <div className={styles.card} style={{ flex: '1 1 400px', padding: 0, overflow: 'hidden' }}>
                    <div style={{ height: 400, width: '100%', backgroundColor: '#f0f0f0', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {workout.imageUrl && !workout.videoUrl ? (
                            <CachedImage imageUrl={workout.imageUrl} width="100%" height="100%" fit="cover" />
                        ) : workout.videoUrl ? (
                            <iframe
                                src={getEmbedUrl(workout.videoUrl)}
                                style={{ width: '100%', height: '100%', border: 'none' }}
                                allow="autoplay; fullscreen"
                                title={name}
                            ></iframe>
                        ) : (
                            <span className="material-icons" style={{ fontSize: 80, color: '#ccc' }}>fitness_center</span>
                        )}
                    </div>
                </div>

                {/* Right Column: Details */}
                <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div className={styles.card}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                            <h1 className={styles.cardTitle}>{name}</h1>
                            {targetMuscle && targetMuscle !== 'General' && (
                                <span style={{ backgroundColor: 'rgba(23, 160, 115, 0.1)', color: 'var(--color-primary)', padding: '6px 12px', borderRadius: 12, fontSize: 13, fontWeight: 'bold' }}>
                                    {targetMuscle}
                                </span>
                            )}
                        </div>

                        {(targetMuscle !== 'General' || assistantMuscle) && (
                            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                                {targetMuscle !== 'General' && (
                                    <div>
                                        <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>Target Muscle</div>
                                        <div style={{ fontWeight: 600 }}>{targetMuscle}</div>
                                    </div>
                                )}
                                {assistantMuscle && (
                                    <div>
                                        <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>Assistant Muscle</div>
                                        <div style={{ fontWeight: 600 }}>{assistantMuscle}</div>
                                    </div>
                                )}
                            </div>
                        )}

                        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Instructions</h2>
                        <p style={{ color: '#666', lineHeight: 1.6, fontSize: 15, whiteSpace: 'pre-wrap' }}>
                            {workout.description || 'No detailed instructions provided for this exercise.'}
                        </p>
                    </div>

                    <div className={styles.card} style={{ backgroundColor: 'rgba(23, 160, 115, 0.05)', borderColor: 'rgba(23, 160, 115, 0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                            <span className="material-icons" style={{ color: 'var(--color-primary)' }}>edit_note</span>
                            <div>
                                <div style={{ fontWeight: 600, color: 'var(--color-primary)', marginBottom: 4 }}>Trainer Note</div>
                                <span style={{ fontSize: 14, color: '#666', lineHeight: 1.5 }}>
                                    You can update this exercise's instructions or media by editing it from your library. Strong form descriptions help trainees avoid injury.
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </WebLayout>
    );
};

export default TrainerExerciseDetailPage;
