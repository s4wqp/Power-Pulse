import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import useAuthStore from '../../stores/authStore';
import { trainerService } from '../../services/trainerService';
import { driveService } from '../../services/driveService';
import WebLayout from '../../components/WebLayout';
import { showToast } from '../../utils/custom';
import styles from '../../components/WebLayout.module.css';

const muscles = [
  { name: 'Chest', image: '/assets/images/chest.png' },
  { name: 'Back', image: '/assets/images/back.png' },
  { name: 'Shoulders', image: '/assets/images/shoulder.png' },
  { name: 'Arms', image: '/assets/images/arms.png' },
  { name: 'Legs', image: '/assets/images/legs.png' },
  { name: 'Abs', image: '/assets/images/abs.png' },
];

const muscleIdMap = { Chest: 1, Back: 2, Arms: 3, Shoulders: 4, Abs: 5, Legs: 6 };

const AddWorkoutPage = () => {
  const navigate = useNavigate();

  const { user } = useAuthStore();
  const [googleToken, setGoogleToken] = useState(null);

  // Main Workout State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetMuscle, setTargetMuscle] = useState(null);
  const [assistantMuscle, setAssistantMuscle] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  // Replacement 1 State
  const [rep1Name, setRep1Name] = useState('');
  const [rep1VideoUrl, setRep1VideoUrl] = useState('');
  const [rep1File, setRep1File] = useState(null);
  const [rep1Preview, setRep1Preview] = useState(null);

  // Replacement 2 State
  const [rep2Name, setRep2Name] = useState('');
  const [rep2VideoUrl, setRep2VideoUrl] = useState('');
  const [rep2File, setRep2File] = useState(null);
  const [rep2Preview, setRep2Preview] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMusclePicker, setShowMusclePicker] = useState(null); // null | 'target' | 'assistant'

  const videoInputRef = useRef(null);
  const rep1VideoInputRef = useRef(null);
  const rep2VideoInputRef = useRef(null);

  const handleVideoSelect = (e, setFile, setPreview) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const submitWorkoutToBackend = async (token) => {
    setIsSubmitting(true);
    try {
      const musclesPayload = [
        { muscleId: muscleIdMap[targetMuscle] || 1, muscleName: targetMuscle, isPrimary: true },
      ];
      if (assistantMuscle && assistantMuscle !== targetMuscle) {
        musclesPayload.push({ muscleId: muscleIdMap[assistantMuscle] || 1, muscleName: assistantMuscle, isPrimary: false });
      }

      // Upload main video if file is selected
      let finalVideoUrl = videoUrl.trim() || null;
      if (videoFile) {
        try {
          showToast('Uploading video to Google Drive...');
          finalVideoUrl = await driveService.uploadFileWithToken(videoFile, token);
        } catch (err) {
          showToast('Failed to upload video to Drive: ' + err.message, true);
          setIsSubmitting(false);
          return;
        }
      }

      let replIds = [];

      // Create Replacement 1 if video provided
      let finalRep1Url = rep1VideoUrl.trim() || null;
      if (rep1File) {
        finalRep1Url = await driveService.uploadFileWithToken(rep1File, token);
      }
      if (finalRep1Url) {
        const r1Name = rep1Name.trim() || `${name} (Alt 1)`;
        const r1Data = {
          name: r1Name,
          description: `Alternative to ${name}`,
          videoUrl: finalRep1Url,
          imageUrl: null,
          muscles: musclesPayload,
        };
        try {
          const r1Resp = await trainerService.addWorkout(user.id, r1Data);
          if (r1Resp?.id) replIds.push(r1Resp.id);
        } catch (e) { console.error('Rep1 save failed:', e); }
      }

      // Create Replacement 2 if video provided
      let finalRep2Url = rep2VideoUrl.trim() || null;
      if (rep2File) {
        finalRep2Url = await driveService.uploadFileWithToken(rep2File, token);
      }
      if (finalRep2Url) {
        const r2Name = rep2Name.trim() || `${name} (Alt 2)`;
        const r2Data = {
          name: r2Name,
          description: `Alternative to ${name}`,
          videoUrl: finalRep2Url,
          imageUrl: null,
          muscles: musclesPayload,
        };
        try {
          const r2Resp = await trainerService.addWorkout(user.id, r2Data);
          if (r2Resp?.id) replIds.push(r2Resp.id);
        } catch (e) { console.error('Rep2 save failed:', e); }
      }

      // Main workout
      const workoutData = {
        name: name.trim(),
        description: description || '',
        videoUrl: finalVideoUrl,
        imageUrl: null,
        muscles: musclesPayload,
        replacementWorkoutIds: replIds.length > 0 ? replIds : [],
      };

      await trainerService.addWorkout(user.id, workoutData);
      showToast('Workout saved successfully!');
      navigate(-1);
    } catch (err) {
      console.error(err);
      showToast('Failed to save workout. ' + (err.response?.data?.message || err.message), true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      setGoogleToken(tokenResponse.access_token);
      submitWorkoutToBackend(tokenResponse.access_token);
    },
    onError: (error) => {
      console.error('Login Failed', error);
      showToast('Google Sign-In failed or cancelled. Cannot upload to Drive.', true);
      setIsSubmitting(false);
    },
    scope: 'https://www.googleapis.com/auth/drive.file'
  });

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!name.trim()) { showToast('Please enter a workout name', true); return; }
    if (!targetMuscle) { showToast('Please select a target muscle', true); return; }
    if (!videoUrl.trim() && !videoFile) { showToast('Please provide a video URL or upload a video', true); return; }
    if (targetMuscle && targetMuscle === assistantMuscle) { showToast('Target and Assistant muscles cannot be the same!', true); return; }

    const hasVideoFileToUpload = videoFile || rep1File || rep2File;

    // Check for Google Drive configuration
    if (hasVideoFileToUpload && import.meta.env.VITE_GOOGLE_CLIENT_ID === undefined) {
      showToast('Google Drive API not configured. Paste pre-existing video URLs until VITE_GOOGLE_CLIENT_ID is set in .env', true);
      return;
    }

    if (hasVideoFileToUpload && !googleToken) {
      setIsSubmitting(true);
      login();
      return;
    }

    submitWorkoutToBackend(googleToken);
  };

  // Muscle picker box component
  const MuscleBox = ({ label, selected, onClick }) => (
    <div
      onClick={onClick}
      style={{
        width: '140px', height: '140px', borderRadius: '16px',
        background: selected ? '#f8fafb' : '#fafbfc',
        border: selected ? '2px solid #17A073' : '2px dashed #d0d5dd',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'all 0.2s', gap: '8px',
      }}
    >
      {selected ? (
        <>
          <img
            src={muscles.find(m => m.name === selected)?.image || ''}
            alt={selected}
            style={{ width: '56px', height: '56px', objectFit: 'contain' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#1a1a2e' }}>{selected}</span>
        </>
      ) : (
        <>
          <span className="material-icons" style={{ fontSize: '36px', color: '#17A073' }}>add</span>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#8a92a6' }}>{label}</span>
        </>
      )}
    </div>
  );

  // Video upload box
  const VideoUploadBox = ({ label, preview, videoUrl, onVideoUrlChange, inputRef, onFileSelect, height = '260px' }) => (
    <div style={{
      width: '100%', maxWidth: preview ? '400px' : 'none', margin: preview ? '0 auto' : '0',
      height: preview ? 'auto' : height, aspectRatio: preview ? '16/9' : 'auto',
      borderRadius: '16px', overflow: 'hidden', position: 'relative',
      background: preview ? '#000' : '#f0f2f5',
      border: preview ? 'none' : '2px dashed #d0d5dd',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', transition: 'all 0.2s',
    }}>
      {preview ? (
        <>
          <video src={preview} style={{ width: '100%', height: '100%', objectFit: 'contain' }} controls />
          <button
            onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
            style={{
              position: 'absolute', top: '12px', right: '12px',
              background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%',
              width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'white', backdropFilter: 'blur(4px)',
            }}
          >
            <span className="material-icons" style={{ fontSize: '18px' }}>edit</span>
          </button>
        </>
      ) : (
        <div onClick={() => inputRef.current?.click()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '20px', width: '100%' }}>
          <span className="material-icons" style={{ fontSize: '48px', color: '#17A073' }}>videocam</span>
          <span style={{ fontSize: '14px', fontWeight: '700', color: '#17A073' }}>{label}</span>
          <span style={{ fontSize: '12px', color: '#8a92a6' }}>MP4, MOV, WebM</span>
          <div style={{ width: '80%', marginTop: '12px' }}>
            <input
              type="text"
              placeholder="Or paste video URL here"
              value={videoUrl}
              onChange={(e) => onVideoUrlChange(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className={styles.formInput}
              style={{ width: '100%', boxSizing: 'border-box', textAlign: 'center', fontSize: '13px', padding: '10px 14px' }}
            />
          </div>
        </div>
      )}
      <input ref={inputRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={(e) => onFileSelect(e)} />
    </div>
  );

  return (
    <WebLayout title="Add Exercise" subtitle="Create a new workout for your exercise library">
      <div style={{ maxWidth: '800px' }}>
        {/* ========== Video Upload Section ========== */}
        <div className={styles.card}>
          <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-icons" style={{ color: '#17A073', fontSize: '20px' }}>videocam</span>
            Exercise Video
          </h3>
          <VideoUploadBox
            label="Add Video"
            preview={videoPreview}
            videoUrl={videoUrl}
            onVideoUrlChange={setVideoUrl}
            inputRef={videoInputRef}
            onFileSelect={(e) => handleVideoSelect(e, setVideoFile, setVideoPreview)}
          />
        </div>

        {/* ========== Muscle Targets ========== */}
        <div className={styles.card}>
          <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-icons" style={{ color: '#17A073', fontSize: '20px' }}>accessibility_new</span>
            Muscle Target & Assistant
          </h3>
          <p style={{ fontSize: '13px', color: '#8a92a6', margin: '0 0 20px' }}>Select the primary target muscle and optionally an assistant muscle</p>

          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#8a92a6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Target *</span>
              <div style={{ marginTop: '8px' }}>
                <MuscleBox label="Target Muscle" selected={targetMuscle} onClick={() => setShowMusclePicker('target')} />
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#8a92a6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assistant</span>
              <div style={{ marginTop: '8px' }}>
                <MuscleBox label="Assistant Muscle" selected={assistantMuscle} onClick={() => setShowMusclePicker('assistant')} />
              </div>
            </div>
          </div>
        </div>

        {/* ========== Workout Details ========== */}
        <div className={styles.card}>
          <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '700', color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-icons" style={{ color: '#17A073', fontSize: '20px' }}>edit_note</span>
            Workout Details
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#8a92a6', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Workout Name *</label>
              <input className={styles.formInput} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Bench Press" style={{ width: '100%', boxSizing: 'border-box' }} />
            </div>
            {targetMuscle && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#8a92a6' }}>Body part:</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#17A073' }}>{targetMuscle}</span>
                {assistantMuscle && (
                  <>
                    <span style={{ fontSize: '13px', color: '#8a92a6', marginLeft: '12px' }}>Assistant:</span>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#4285f4' }}>{assistantMuscle}</span>
                  </>
                )}
              </div>
            )}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#8a92a6', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Description</label>
              <textarea className={styles.formInput} rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add exercise description, form instructions, sets and reps..." style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical' }} />
            </div>
          </div>
        </div>

        {/* ========== Replacement Workouts ========== */}
        <div className={styles.card}>
          <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '700', color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-icons" style={{ color: '#17A073', fontSize: '20px' }}>swap_horiz</span>
            Replacement Workouts
          </h3>
          <p style={{ fontSize: '13px', color: '#8a92a6', margin: '0 0 20px' }}>Add up to 2 alternative exercises that can substitute this workout</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Replacement 1 */}
            <div>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#8a92a6', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '10px' }}>Alternative 1</span>
              <VideoUploadBox
                label="Video 1"
                preview={rep1Preview}
                videoUrl={rep1VideoUrl}
                onVideoUrlChange={setRep1VideoUrl}
                inputRef={rep1VideoInputRef}
                onFileSelect={(e) => handleVideoSelect(e, setRep1File, setRep1Preview)}
                height="180px"
              />
              {(rep1Preview || rep1VideoUrl) && (
                <input className={styles.formInput} value={rep1Name} onChange={(e) => setRep1Name(e.target.value)} placeholder="Alt exercise name" style={{ width: '100%', boxSizing: 'border-box', marginTop: '10px', fontSize: '13px' }} />
              )}
            </div>

            {/* Replacement 2 */}
            <div>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#8a92a6', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '10px' }}>Alternative 2</span>
              <VideoUploadBox
                label="Video 2"
                preview={rep2Preview}
                videoUrl={rep2VideoUrl}
                onVideoUrlChange={setRep2VideoUrl}
                inputRef={rep2VideoInputRef}
                onFileSelect={(e) => handleVideoSelect(e, setRep2File, setRep2Preview)}
                height="180px"
              />
              {(rep2Preview || rep2VideoUrl) && (
                <input className={styles.formInput} value={rep2Name} onChange={(e) => setRep2Name(e.target.value)} placeholder="Alt exercise name" style={{ width: '100%', boxSizing: 'border-box', marginTop: '10px', fontSize: '13px' }} />
              )}
            </div>
          </div>
        </div>

        {/* ========== Submit Button ========== */}
        <button className={styles.btnPrimary} onClick={handleSubmit} disabled={isSubmitting} style={{ width: '100%', justifyContent: 'center', padding: '18px', fontSize: '16px', marginBottom: '40px' }}>
          {isSubmitting ? (
            <><div className={styles.spinner} style={{ width: '20px', height: '20px', borderWidth: '2px' }} /> Submitting...</>
          ) : (
            <><span className="material-icons" style={{ fontSize: '20px' }}>save</span> Submit Workout</>
          )}
        </button>
      </div>

      {/* ========== Muscle Picker Modal ========== */}
      {showMusclePicker && (
        <div
          onClick={() => setShowMusclePicker(null)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: 'white', borderRadius: '20px', padding: '28px',
              width: '420px', maxHeight: '80vh', overflowY: 'auto',
              animation: 'fadeInUp 0.25s ease-out', boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1a1a2e' }}>
                Select {showMusclePicker === 'target' ? 'Target' : 'Assistant'} Muscle
              </h3>
              <button onClick={() => setShowMusclePicker(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <span className="material-icons" style={{ fontSize: '24px', color: '#888' }}>close</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {muscles.map((muscle) => (
                <div
                  key={muscle.name}
                  onClick={() => {
                    if (showMusclePicker === 'target') setTargetMuscle(muscle.name);
                    else setAssistantMuscle(muscle.name);
                    setShowMusclePicker(null);
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px',
                    borderRadius: '12px', cursor: 'pointer', transition: 'background 0.15s',
                    background:
                      (showMusclePicker === 'target' && targetMuscle === muscle.name) ||
                        (showMusclePicker === 'assistant' && assistantMuscle === muscle.name)
                        ? 'rgba(23,160,115,0.08)' : 'transparent',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafb'}
                  onMouseLeave={e => e.currentTarget.style.background =
                    ((showMusclePicker === 'target' && targetMuscle === muscle.name) ||
                      (showMusclePicker === 'assistant' && assistantMuscle === muscle.name))
                      ? 'rgba(23,160,115,0.08)' : 'transparent'
                  }
                >
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f5f6f8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <img src={muscle.image} alt={muscle.name} style={{ width: '28px', height: '28px', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                  <span style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a2e', flex: 1 }}>{muscle.name}</span>
                  {((showMusclePicker === 'target' && targetMuscle === muscle.name) ||
                    (showMusclePicker === 'assistant' && assistantMuscle === muscle.name)) && (
                      <span className="material-icons" style={{ color: '#17A073', fontSize: '22px' }}>check_circle</span>
                    )}
                </div>
              ))}

              {showMusclePicker === 'assistant' && assistantMuscle && (
                <button
                  onClick={() => { setAssistantMuscle(null); setShowMusclePicker(null); }}
                  style={{
                    marginTop: '8px', padding: '12px', borderRadius: '12px', border: '1px solid #e0e0e0',
                    background: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#ff4d4d',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  }}
                >
                  <span className="material-icons" style={{ fontSize: '18px' }}>remove_circle</span>
                  Remove Assistant Muscle
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </WebLayout>
  );
};

export default AddWorkoutPage;
