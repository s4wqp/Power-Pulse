import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Typography, CustomColors } from '../../utils/custom';
import Button from '../../components/Button';
import Logo from '../../assets/images/nav.png';
import TraineeIcon from '../../assets/images/trainee.jpeg';
import TrainerIcon from '../../assets/images/trainer.jpeg';
import styles from './Auth.module.css';

const BeforeRegisterPage = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null); // 'trainee' | 'trainer'

  const handleContinue = () => {
    if (selectedRole === 'trainee') {
      navigate('/register/trainee');
    } else if (selectedRole === 'trainer') {
      navigate('/register/trainer');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.scrollContent}>
        <img src={Logo} alt="Power Pulse" className={styles.navLogo} />

        <div className={styles.headerArea} style={{ marginBottom: '20px' }}>
          {Typography.mainText('Registers')}
          <p className={styles.subtitle}>
            If you have an account already<br />
            You can{' '}
            <Link to="/login" className={styles.linkText}>Sign in !</Link>
          </p>
        </div>

        <div className={styles.cardRow}>
          {/* Trainer Card */}
          <div
            className={`${styles.roleCard} ${selectedRole === 'trainer' ? styles.active : ''}`}
            onClick={() => setSelectedRole('trainer')}
            style={{ border: selectedRole === 'trainer' ? 'none' : '1px solid #E0E0E0' }}
          >
            <img
              src={TrainerIcon}
              alt="Trainer"
              style={{ borderRadius: '50%' }}
            />
            <span className={styles.roleText}>Trainer</span>
            <span className={styles.roleDesc}>Give power and manage workouts</span>
          </div>

          {/* Trainee Card */}
          <div
            className={`${styles.roleCard} ${selectedRole === 'trainee' ? styles.active : ''}`}
            onClick={() => setSelectedRole('trainee')}
            style={{ border: selectedRole === 'trainee' ? 'none' : '1px solid #E0E0E0' }}
          >
            <img
              src={TraineeIcon}
              alt="Trainee"
              style={{ borderRadius: '50%' }}
            />
            <span className={styles.roleText}>Trainee</span>
            <span className={styles.roleDesc}>Get power and receive guidance</span>
          </div>
        </div>

        <div className={styles.submitArea} style={{ marginTop: '60px' }}>
          <Button
            onClick={handleContinue}
            disabled={!selectedRole}
            className={styles.loginBtn}
          >
            Create an Account
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BeforeRegisterPage;
