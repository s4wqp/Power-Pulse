import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { Typography, showToast } from '../../utils/custom';
import Logo from '../../assets/images/nav.png';
import styles from './Auth.module.css';

const TraineeRegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      showToast('Please fill in all fields', true);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match', true);
      return;
    }

    // Pass data to next step
    navigate('/register/trainee/height-weight', { state: { registerData: formData } });
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.scrollContent}>
        <img src={Logo} alt="Power Pulse" className={styles.navLogo} />

        <div className={styles.headerArea}>
          {Typography.mainText('Register As')}
          {Typography.mainText('a Trainee')}
          <p className={styles.subtitle}>
            If you have an account already<br />
            You can{' '}
            <Link to="/login" className={styles.linkText}>Sign in !</Link>
          </p>
        </div>

        <form onSubmit={handleNext} className={styles.formArea}>
          <TextField
            label="Name"
            placeholder="Enter your Name"
            icon="person_outline"
            value={formData.name}
            onChange={handleChange('name')}
          />
          <div className={styles.spacer}></div>
          <TextField
            label="Email"
            placeholder="Enter your email address"
            icon="email"
            value={formData.email}
            onChange={handleChange('email')}
          />
          <div className={styles.spacer}></div>
          <TextField
            label="Phone Number"
            placeholder="Enter your Phone Number"
            icon="phone"
            value={formData.phone}
            onChange={handleChange('phone')}
          />
          <div className={styles.spacer}></div>
          <TextField
            label="Password"
            placeholder="Enter your Password"
            type="password"
            icon="lock_outline"
            value={formData.password}
            onChange={handleChange('password')}
          />
          <div className={styles.spacer}></div>
          <TextField
            label="Confirm Password"
            placeholder="Re-enter your Password"
            type="password"
            icon="lock_outline"
            value={formData.confirmPassword}
            onChange={handleChange('confirmPassword')}
          />

          <div className={styles.submitArea} style={{ marginTop: '40px' }}>
            <Button onClick={handleNext} className={styles.loginBtn}>
              Next Step
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TraineeRegisterPage;
