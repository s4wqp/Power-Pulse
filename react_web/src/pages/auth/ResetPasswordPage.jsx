import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { showToast } from '../../utils/custom';
import styles from './Auth.module.css';

const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!email) {
    navigate('/forgot-password');
    return null;
  }

  const handleReset = (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      showToast('Please fill in both fields', true);
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match', true);
      return;
    }

    showToast('Password reset successfully!');
    navigate('/login', { replace: true });
  };

  return (
    <div className={styles.centeredLayout}>
      <div className={styles.formCard}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <span className="material-icons" style={{ fontSize: '20px' }}>arrow_back_ios</span>
        </button>

        <div className={styles.headerArea}>
          <h1 className={styles.heading}>
            New <span className={styles.headingGradient}>Password</span>
          </h1>
          <p className={styles.subtitle}>
            Your new password must be unique from those previously used.
          </p>
        </div>

        <form onSubmit={handleReset} className={styles.formArea}>
          <TextField
            label="New Password"
            placeholder="Enter your new password"
            icon="lock_outline"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            dark
          />
          <div className={styles.spacer}></div>
          <TextField
            label="Confirm Password"
            placeholder="Re-enter your new password"
            icon="lock_outline"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            dark
          />

          <div className={styles.submitArea} style={{ marginTop: '32px' }}>
            <Button onClick={handleReset} className={styles.loginBtn}>
              Reset Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
