import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import useTraineeStore from '../../stores/traineeStore';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { showToast } from '../../utils/custom';
import styles from './Trainee.module.css';

const PersonalDetailsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { trainee, updateProfile, fetchProfile, isLoading } = useTraineeStore();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    weight: '',
    height: '',
    targetWeight: '',
    age: ''
  });

  useEffect(() => {
    if (user?.id && !trainee) {
      fetchProfile(user.id);
    }
  }, [user?.id, trainee, fetchProfile]);

  useEffect(() => {
    if (trainee) {
      setFormData({
        name: trainee.name || user?.fullName || '',
        phone: trainee.phone || '',
        weight: trainee.weight?.toString() || '',
        height: trainee.height?.toString() || '',
        targetWeight: trainee.targetWeight?.toString() || '',
        age: trainee.age?.toString() || ''
      });
    }
  }, [trainee, user]);

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (user?.id) {
      const payload = {
        ...formData,
        weight: parseFloat(formData.weight) || 0,
        height: parseFloat(formData.height) || 0,
        targetWeight: parseFloat(formData.targetWeight) || 0,
        age: parseInt(formData.age, 10) || 0
      };
      const success = await updateProfile(user.id, payload);
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
          <span style={{ fontSize: '20px', fontWeight: 'bold' }}>Personal Details</span>
        </div>
      </div>

      <div className={styles.scrollContent}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <TextField
            label="Full Name"
            icon="person_outline"
            value={formData.name}
            onChange={handleChange('name')}
          />
          <TextField
            label="Phone Number"
            icon="phone"
            value={formData.phone}
            onChange={handleChange('phone')}
          />

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <TextField label="Age" type="number" value={formData.age} onChange={handleChange('age')} />
            </div>
            <div style={{ flex: 1 }}>
              <TextField label="Height (cm)" type="number" value={formData.height} onChange={handleChange('height')} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <TextField label="Weight (kg)" type="number" value={formData.weight} onChange={handleChange('weight')} />
            </div>
            <div style={{ flex: 1 }}>
              <TextField label="Target Weight" type="number" value={formData.targetWeight} onChange={handleChange('targetWeight')} />
            </div>
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

export default PersonalDetailsPage;
