import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { Typography, showToast } from '../../utils/custom';
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

    // Simulate reset API call
    showToast('Password reset successfully!');
    navigate('/login', { replace: true });
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
          {Typography.mainText('Create new password')}
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
          />
          <div className={styles.spacer}></div>
          <TextField
            label="Confirm Password"
            placeholder="Re-enter your new password"
            icon="lock_outline"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <div className={styles.submitArea} style={{ marginTop: '40px' }}>
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
