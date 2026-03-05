import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { Typography, showToast } from '../../utils/custom';
import Logo from '../../assets/images/nav.png';
import styles from './Auth.module.css';

const BusinessRegisterPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const registerData = location.state?.registerData;
  const { registerTrainer, isLoading } = useAuthStore();

  const [price, setPrice] = useState('');

  if (!registerData) {
    navigate('/register/trainer');
    return null;
  }

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!price) {
      showToast('Please set your monthly price', true);
      return;
    }

    const payload = {
      ...registerData,
      role: 'Trainer',
      certificates: []
    };

    const success = await registerTrainer(payload);
    if (success) {
      showToast('Trainer account created successfully!');
      navigate('/trainer/home', { replace: true });
    } else {
      showToast(useAuthStore.getState().error || 'Registration failed', true);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.scrollContent}>
        <img src={Logo} alt="Power Pulse" className={styles.navLogo} />

        <div className={styles.headerArea}>
          {Typography.mainText('Business Setup (3/3)')}
          <p className={styles.subtitle}>
            Set your subscription price.
          </p>
        </div>

        <form onSubmit={handleRegister} className={styles.formArea}>
          <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid #E0E0E0', marginBottom: '20px' }}>
            <span style={{ fontSize: '14px', color: 'var(--color-text-second)' }}>Default Monthly Price</span>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
              <span style={{ fontSize: '24px', fontWeight: 'bold', marginRight: '10px' }}>EGP</span>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                style={{ fontSize: '24px', fontWeight: 'bold', border: 'none', background: 'transparent', outline: 'none', width: '100%' }}
              />
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-gray)' }}>You can add different subscription plans with custom prices from your dashboard later.</p>

          <div className={styles.submitArea} style={{ marginTop: '40px' }}>
            <Button onClick={handleRegister} disabled={isLoading} className={styles.loginBtn}>
              {isLoading ? 'Creating Account...' : 'Complete Registration'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusinessRegisterPage;
