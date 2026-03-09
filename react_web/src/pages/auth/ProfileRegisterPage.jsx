import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { showToast } from '../../utils/custom';
import Logo from '../../assets/images/nav.png';
import styles from './Auth.module.css';

const SPECIALIZATION_OPTIONS = [
  'Weight Loss',
  'Strength Training',
  'Bodybuilding',
  'Rehabilitation',
  'Senior Fitness',
  'Yoga',
  'Athletic Performance',
];

const ProfileRegisterPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const baseData = location.state?.registerData;

  const [professionalTitle, setProfessionalTitle] = useState('');
  const [experience, setExperience] = useState('');
  const [selectedSpecializations, setSelectedSpecializations] = useState([]);
  const [otherSpecialization, setOtherSpecialization] = useState('');

  if (!baseData) {
    navigate('/register/trainer');
    return null;
  }

  const toggleSpecialization = (spec) => {
    setSelectedSpecializations(prev =>
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    );
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!professionalTitle || !experience) {
      showToast('Please fill in required fields', true);
      return;
    }

    navigate('/register/trainer/business', {
      state: {
        registerData: {
          ...baseData,
          professionalTitle,
          experience,
          specializations: selectedSpecializations,
          otherSpecialization,
        }
      }
    });
  };

  return (
    <div className={styles.centeredLayout}>
      <div className={styles.formCard} style={{ maxWidth: '520px' }}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <span className="material-icons" style={{ fontSize: '20px' }}>arrow_back</span>
        </button>

        <div className={styles.headerArea}>
          <h1 className={styles.heading}>
            <span className={styles.headingGradient}>Profile</span>
          </h1>
          <p className={styles.subtitle}>Your Profile</p>
        </div>

        <form onSubmit={handleNext} className={styles.formArea}>
          <TextField
            label="Professional Title"
            placeholder='Example: "Certified Personal Trainer..."'
            icon="work_outline"
            value={professionalTitle}
            onChange={(e) => setProfessionalTitle(e.target.value)}
            dark
          />
          <div className={styles.spacer}></div>

          <TextField
            label="Years of Experience"
            placeholder=""
            icon="calendar_today"
            type="number"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            dark
          />
          <div style={{ height: '24px' }}></div>

          {/* Specialization Checkboxes */}
          <label className={styles.selectorLabel}>Areas of Specialization</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px', marginTop: '12px' }}>
            {SPECIALIZATION_OPTIONS.map(spec => (
              <label
                key={spec}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.8)', fontFamily: 'var(--font-family)', fontSize: '14px',
                  fontWeight: '500', minWidth: '160px',
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedSpecializations.includes(spec)}
                  onChange={() => toggleSpecialization(spec)}
                  style={{ width: '18px', height: '18px', accentColor: '#17A073', cursor: 'pointer' }}
                />
                {spec}
              </label>
            ))}
          </div>

          <div style={{ height: '20px' }}></div>
          <TextField
            label="Other"
            placeholder=""
            value={otherSpecialization}
            onChange={(e) => setOtherSpecialization(e.target.value)}
            dark
          />

          <div className={styles.submitArea} style={{ marginTop: '32px' }}>
            <Button onClick={handleNext} className={styles.loginBtn}>
              Next
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileRegisterPage;
