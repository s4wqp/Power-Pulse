import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { showToast } from '../../utils/custom';
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
    navigate('/reset-password', { state: { email, code } });
  };

  return (
    <div className={styles.centeredLayout}>
      <div className={styles.formCard}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <span className="material-icons" style={{ fontSize: '20px' }}>arrow_back_ios</span>
        </button>

        <div className={styles.headerArea}>
          <h1 className={styles.heading}>
            OTP <span className={styles.headingGradient}>Verification</span>
          </h1>
          <p className={styles.subtitle}>
            Enter the verification code we just sent to your email address <strong style={{ color: '#17A073' }}>{email}</strong>.
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
            dark
          />

          <div className={styles.submitArea} style={{ marginTop: '32px' }}>
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
