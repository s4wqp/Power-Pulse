import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { Typography, showToast } from '../../utils/custom';
import styles from './Auth.module.css';

const VerifyResetCodePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const [code, setCode] = useState('');

  if (!email) {
    navigate('/forgot-password');
    return null;
  }

  const handleVerify = (e) => {
    e.preventDefault();
    if (code.length < 4) {
      showToast('Please enter the full code', true);
      return;
    }
    // Simulate verify
    navigate('/reset-password', { state: { email, code } });
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.scrollContent}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', marginTop: '20px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <span className="material-icons" style={{ fontSize: '28px' }}>arrow_back_ios</span>
          </button>
        </div>

        <div className={styles.headerArea}>
          {Typography.mainText('OTP Verification')}
          <p className={styles.subtitle}>
            Enter the verification code we just sent to your email address {email}.
          </p>
        </div>

        <form onSubmit={handleVerify} className={styles.formArea}>
          <TextField
            label="Verification Code"
            placeholder="Enter code (e.g. 1234)"
            icon="password"
            type="number"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          <div className={styles.submitArea} style={{ marginTop: '40px' }}>
            <Button onClick={handleVerify} className={styles.loginBtn}>
              Verify
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyResetCodePage;
