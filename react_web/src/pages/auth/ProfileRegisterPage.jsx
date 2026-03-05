import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { Typography, showToast } from '../../utils/custom';
import Logo from '../../assets/images/nav.png';
import styles from './Auth.module.css';

const ProfileRegisterPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const baseData = location.state?.registerData;

  const [formData, setFormData] = useState({
    experience: '',
    specialization: ''
  });

  if (!baseData) {
    navigate('/register/trainer');
    return null;
  }

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!formData.experience || !formData.specialization) {
      showToast('Please fill in all fields', true);
      return;
    }

    navigate('/register/trainer/business', {
      state: {
        registerData: { ...baseData, ...formData }
      }
    });
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.scrollContent}>
        <img src={Logo} alt="Power Pulse" className={styles.navLogo} />

        <div className={styles.headerArea}>
          {Typography.mainText('Profile Setup (2/3)')}
          <p className={styles.subtitle}>
            Tell us about your training experience.
          </p>
        </div>

        <form onSubmit={handleNext} className={styles.formArea}>
          <TextField
            label="Years of Experience"
            placeholder="e.g. 5"
            icon="work_outline"
            type="number"
            value={formData.experience}
            onChange={handleChange('experience')}
          />
          <div className={styles.spacer}></div>
          <TextField
            label="Specialization"
            placeholder="e.g. Bodybuilding, Weight Loss"
            icon="star_outline"
            value={formData.specialization}
            onChange={handleChange('specialization')}
          />

          <div className={styles.submitArea} style={{ marginTop: '40px' }}>
            <Button onClick={handleNext} className={styles.loginBtn}>
              Final Step
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileRegisterPage;
