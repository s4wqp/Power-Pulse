import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import { Typography } from '../../utils/custom';
import styles from './Trainee.module.css';

const TransactionSuccessPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.pageContainer} style={{ justifyContent: 'center', alignItems: 'center', padding: '40px 20px', backgroundColor: '#fff', position: 'relative' }}>

      {/* Animated SVG Checkmark Circle */}
      <div className={styles.successAnimationContainer}>
        <svg className={styles.checkmark} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
          <circle className={styles.checkmarkCircle} cx="26" cy="26" r="25" fill="none" />
          <path className={styles.checkmarkCheck} fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
        </svg>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: 'var(--color-primary)', fontSize: '28px', fontWeight: 'bold', margin: '0 0 12px 0', fontFamily: 'var(--font-family)' }}>Success!</h1>
        <p style={{ color: 'var(--color-text-second)', fontSize: '18px', margin: 0, fontFamily: 'var(--font-family)' }}>
          Transaction Confirmed
        </p>
      </div>

      <div style={{ width: '100%', maxWidth: '300px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'absolute', bottom: '60px', padding: '0 20px', boxSizing: 'border-box' }}>
        <Button onClick={() => navigate('/trainee/home', { replace: true })} style={{ padding: '16px', fontSize: '18px', borderRadius: '30px', boxShadow: '0 8px 16px rgba(23, 160, 115, 0.3)' }}>
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default TransactionSuccessPage;
