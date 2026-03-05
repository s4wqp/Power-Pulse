import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import { Typography } from '../../utils/custom';
import styles from './Trainee.module.css';

const TransactionSuccessPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.pageContainer} style={{ justifyContent: 'center', alignItems: 'center', padding: '40px 20px' }}>
      <div style={{
        width: '120px', height: '120px', borderRadius: '60px',
        backgroundColor: 'rgba(23, 160, 115, 0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '30px'
      }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '40px',
          backgroundColor: 'var(--color-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <span className="material-icons" style={{ color: 'white', fontSize: '48px' }}>check</span>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        {Typography.mainText('Payment Successful!')}
        <p style={{ color: 'var(--color-text-second)', marginTop: '16px', lineHeight: '1.5' }}>
          Your order has been successfully placed. You can track its status in the Orders section.
        </p>
      </div>

      <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Button onClick={() => navigate('/trainee/orders', { replace: true })}>
          View Orders
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/trainee/home', { replace: true })}
          style={{ backgroundColor: '#F5F5F5', border: 'none' }}
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default TransactionSuccessPage;
