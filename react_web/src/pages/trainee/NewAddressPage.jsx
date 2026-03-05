import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import useTraineeStore from '../../stores/traineeStore';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { showToast } from '../../utils/custom';
import styles from './Trainee.module.css';

const NewAddressPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addAddress, isLoading } = useTraineeStore();

  const [formData, setFormData] = useState({
    title: '',
    street: '',
    city: '',
    zip: ''
  });

  const handleChange = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.street || !formData.city) {
      showToast('Street and City are required', true);
      return;
    }

    if (user?.id) {
      const success = await addAddress(user.id, formData);
      if (success) {
        showToast('Address added successfully');
        navigate(-1);
      } else {
        showToast('Failed to add address', true);
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
          <span style={{ fontSize: '20px', fontWeight: 'bold' }}>New Address</span>
        </div>
      </div>

      <div className={styles.scrollContent}>
        {/* Map Placeholder */}
        <div style={{ width: '100%', height: '200px', backgroundColor: '#E0E0E0', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => navigate('/trainee/addresses/select')}>
          <div style={{ textAlign: 'center' }}>
            <span className="material-icons" style={{ fontSize: '32px', color: 'var(--color-gray)' }}>map</span>
            <div style={{ color: 'var(--color-text-second)', marginTop: '8px' }}>Tap to select on map</div>
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <TextField
            label="Address Title"
            placeholder="e.g. Home, Office"
            value={formData.title}
            onChange={handleChange('title')}
          />
          <TextField
            label="Street Address"
            placeholder="Enter street"
            value={formData.street}
            onChange={handleChange('street')}
          />
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <TextField
                label="City"
                placeholder="City"
                value={formData.city}
                onChange={handleChange('city')}
              />
            </div>
            <div style={{ flex: 1 }}>
              <TextField
                label="Zip Code"
                placeholder="Zip (Optional)"
                value={formData.zip}
                onChange={handleChange('zip')}
              />
            </div>
          </div>

          <div style={{ marginTop: '40px' }}>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Address'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewAddressPage;
