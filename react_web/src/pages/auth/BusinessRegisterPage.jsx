import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import useAuthStore from '../../stores/authStore';
import { driveService } from '../../services/driveService';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { showToast } from '../../utils/custom';
import styles from './Auth.module.css';

const SPECIALIZATION_MAP = {
  'Weight Loss': 1,
  'Strength Training': 2,
  'Bodybuilding': 3,
  'Rehabilitation': 4,
  'Senior Fitness': 5,
  'Yoga': 6,
  'Athletic Performance': 7,
};

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 30 }, (_, i) => (currentYear - i).toString());

const BusinessRegisterPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const registerData = location.state?.registerData;
  const { registerTrainer, isLoading: storeLoading } = useAuthStore();

  const [about, setAbout] = useState('');
  const [certifications, setCertifications] = useState([
    { id: `cert-${Date.now()}`, name: '', organization: '', year: currentYear.toString(), file: null, previewUrl: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleToken, setGoogleToken] = useState(null);
  const fileInputRefs = useRef({});

  if (!registerData) {
    navigate('/register/trainer');
    return null;
  }

  const addCertificate = () => {
    setCertifications([
      ...certifications,
      { id: `cert-${Date.now()}`, name: '', organization: '', year: currentYear.toString(), file: null, previewUrl: '' }
    ]);
  };

  const updateCertificate = (id, field, value) => {
    setCertifications(certifications.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleCertificateFile = (id, e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setCertifications(certifications.map(c => c.id === id ? { ...c, file, previewUrl } : c));
    }
  };

  // Google login for Drive access
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      setGoogleToken(tokenResponse.access_token);
      submitRegistration(tokenResponse.access_token);
    },
    onError: (error) => {
      console.error('Google Login Failed', error);
      showToast('Google Sign-In failed. Cannot upload certificates.', true);
      setIsSubmitting(false);
    },
    scope: 'https://www.googleapis.com/auth/drive.file'
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    const hasFiles = certifications.some(c => c.file);

    if (hasFiles && import.meta.env.VITE_GOOGLE_CLIENT_ID === undefined) {
      showToast('Google Drive API not configured. Cannot upload files.', true);
      setIsSubmitting(false);
      return;
    }

    // If there are files to upload and no token yet, trigger Google Sign-In
    if (hasFiles && !googleToken) {
      login();
      return;
    }

    submitRegistration(googleToken);
  };

  const submitRegistration = async (token) => {
    try {
      // Build specialization IDs from the profile step
      const specializationIds = (registerData.specializations || [])
        .map(s => SPECIALIZATION_MAP[s])
        .filter(Boolean);

      if (specializationIds.length === 0) {
        specializationIds.push(1); // Default
      }

      // Upload certificate images to Google Drive and build list
      const certificatesList = [];
      for (const cert of certifications) {
        if (!cert.name.trim()) continue;

        let imageUrl = null;
        if (cert.file) {
          if (!token) {
            showToast('Missing Google Drive token. Please try again.', true);
            setIsSubmitting(false);
            return;
          }
          try {
            imageUrl = await driveService.uploadFileWithToken(cert.file, token);
          } catch (uploadErr) {
            console.error('Failed to upload certificate image:', uploadErr);
            showToast(`Failed to upload image for "${cert.name}": ${uploadErr.message}`, true);
            setIsSubmitting(false);
            return;
          }
        }

        certificatesList.push({
          certName: cert.name,
          issuer: cert.organization || null,
          year: parseInt(cert.year) || currentYear,
          imageUrl,
        });
      }

      const payload = {
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
        phone: registerData.phone,
        professionalTitle: registerData.professionalTitle || 'Personal Trainer',
        specializationIds,
        certificates: certificatesList,
        experienceYears: parseInt(registerData.experience?.replace(/\D/g, '')) || 0,
        bio: about,
        role: 'Trainer',
      };

      const success = await registerTrainer(payload);
      if (success) {
        showToast('Trainer account created successfully!');
        navigate('/trainer/home', { replace: true });
      } else {
        showToast(useAuthStore.getState().error || 'Registration failed', true);
      }
    } catch (err) {
      console.error(err);
      showToast('Registration failed: ' + err.message, true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.centeredLayout}>
      <div className={styles.formCard} style={{ maxWidth: '540px' }}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <span className="material-icons" style={{ fontSize: '20px' }}>arrow_back</span>
        </button>

        <div className={styles.headerArea}>
          <h1 className={styles.heading}>
            <span className={styles.headingGradient}>Business</span>
          </h1>
          <p className={styles.subtitle}>Your Business</p>
        </div>

        <form onSubmit={handleRegister} className={styles.formArea}>
          {/* About You */}
          <label className={styles.selectorLabel}>About you</label>
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder={'tell us your story, philosophy,\nand what makes you unique.'}
            rows={3}
            style={{
              width: '100%', padding: '14px 16px', borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.04)',
              fontSize: '14px', fontFamily: 'var(--font-family)', resize: 'vertical',
              color: '#ffffff', outline: 'none', boxSizing: 'border-box',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={e => e.target.style.borderColor = '#17A073'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />

          <div style={{ height: '28px' }}></div>

          {/* Certifications */}
          <label className={styles.selectorLabel} style={{ fontSize: '20px', marginBottom: '16px', display: 'block' }}>
            Certifications
          </label>

          {certifications.map((cert, index) => (
            <div key={cert.id} style={{ marginBottom: '20px' }}>
              {index > 0 && (
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '20px 0' }}></div>
              )}
              <p style={{
                color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-family)',
                fontSize: '14px', fontWeight: '500', marginBottom: '12px'
              }}>
                Certification information {index + 1}
              </p>

              {/* Image Upload Box */}
              <label style={{
                display: 'flex', width: '64px', height: '64px', borderRadius: '10px',
                border: cert.previewUrl ? '2px solid #17A073' : '2px dashed rgba(255,255,255,0.2)',
                overflow: 'hidden', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', backgroundColor: 'rgba(255,255,255,0.04)',
                marginBottom: '16px', transition: 'border-color 0.2s ease',
              }}>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  ref={el => fileInputRefs.current[cert.id] = el}
                  onChange={(e) => handleCertificateFile(cert.id, e)}
                />
                {cert.previewUrl ? (
                  <img
                    src={cert.previewUrl}
                    alt="cert preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span className="material-icons" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '24px' }}>add</span>
                )}
              </label>

              <TextField
                label="Name"
                placeholder=""
                value={cert.name}
                onChange={(e) => updateCertificate(cert.id, 'name', e.target.value)}
                dark
              />
              <div className={styles.spacer}></div>
              <TextField
                label="Organization"
                placeholder=""
                value={cert.organization}
                onChange={(e) => updateCertificate(cert.id, 'organization', e.target.value)}
                dark
              />
              <div className={styles.spacer}></div>

              {/* Year Dropdown */}
              <label style={{ fontSize: '14px', fontWeight: '600', color: 'rgba(255,255,255,0.8)', fontFamily: 'var(--font-family)', display: 'block', marginBottom: '6px' }}>
                Year
              </label>
              <div style={{ position: 'relative', width: '120px' }}>
                <select
                  value={cert.year}
                  onChange={(e) => updateCertificate(cert.id, 'year', e.target.value)}
                  style={{
                    width: '100%', padding: '10px 32px 10px 14px', borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.04)',
                    fontSize: '14px', color: '#ffffff', fontFamily: 'var(--font-family)',
                    outline: 'none', appearance: 'none', cursor: 'pointer',
                  }}
                >
                  {YEAR_OPTIONS.map(y => <option key={y} value={y} style={{ background: '#1a1a2e' }}>{y}</option>)}
                </select>
                <span className="material-icons" style={{
                  position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                  pointerEvents: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '20px'
                }}>keyboard_arrow_down</span>
              </div>
            </div>
          ))}

          {/* Add more */}
          <button
            type="button"
            onClick={addCertificate}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#17A073', fontFamily: 'var(--font-family)',
              fontWeight: '700', fontSize: '14px', padding: '0',
              marginTop: '8px',
            }}
          >
            <span className="material-icons" style={{ fontSize: '22px' }}>add_circle</span>
            Add more Certifications if found
          </button>

          <div className={styles.submitArea} style={{ marginTop: '32px' }}>
            <Button onClick={handleRegister} disabled={isSubmitting || storeLoading} className={styles.loginBtn}>
              {isSubmitting || storeLoading ? 'Creating Account...' : 'Next'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusinessRegisterPage;
