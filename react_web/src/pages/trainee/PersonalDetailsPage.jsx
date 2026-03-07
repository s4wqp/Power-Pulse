import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import useTraineeStore from '../../stores/traineeStore';
import WebLayout from '../../components/WebLayout';
import CachedImage from '../../components/CachedImage';
import { showToast } from '../../utils/custom';
import styles from '../../components/WebLayout.module.css';

const PersonalDetailsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { trainee, updateProfile, fetchProfile, isLoading } = useTraineeStore();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });

  useEffect(() => {
    if (user?.id && !trainee) fetchProfile(user.id);
  }, [user?.id, trainee, fetchProfile]);

  useEffect(() => {
    if (trainee) {
      setFormData({
        name: trainee.name || user?.fullName || '',
        phone: trainee.phone || '',
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
    <WebLayout title="Personal Details" subtitle="Update your profile information">
      <div style={{ maxWidth: '700px' }}>
        {/* Form */}
        <div className={styles.card}>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#8a92a6', display: 'block', marginBottom: '8px' }}>Name</label>
              <input className={styles.formInput} value={formData.name} onChange={handleChange('name')} style={{ width: '100%', boxSizing: 'border-box', background: '#f5f6f8', border: 'none', borderRadius: '8px', padding: '14px 16px', fontSize: '15px', fontWeight: '600', color: '#1a1a2e' }} />
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: '1' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#8a92a6', display: 'block', marginBottom: '8px' }}>Country</label>
                <div style={{ background: '#f5f6f8', borderRadius: '8px', padding: '14px 16px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: '#1a1a2e' }}>+20</span>
                </div>
              </div>
              <div style={{ flex: '2' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#8a92a6', display: 'block', marginBottom: '8px' }}>Mobile Number</label>
                <input className={styles.formInput} value={formData.phone} onChange={handleChange('phone')} style={{ width: '100%', boxSizing: 'border-box', background: '#f5f6f8', border: 'none', borderRadius: '8px', padding: '14px 16px', fontSize: '15px', fontWeight: '600', color: '#1a1a2e' }} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#8a92a6', display: 'block', marginBottom: '8px' }}>Email Addresses</label>
              <input className={styles.formInput} value={trainee?.email || user?.email || ''} readOnly style={{ width: '100%', boxSizing: 'border-box', background: '#f5f6f8', border: 'none', borderRadius: '8px', padding: '14px 16px', fontSize: '15px', fontWeight: '600', color: '#1a1a2e' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
              <button type="submit" className={styles.btnPrimary} disabled={isLoading} style={{ width: '180px', justifyContent: 'center', padding: '14px', borderRadius: '25px', background: '#17A073', color: 'white', fontWeight: '700', fontSize: '16px' }}>
                {isLoading ? (
                  <><div className={styles.spinner} style={{ width: '18px', height: '18px', borderWidth: '2px', borderColor: 'white #ffffff4d #ffffff4d #ffffff4d' }} /> Saving</>
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </WebLayout>
  );
};

export default PersonalDetailsPage;
