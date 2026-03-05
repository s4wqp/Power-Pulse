import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { Typography, showToast } from '../../utils/custom';
import styles from './Auth.module.css';

const ForgetPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleSendCode = (e) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email', true);
      return;
    }
    // Simulate sending OTP
    showToast('Reset code sent to your email');
    navigate('/verify-code', { state: { email } });
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
          {Typography.mainText('Forgot Password?')}
          <p className={styles.subtitle}>
            Don't worry! It occurs. Please enter the email address linked with your account.
          </p>
        </div>

        <form onSubmit={handleSendCode} className={styles.formArea}>
          <TextField
            label="Email"
            placeholder="Enter your email address"
            icon="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className={styles.submitArea} style={{ marginTop: '40px' }}>
            <Button onClick={handleSendCode} className={styles.loginBtn}>
              Send Code
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgetPasswordPage;
