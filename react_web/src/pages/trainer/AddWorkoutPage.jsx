import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import useTrainerStore from '../../stores/trainerStore';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { showToast } from '../../utils/custom';
import styles from './Trainer.module.css';

const AddWorkoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addTrainerWorkout, isLoading } = useTrainerStore();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    muscleTargeted: '',
    videoUrl: '' // In standard web this would be a file input + upload to Drive, mirroring the flutter web approach
  });

  const handleChange = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.muscleTargeted || !formData.videoUrl) {
      showToast('Please fill all required fields and upload a video', true);
      return;
    }

    if (user?.id) {
      // Mock file logic assuming videoUrl is raw GDrive URL for now mimicking web API
      const success = await addTrainerWorkout({
        trainerId: user.id,
        title: formData.title,
        description: formData.description,
        muscleTargeted: formData.muscleTargeted,
        videoUrl: formData.videoUrl
      });

      if (success) {
        showToast('Exercise uploaded successfully!');
        navigate(-1);
      } else {
        showToast('Failed to upload exercise.', true);
      }
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.appBar}>
        <div className={styles.headerRow} style={{ marginBottom: 0 }}>
          <button className={styles.backBtn} onClick={() => navigate(-1)} disabled={isLoading}>
            <span className="material-icons">arrow_back_ios</span>
          </button>
          <span style={{ fontSize: '20px', fontWeight: 'bold' }}>Add Exercise</span>
        </div>
      </div>

      <div className={styles.scrollContent}>
        {/* Simple Mock Video URL Input (Simulating the Drive Upload for Web phase 1) */}
        <div style={{ width: '100%', height: '200px', backgroundColor: '#F0F0F0', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', border: '2px dashed #E0E0E0' }}>
          <span className="material-icons" style={{ fontSize: '48px', color: 'var(--color-gray)' }}>cloud_upload</span>
          <span style={{ color: 'var(--color-primary)', fontWeight: 'bold', marginTop: '8px' }}>Upload Video</span>
          <span style={{ color: 'var(--color-text-second)', fontSize: '12px', marginTop: '4px' }}>MP4, MOV (Max 50MB)</span>

          {/* For testing, allowing direct URL input since real drive upload requires backend integration/tokens */}
          <input
            type="text"
            placeholder="Paste Google Drive Video Link"
            value={formData.videoUrl}
            onChange={handleChange('videoUrl')}
            style={{ width: '80%', padding: '8px', marginTop: '16px', textAlign: 'center', border: '1px solid #CCC', borderRadius: '8px' }}
          />
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <TextField
            label="Exercise Title"
            placeholder="e.g. Incline Bench Press"
            value={formData.title}
            onChange={handleChange('title')}
          />

          <TextField
            label="Targeted Muscle"
            placeholder="e.g. Chest"
            value={formData.muscleTargeted}
            onChange={handleChange('muscleTargeted')}
          />

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontFamily: 'var(--font-family)', fontSize: '14px', color: 'var(--color-text-second)', marginBottom: '8px', fontWeight: 'bold' }}>
              Description & Instructions
            </label>
            <textarea
              value={formData.description}
              onChange={handleChange('description')}
              placeholder="Enter form instructions, sets, and rep ranges..."
              style={{
                width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #E0E0E0',
                backgroundColor: '#F9F9F9', fontFamily: 'var(--font-family)', fontSize: '16px',
                minHeight: '120px', resize: 'vertical', outline: 'none'
              }}
            />
          </div>

          <div style={{ marginTop: '20px' }}>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Uploading...' : 'Save Exercise'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWorkoutPage;
