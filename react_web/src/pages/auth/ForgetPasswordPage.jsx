import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { showToast } from '../../utils/custom';
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
    showToast('Reset code sent to your email');
    navigate('/verify-code', { state: { email } });
  };

  return (
    <div className={styles.centeredLayout}>
      <div className={styles.formCard}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <span className="material-icons" style={{ fontSize: '20px' }}>arrow_back_ios</span>
        </button>

        <div className={styles.headerArea}>
          <h1 className={styles.heading}>
            Forgot <span className={styles.headingGradient}>Password?</span>
          </h1>
          <p className={styles.subtitle}>
            Don't worry! It happens. Please enter the email address linked with your account.
          </p>
        </div>

        <form onSubmit={handleSendCode} className={styles.formArea}>
          <TextField
            label="Email"
            placeholder="Enter your email address"
            icon="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            dark
          />

          <div className={styles.submitArea} style={{ marginTop: '32px' }}>
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
