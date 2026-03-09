import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { showToast } from '../../utils/custom';
import Logo from '../../assets/images/nav.png';
import BrandLogo from '../../assets/images/Power_Pulse.png';
import styles from './Auth.module.css';

const TraineeRegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (field) => (e) => {
    // For phone: only allow digits, max 11
    if (field === 'phone') {
      const val = e.target.value.replace(/\D/g, '').slice(0, 11);
      setFormData({ ...formData, [field]: val });
      return;
    }
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleNext = (e) => {
    e.preventDefault();
    const { email, name, phone, password, confirmPassword } = formData;

    if (!email || !name || !phone || !password || !confirmPassword) {
      showToast('Please fill in all fields', true);
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      showToast('Please enter a valid email address', true);
      return;
    }
    if (phone.length !== 11) {
      showToast('Phone number must be exactly 11 digits', true);
      return;
    }
    if (password.length < 8) {
      showToast('Password must be at least 8 characters long', true);
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match', true);
      return;
    }

    navigate('/register/trainee/height-weight', { state: { registerData: formData } });
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
        <p className={styles.brandTagline}>Train Smarter</p>
      </div>

      {/* Form Panel */}
      <div className={styles.formPanel}>
        <div className={styles.formCard}>
          <img src={Logo} alt="Power Pulse" className={styles.navLogo} />

          <div className={styles.headerArea}>
            <h1 className={styles.heading}>
              Sign <span className={styles.headingGradient}>up</span>
            </h1>
            <p className={styles.subtitle}>
              If you already have an account login<br />
              You can{' '}
              <Link to="/login" className={styles.linkText}>Login here !</Link>
            </p>
          </div>

          <form onSubmit={handleNext} className={styles.formArea}>
            <TextField label="Email" placeholder="Enter your email address" icon="email" value={formData.email} onChange={handleChange('email')} dark />
            <div className={styles.spacer}></div>
            <TextField label="Username" placeholder="Enter your User name" icon="person_outline" value={formData.name} onChange={handleChange('name')} dark />
            <div className={styles.spacer}></div>
            <TextField label="Phone Number" placeholder="Enter your phone number" icon="phone" type="tel" value={formData.phone} onChange={handleChange('phone')} dark />
            <div className={styles.spacer}></div>
            <TextField label="Password" placeholder="Enter your Password" type="password" icon="lock_outline" value={formData.password} onChange={handleChange('password')} dark />
            <div className={styles.spacer}></div>
            <TextField label="Confirm Password" placeholder="Confirm your Password" type="password" icon="lock_outline" value={formData.confirmPassword} onChange={handleChange('confirmPassword')} dark />

            <div className={styles.submitArea} style={{ marginTop: '32px' }}>
              <Button onClick={handleNext} className={styles.loginBtn}>
                Next
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TraineeRegisterPage;
