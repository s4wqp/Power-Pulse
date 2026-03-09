import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import Button from '../../components/Button';
import { showToast } from '../../utils/custom';
import styles from './Auth.module.css';

const HeightWeightPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const registerData = location.state?.registerData;
  const { registerTrainee, isLoading } = useAuthStore();

  // Step 1 = Weight, Step 2 = Height (matching mobile flow)
  const [step, setStep] = useState(1);

  // Weight state
  const [weight, setWeight] = useState(70);
  const [weightUnit, setWeightUnit] = useState('kg');

  // Height state
  const [height, setHeight] = useState(170);
  const [heightUnit, setHeightUnit] = useState('cm');

  if (!registerData) {
    navigate('/register/trainee');
    return null;
  }

  const convertWeight = (newUnit) => {
    if (newUnit === weightUnit) return;
    if (newUnit === 'lb') {
      setWeight(Math.round(weight * 2.20462));
    } else {
      setWeight(Math.round(weight * 0.453592));
    }
    setWeightUnit(newUnit);
  };

  const convertHeight = (newUnit) => {
    if (newUnit === heightUnit) return;
    if (newUnit === 'inches') {
      setHeight(Math.round(height * 0.393701));
    } else {
      setHeight(Math.round(height * 2.54));
    }
    setHeightUnit(newUnit);
  };

  const handleRegister = async () => {
    const payload = {
      name: registerData.name,
      email: registerData.email,
      phone: registerData.phone,
      password: registerData.password,
      confirmPassword: registerData.confirmPassword,
      weight: weightUnit === 'kg' ? weight : Math.round(weight * 0.453592),
      height: heightUnit === 'cm' ? height : Math.round(height * 2.54),
    };

    const success = await registerTrainee(payload);
    if (success) {
      showToast('Registration successful!');
      navigate('/trainee/home', { replace: true });
    } else {
      showToast(useAuthStore.getState().error || 'Registration failed', true);
    }
  };

  const getWeightRange = () => weightUnit === 'kg' ? { min: 30, max: 200 } : { min: 66, max: 440 };
  const getHeightRange = () => heightUnit === 'cm' ? { min: 100, max: 250 } : { min: 40, max: 100 };

  const renderRulerPicker = (value, range, unit, onDecrease, onIncrease) => (
    <div className={styles.selectorRow} style={{ flexDirection: 'column', alignItems: 'center', padding: '40px 20px', borderRadius: '24px' }}>
      <span style={{ fontSize: '64px', fontWeight: '800', color: '#ffffff', fontFamily: 'var(--font-family)' }}>
        {value}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginTop: '24px' }}>
        <button
          type="button"
          className={`${styles.selectorBtn} ${styles.selectorBtnMinus}`}
          style={{ width: '48px', height: '48px' }}
          onClick={onDecrease}
        >−</button>
        <div style={{ width: '120px', height: '2px', background: 'rgba(255,255,255,0.15)', position: 'relative' }}>
          <div style={{
            position: 'absolute', top: '-4px', left: '50%', transform: 'translateX(-50%)',
            width: '2px', height: '10px', background: '#17A073'
          }}></div>
        </div>
        <button
          type="button"
          className={`${styles.selectorBtn} ${styles.selectorBtnPlus}`}
          style={{ width: '48px', height: '48px' }}
          onClick={onIncrease}
        >+</button>
      </div>
      <span style={{ fontSize: '16px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', marginTop: '12px' }}>{unit}</span>
    </div>
  );

  const renderUnitToggle = (current, options, onToggle) => (
    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onToggle(opt)}
          style={{
            padding: '10px 28px',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-family)',
            fontWeight: '700',
            fontSize: '14px',
            transition: 'all 0.2s ease',
            borderRadius: '24px',
            background: current === opt ? '#17A073' : 'transparent',
            color: current === opt ? '#ffffff' : 'rgba(255,255,255,0.35)',
          }}
        >{opt}</button>
      ))}
    </div>
  );

  // Progress bar matching mobile
  const renderProgressBar = () => (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '32px' }}>
      {[1, 2].map(s => (
        <div key={s} style={{
          width: '40px', height: '4px', borderRadius: '2px',
          background: s === step ? '#17A073' : 'rgba(255,255,255,0.1)',
          transition: 'background 0.3s ease',
        }}></div>
      ))}
    </div>
  );

  return (
    <div className={styles.centeredLayout}>
      <div className={styles.formCard} style={{ maxWidth: '520px', textAlign: 'center' }}>
        {renderProgressBar()}

        <h1 className={styles.heading} style={{ textAlign: 'center', marginBottom: '24px' }}>
          What is your<br />
          <span className={styles.headingGradient}>{step === 1 ? 'weight?' : 'height?'}</span>
        </h1>

        {step === 1 ? (
          <>
            {renderUnitToggle(weightUnit, ['kg', 'lb'], convertWeight)}
            <div style={{ marginTop: '32px' }}>
              {renderRulerPicker(
                weight,
                getWeightRange(),
                weightUnit,
                () => setWeight(Math.max(getWeightRange().min, weight - 1)),
                () => setWeight(Math.min(getWeightRange().max, weight + 1))
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', alignItems: 'center' }}>
              <button className={styles.backBtn} onClick={() => navigate(-1)} style={{ margin: 0 }}>
                <span className="material-icons" style={{ fontSize: '20px' }}>arrow_back_ios_new</span>
              </button>
              <Button onClick={() => setStep(2)} className={styles.loginBtn} style={{ width: 'auto', padding: '14px 40px' }}>
                Next
              </Button>
            </div>
          </>
        ) : (
          <>
            {renderUnitToggle(heightUnit, ['inches', 'cm'], convertHeight)}
            <div style={{ marginTop: '32px' }}>
              {renderRulerPicker(
                height,
                getHeightRange(),
                heightUnit,
                () => setHeight(Math.max(getHeightRange().min, height - 1)),
                () => setHeight(Math.min(getHeightRange().max, height + 1))
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', alignItems: 'center' }}>
              <button className={styles.backBtn} onClick={() => setStep(1)} style={{ margin: 0 }}>
                <span className="material-icons" style={{ fontSize: '20px' }}>arrow_back_ios_new</span>
              </button>
              <Button onClick={handleRegister} disabled={isLoading} className={styles.loginBtn} style={{ width: 'auto', padding: '14px 40px' }}>
                {isLoading ? 'Creating...' : 'start now'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HeightWeightPage;
