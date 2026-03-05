import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import useTrainerStore from '../../stores/trainerStore';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { showToast } from '../../utils/custom';
import styles from './Trainer.module.css';

const TrainerEditProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentTrainer, fetchTrainerDetails, updateTrainerProfile, isLoading } = useTrainerStore();

  const [formData, setFormData] = useState({
    bio: '',
    specialization: '',
    experience: ''
  });

  useEffect(() => {
    if (user?.id && !currentTrainer) {
      fetchTrainerDetails(user.id);
    }
  }, [user?.id, currentTrainer, fetchTrainerDetails]);

  useEffect(() => {
    if (currentTrainer) {
      setFormData({
        bio: currentTrainer.bio || '',
        specialization: currentTrainer.specialization || '',
        experience: currentTrainer.experience?.toString() || ''
      });
    }
  }, [currentTrainer]);

  const handleChange = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    if (user?.id) {
      const payload = {
        bio: formData.bio,
        specialization: formData.specialization,
        experience: parseInt(formData.experience, 10) || 0
      };
      const success = await updateTrainerProfile(user.id, payload);
      if (success) {
        showToast('Profile updated successfully!');
        navigate(-1);
      } else {
        showToast('Failed to update profile.', true);
      }
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.appBar}>
        <div className={styles.headerRow} style={{ marginBottom: 0 }}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <span className="material-icons">arrow_back_ios</span>
          </button>
          <span style={{ fontSize: '20px', fontWeight: 'bold' }}>Edit Profile Setup</span>
        </div>
      </div>

      <div className={styles.scrollContent}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <TextField
            label="Specialization"
            placeholder="e.g. Bodybuilding, Crossfit"
            value={formData.specialization}
            onChange={handleChange('specialization')}
          />
          <TextField
            label="Years of Experience"
            type="number"
            placeholder="e.g. 5"
            value={formData.experience}
            onChange={handleChange('experience')}
          />

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontFamily: 'var(--font-family)', fontSize: '14px', color: 'var(--color-text-second)', marginBottom: '8px', fontWeight: 'bold' }}>
              Biography
            </label>
            <textarea
              value={formData.bio}
              onChange={handleChange('bio')}
              placeholder="Tell potential clients about your background and training philosophy..."
              style={{
                width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #E0E0E0',
                backgroundColor: '#F9F9F9', fontFamily: 'var(--font-family)', fontSize: '16px',
                minHeight: '150px', resize: 'vertical', outline: 'none'
              }}
            />
          </div>

          <div style={{ marginTop: '40px' }}>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrainerEditProfilePage;
