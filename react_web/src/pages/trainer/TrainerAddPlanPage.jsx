import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import useTrainerStore from '../../stores/trainerStore';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { showToast } from '../../utils/custom';
import styles from './Trainer.module.css';

const TrainerAddPlanPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addTrainerPlan, isLoading } = useTrainerStore();

  const [formData, setFormData] = useState({
    name: '',
    durationInMonths: '1',
    price: ''
  });

  const handleChange = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.durationInMonths || !formData.price) {
      showToast('Please fill all fields', true);
      return;
    }

    if (user?.id) {
      const payload = {
        trainerId: user.id,
        name: formData.name,
        durationInMonths: parseInt(formData.durationInMonths, 10),
        price: parseFloat(formData.price)
      };

      const success = await addTrainerPlan(payload);

      if (success) {
        showToast('Plan created successfully!');
        navigate(-1);
      } else {
        showToast('Failed to create plan.', true);
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
          <span style={{ fontSize: '20px', fontWeight: 'bold' }}>Create New Plan</span>
        </div>
      </div>

      <div className={styles.scrollContent}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
          <TextField
            label="Plan Name"
            placeholder="e.g. VIP Transformation"
            value={formData.name}
            onChange={handleChange('name')}
          />

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontFamily: 'var(--font-family)', fontSize: '14px', color: 'var(--color-text-second)', marginBottom: '8px', fontWeight: 'bold' }}>
              Duration (Months)
            </label>
            <select
              value={formData.durationInMonths}
              onChange={handleChange('durationInMonths')}
              style={{
                padding: '16px', borderRadius: '12px', border: '1px solid #E0E0E0',
                backgroundColor: '#F9F9F9', fontFamily: 'var(--font-family)', fontSize: '16px',
                outline: 'none', appearance: 'none'
              }}
            >
              <option value="1">1 Month</option>
              <option value="3">3 Months</option>
              <option value="6">6 Months</option>
              <option value="12">12 Months (1 Year)</option>
            </select>
          </div>

          <TextField
            label="Price (EGP)"
            type="number"
            placeholder="e.g. 1500"
            value={formData.price}
            onChange={handleChange('price')}
          />

          <div style={{ marginTop: '40px' }}>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrainerAddPlanPage;
