import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import Button from '../../components/Button';
import { Typography, showToast } from '../../utils/custom';
import styles from './Auth.module.css';

const HeightWeightPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const registerData = location.state?.registerData;
  const { registerTrainee, isLoading } = useAuthStore();

  const [weight, setWeight] = useState(60);
  const [height, setHeight] = useState(170);
  const [targetWeight, setTargetWeight] = useState(65);
  const [gender, setGender] = useState('Male');

  if (!registerData) {
    navigate('/register/trainee');
    return null;
  }

  const handleRegister = async () => {
    const payload = {
      name: registerData.name,
      email: registerData.email,
      phone: registerData.phone,
      password: registerData.password,
      confirmPassword: registerData.confirmPassword,
      weight: parseFloat(weight),
      height: parseFloat(height),
      targetWeight: parseFloat(targetWeight),
      gender: gender,
      role: 'Trainee'
    };

    const success = await registerTrainee(payload);
    if (success) {
      showToast('Registration successful!');
      navigate('/trainee/home', { replace: true });
    } else {
      showToast(useAuthStore.getState().error || 'Registration failed', true);
    }
  };

  const renderSelector = (title, value, min, max, unit, setter) => (
    <div style={{ marginBottom: '24px' }}>
      <label style={{ fontFamily: 'var(--font-family)', fontSize: '18px', fontWeight: 'bold' }}>
        {title}
      </label>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F5F5F5', borderRadius: '12px', padding: '16px', marginTop: '8px' }}>
        <button type="button" onClick={() => setter(Math.max(min, value - 1))} style={{ width: '40px', height: '40px', borderRadius: '20px', border: 'none', background: '#E0E0E0', fontSize: '20px', cursor: 'pointer' }}>-</button>
        <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{value} <span style={{ fontSize: '14px', color: '#666' }}>{unit}</span></span>
        <button type="button" onClick={() => setter(Math.min(max, value + 1))} style={{ width: '40px', height: '40px', borderRadius: '20px', border: 'none', background: 'var(--color-primary)', color: 'white', fontSize: '20px', cursor: 'pointer' }}>+</button>
      </div>
    </div>
  );

  return (
    <div className={styles.pageContainer}>
      <div className={styles.scrollContent}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <span className="material-icons" style={{ fontSize: '28px' }}>arrow_back_ios</span>
          </button>
          <span style={{ fontSize: '20px', fontWeight: 'bold', marginLeft: '10px' }}>Personal Info</span>
        </div>

        <div style={{ marginBottom: '30px' }}>
          {Typography.mainText('Let\'s know more')}
          {Typography.mainText('about you')}
          <p className={styles.subtitle}>Help us tailor your fitness journey.</p>
        </div>

        {/* Gender Selection */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontFamily: 'var(--font-family)', fontSize: '18px', fontWeight: 'bold', display: 'block', marginBottom: '12px' }}>
            Gender
          </label>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button
              onClick={() => setGender('Male')}
              style={{ flex: 1, padding: '16px', borderRadius: '12px', border: gender === 'Male' ? 'none' : '1px solid #E0E0E0', background: gender === 'Male' ? 'var(--color-primary)' : 'white', color: gender === 'Male' ? 'white' : 'black', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Male
            </button>
            <button
              onClick={() => setGender('Female')}
              style={{ flex: 1, padding: '16px', borderRadius: '12px', border: gender === 'Female' ? 'none' : '1px solid #E0E0E0', background: gender === 'Female' ? 'var(--color-primary)' : 'white', color: gender === 'Female' ? 'white' : 'black', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Female
            </button>
          </div>
        </div>

        {renderSelector('Height', height, 100, 250, 'cm', setHeight)}
        {renderSelector('Weight', weight, 30, 200, 'kg', setWeight)}
        {renderSelector('Target Weight', targetWeight, 30, 200, 'kg', setTargetWeight)}

        <div className={styles.submitArea} style={{ marginTop: '40px' }}>
          <Button onClick={handleRegister} disabled={isLoading} className={styles.loginBtn}>
            {isLoading ? 'Creating Account...' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeightWeightPage;
