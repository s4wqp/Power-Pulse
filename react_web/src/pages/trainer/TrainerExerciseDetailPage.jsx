import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import WebLayout from '../../components/WebLayout';
import CachedImage from '../../components/CachedImage';
import styles from '../../components/WebLayout.module.css';

const getMuscleImage = (muscleName) => {
    if (!muscleName) return null;
    const name = muscleName.toLowerCase();
    if (name.includes('chest') || name.includes('pec')) return '/assets/images/chest.png';
    if (name.includes('back') || name.includes('lat') || name.includes('rhomboid') || name.includes('trap')) return '/assets/images/back.png';
    if (name.includes('arm') || name.includes('bicep') || name.includes('tricep') || name.includes('forearm')) return '/assets/images/arms.png';
    if (name.includes('shoulder') || name.includes('delt')) return '/assets/images/shoulder.png';
    if (name.includes('ab') || name.includes('core') || name.includes('oblique')) return '/assets/images/abs.png';
    if (name.includes('leg') || name.includes('quad') || name.includes('hamstring') || name.includes('calf') || name.includes('glute')) return '/assets/images/legs.png';
    return null;
};

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

    const parseWorkoutName = (w) => w.title || w.name || w.workoutName || 'Untitled';
    const parseTarget = (w) => {
        if (w.muscles && Array.isArray(w.muscles)) {
            const primary = w.muscles.find(m => m.isPrimary);
            return primary?.muscleName || '';
        }
        return w.targetMuscle || 'General';
    };

    const name = parseWorkoutName(workout);
    const targetMuscle = parseTarget(workout);
    const assistantMuscle = workout.assistantMuscle;

    const targetMuscleImage = getMuscleImage(targetMuscle);
    const assistantMuscleImage = getMuscleImage(assistantMuscle);

    return (
        <WebLayout title="" subtitle="">
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: 'calc(100vh - 48px)',
                backgroundColor: '#1a1a2e',
                margin: '-24px', // Full bleed to counter WebLayout padding
            }}>
                {/* Dark Header Section */}
                <div style={{
                    padding: '24px 32px 40px 32px',
                    color: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span
                            className="material-icons"
                            style={{ cursor: 'pointer', fontSize: '24px' }}
                            onClick={() => navigate(-1)}
                        >arrow_back</span>
                        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold' }}>{name}</h1>
                    </div>
                    <p style={{ margin: 0, fontSize: '16px', color: '#ccc' }}>
                        Body part: <span style={{ fontWeight: '600', color: '#fff' }}>{targetMuscle}</span>
                    </p>
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
                    <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                        {/* Video / Image Header */}
                        <div style={{
                            position: 'relative',
                            width: 'calc(100% - 40px)',
                            aspectRatio: '16/9',
                            backgroundColor: '#000',
                            borderRadius: '15px',
                            overflow: 'hidden',
                            margin: '20px',
                        }}>
                            {workout.videoUrl ? (
                                <iframe
                                    src={getEmbedUrl(workout.videoUrl)}
                                    style={{ width: '100%', height: '100%', border: 'none' }}
                                    allow="autoplay; fullscreen"
                                    title={name}
                                ></iframe>
                            ) : workout.imageUrl ? (
                                <CachedImage imageUrl={workout.imageUrl} width="100%" height="100%" fit="cover" />
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                    <span className="material-icons" style={{ fontSize: '64px', color: '#333' }}>fitness_center</span>
                                </div>
                            )}
                        </div>

                        {/* Anatomy Images */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '16px',
                            padding: '0 20px 20px 20px',
                            flexWrap: 'wrap',
                        }}>
                            {targetMuscle && (
                                <div style={{
                                    backgroundColor: '#f0f0f0',
                                    borderRadius: '10px',
                                    padding: '10px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    width: '120px',
                                    textAlign: 'center',
                                }}>
                                    {targetMuscleImage ? (
                                        <img src={targetMuscleImage} alt={targetMuscle} style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                                    ) : (
                                        <div style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <span className="material-icons" style={{ fontSize: '40px', color: '#999' }}>fitness_center</span>
                                        </div>
                                    )}
                                    <span style={{ fontSize: '12px', color: '#555', marginTop: '5px' }}>Target: {targetMuscle}</span>
                                </div>
                            )}
                            {assistantMuscle && (
                                <div style={{
                                    backgroundColor: '#f0f0f0',
                                    borderRadius: '10px',
                                    padding: '10px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    width: '120px',
                                    textAlign: 'center',
                                }}>
                                    {assistantMuscleImage ? (
                                        <img src={assistantMuscleImage} alt={assistantMuscle} style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                                    ) : (
                                        <div style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <span className="material-icons" style={{ fontSize: '40px', color: '#999' }}>fitness_center</span>
                                        </div>
                                    )}
                                    <span style={{ fontSize: '12px', color: '#555', marginTop: '5px' }}>Assistant: {assistantMuscle}</span>
                                </div>
                            )}
                        </div>

                        {/* Description Section */}
                        <div style={{ padding: '0 32px 32px 32px' }}>
                            <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', color: '#1a1a2e', fontWeight: 'bold' }}>{name}</h1>
                            <p style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#555', fontWeight: 'bold' }}>Body part: {targetMuscle}</p>

                            <div style={{ fontSize: '15px', color: '#444', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                                {workout.description || 'No detailed instructions provided for this exercise.'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </WebLayout>
    );
};

export default TrainerExerciseDetailPage;
