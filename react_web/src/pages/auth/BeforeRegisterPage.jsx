import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { showToast } from '../../utils/custom';
import Button from '../../components/Button';
import Logo from '../../assets/images/nav.png';
import BrandLogo from '../../assets/images/Power_Pulse.png';
import TraineeIcon from '../../assets/images/trainee.jpeg';
import TrainerIcon from '../../assets/images/trainer.jpeg';
import styles from './Auth.module.css';

const BeforeRegisterPage = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);

  const handleContinue = () => {
    if (selectedRole === 'trainee') {
      navigate('/register/trainee');
    } else if (selectedRole === 'trainer') {
      navigate('/register/trainer');
    }
  };

  return (
    <div className={styles.authLayout}>
      {/* Decorative Left Panel */}
      <div className={styles.decorativePanel}>
        <span className={`material-icons ${styles.floatingIcon} ${styles.floatingIcon1}`}>fitness_center</span>
        <span className={`material-icons ${styles.floatingIcon} ${styles.floatingIcon2}`}>monitor_heart</span>
        <span className={`material-icons ${styles.floatingIcon} ${styles.floatingIcon3}`}>sports_gymnastics</span>
        <span className={`material-icons ${styles.floatingIcon} ${styles.floatingIcon4}`}>sports_martial_arts</span>
        <img src={BrandLogo} alt="Power Pulse" className={styles.brandLogo} />
        <p className={styles.brandTagline}>Begin Your Journey</p>
      </div>

      {/* Form Panel */}
      <div className={styles.formPanel}>
        <div className={styles.formCard}>
          <img src={Logo} alt="Power Pulse" className={styles.navLogo} />

          <div className={styles.headerArea}>
            <h1 className={styles.heading}>
              Create <span className={styles.headingGradient}>Account</span>
            </h1>
            <p className={styles.subtitle}>
              Already have an account?{' '}
              <Link to="/login" className={styles.linkText}>Sign in!</Link>
            </p>
          </div>

          <p className={styles.subtitle} style={{ marginTop: 0, marginBottom: '8px', fontSize: '14px' }}>
            Choose your role to get started
          </p>

          <div className={styles.cardRow}>
            {/* Trainer Card */}
            <div
              className={`${styles.roleCard} ${selectedRole === 'trainer' ? styles.active : ''}`}
              onClick={() => setSelectedRole('trainer')}
            >
              <img src={TrainerIcon} alt="Trainer" />
              <span className={styles.roleText}>Trainer</span>
              <span className={styles.roleDesc}>Give power and manage workouts</span>
            </div>

            {/* Trainee Card */}
            <div
              className={`${styles.roleCard} ${selectedRole === 'trainee' ? styles.active : ''}`}
              onClick={() => setSelectedRole('trainee')}
            >
              <img src={TraineeIcon} alt="Trainee" />
              <span className={styles.roleText}>Trainee</span>
              <span className={styles.roleDesc}>Get power and receive guidance</span>
            </div>
          </div>

          <div className={styles.submitArea} style={{ marginTop: '32px' }}>
            <Button
              onClick={handleContinue}
              disabled={!selectedRole}
              className={styles.loginBtn}
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeforeRegisterPage;
