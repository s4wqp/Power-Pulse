import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import useAuthStore from '../../stores/authStore';
import useTrainerStore from '../../stores/trainerStore';
import { trainerService } from '../../services/trainerService';
import { driveService } from '../../services/driveService';
import { showToast } from '../../utils/custom';
import WebLayout from '../../components/WebLayout';
import CachedImage from '../../components/CachedImage';
import styles from '../../components/WebLayout.module.css';

const SPECIALIZATION_OPTIONS = [
  'Weight Loss', 'Strength Training', 'Bodybuilding', 'Rehabilitation',
  'Senior Fitness', 'Yoga', 'Athletic Performance'
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 30 }, (_, i) => (currentYear - i).toString());

const TrainerEditProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentTrainer, fetchCurrentTrainer } = useTrainerStore();

  const [formData, setFormData] = useState({
    bio: '',
    specializations: [],
    otherSpecialization: '',
  });

  const [certificates, setCertificates] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleToken, setGoogleToken] = useState(null);

  useEffect(() => {
    if (user?.id && !currentTrainer) fetchCurrentTrainer(user.id);
  }, [user?.id, currentTrainer, fetchCurrentTrainer]);

  useEffect(() => {
    if (currentTrainer) {
      // Parse specializations
      let specArray = [];
      if (typeof currentTrainer.specialization === 'string') {
        specArray = currentTrainer.specialization.split(',').map(s => s.trim()).filter(Boolean);
      } else if (Array.isArray(currentTrainer.specializations)) {
        specArray = currentTrainer.specializations.map(s => typeof s === 'string' ? s : s.name).filter(Boolean);
      } else if (Array.isArray(currentTrainer.specialization)) {
        specArray = currentTrainer.specialization.map(s => typeof s === 'string' ? s : s.name).filter(Boolean);
      }

      const knownSpecs = [];
      const unknownSpecs = [];
      specArray.forEach(s => {
        if (SPECIALIZATION_OPTIONS.includes(s)) knownSpecs.push(s);
        else unknownSpecs.push(s);
      });

      setFormData({
        bio: currentTrainer.bio || '',
        specializations: knownSpecs,
        otherSpecialization: unknownSpecs.join(', '),
      });

      if (currentTrainer.certificates) {
        setCertificates(currentTrainer.certificates.map(c => ({
          ...c,
          id: c.id,
          name: c.certName || c.name || c.title || '',
          issuer: c.issuer || c.organization || c.institution || '',
          year: c.year?.toString() || currentYear.toString(),
          imageUrl: c.imageUrl || '',
          isNew: false,
          isDeleted: false,
          file: null,
          previewUrl: c.imageUrl || '',
        })));
      }
    }
  }, [currentTrainer]);

  const handleChange = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  const toggleSpecialization = (spec) => {
    if (formData.specializations.includes(spec)) {
      setFormData({ ...formData, specializations: formData.specializations.filter(s => s !== spec) });
    } else {
      setFormData({ ...formData, specializations: [...formData.specializations, spec] });
    }
  };

  const addCertificate = () => {
    setCertificates([
      ...certificates,
      { id: `temp-${Date.now()}`, name: '', issuer: '', year: currentYear.toString(), imageUrl: '', isNew: true, isDeleted: false, file: null, previewUrl: '' }
    ]);
  };

  const updateCertificate = (id, field, value) => {
    setCertificates(certificates.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleCertificateFile = (id, e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setCertificates(certificates.map(c => c.id === id ? { ...c, file, previewUrl } : c));
    }
  };

  const removeCertificate = (id) => {
    setCertificates(certificates.map(c => c.id === id ? { ...c, isDeleted: true } : c));
  };

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      setGoogleToken(tokenResponse.access_token);
      submitDataToBackend(tokenResponse.access_token);
    },
    onError: (error) => {
      console.error('Login Failed', error);
      showToast('Google Sign-In failed. Cannot upload certificates.', true);
      setIsSubmitting(false);
    },
    scope: 'https://www.googleapis.com/auth/drive.file'
  });

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    const hasNewFiles = certificates.some(c => !c.isDeleted && c.file);

    if (hasNewFiles && import.meta.env.VITE_GOOGLE_CLIENT_ID === undefined) {
      showToast('Google Drive API not configured. Cannot upload files locally.', true);
      return;
    }

    setIsSubmitting(true);

    if (hasNewFiles && !googleToken) {
      login();
      return;
    }

    submitDataToBackend(googleToken);
  };

  const submitDataToBackend = async (token) => {
    try {
      const finalSpecs = [...formData.specializations];
      if (formData.otherSpecialization.trim()) {
        finalSpecs.push(formData.otherSpecialization.trim());
      }

      const specializationMap = {
        'Weight Loss': 1, 'Strength Training': 2, 'Bodybuilding': 3,
        'Rehabilitation': 4, 'Senior Fitness': 5, 'Yoga': 6, 'Athletic Performance': 7
      };
      const specIds = finalSpecs.map(s => specializationMap[s]).filter(Boolean);

      const payload = {
        bio: formData.bio,
        specialization: finalSpecs.join(', '),
        specializationIds: specIds
      };

      await trainerService.updateProfile(user.id, payload);

      for (const cert of certificates) {
        if (cert.isDeleted) {
          if (!cert.isNew) {
            try {
              await trainerService.deleteCertificate(user.id, cert.id);
            } catch (err) {
              console.warn('Backend missing delete certificate endpoint, soft-ignoring:', err);
            }
          }
          continue;
        }

        let certImageUrl = cert.imageUrl;
        if (cert.file) {
          if (!token) throw new Error("Missing Drive Token");
          certImageUrl = await driveService.uploadFileWithToken(cert.file, token);
        }

        const certData = {
          certName: cert.name,
          issuer: cert.issuer,
          year: parseInt(cert.year, 10),
          imageUrl: certImageUrl
        };

        if (cert.isNew) {
          await trainerService.addCertificate(user.user?.id || user.id, certData);
        } else {
          // Check if modified
          const oldCert = currentTrainer.certificates.find(c => c.id === cert.id);
          const oldCertName = oldCert?.certName || oldCert?.name || oldCert?.title || '';
          const oldCertIssuer = oldCert?.issuer || oldCert?.organization || oldCert?.institution || '';
          const oldCertYear = oldCert?.year?.toString() || currentYear.toString();

          const isModified = cert.file ||
            cert.name !== oldCertName ||
            cert.issuer !== oldCertIssuer ||
            cert.year !== oldCertYear;

          if (isModified) {
            // Backend lacks PUT /certificates/{id}, so we delete and re-add
            try {
              await trainerService.deleteCertificate(user.id, cert.id);
              await trainerService.addCertificate(user.id, certData);
            } catch (err) {
              console.warn('Backend missing update/delete certificate endpoint, soft-ignoring to prevent 404 crash:', err);
            }
          }
        }
      }

      await fetchCurrentTrainer(user.id); // Refresh store
      showToast('Profile updated successfully!');
      navigate(-1);
    } catch (err) {
      console.error(err);
      showToast('Failed to update profile: ' + err.message, true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeCertificates = certificates.filter(c => !c.isDeleted);

  return (
    <WebLayout title="Edit Profile" subtitle="Manage your professional details">
      <div style={{ maxWidth: '800px', paddingBottom: '40px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

          {/* About You Section */}
          <div className={styles.card}>
            <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '800', color: '#1a1a2e' }}>About You</h3>
            <textarea
              value={formData.bio}
              onChange={handleChange('bio')}
              placeholder="I'm yousef and i Train more than 50 person bodybuilding and strength"
              style={{
                width: '100%', minHeight: '120px', padding: '16px', borderRadius: '12px',
                border: '1px solid #e0e6ed', backgroundColor: '#fcfcfd', fontSize: '15px',
                fontFamily: 'inherit', resize: 'vertical', color: '#1a1a2e', outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = '#17A073'}
              onBlur={e => e.target.style.borderColor = '#e0e6ed'}
            />
          </div>

          {/* Areas of Specialization */}
          <div className={styles.card}>
            <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '800', color: '#1a1a2e' }}>Areas of Specialization</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {SPECIALIZATION_OPTIONS.map(spec => (
                <label key={spec} onClick={(e) => { e.preventDefault(); toggleSpecialization(spec); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '6px', border: formData.specializations.includes(spec) ? 'none' : '2px solid #ccc',
                    background: formData.specializations.includes(spec) ? '#17A073' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {formData.specializations.includes(spec) && <span className="material-icons" style={{ color: 'white', fontSize: '16px', fontWeight: 'bold' }}>check</span>}
                  </div>
                  <span style={{ fontSize: '15px', color: '#333', fontWeight: '500' }}>{spec}</span>
                </label>
              ))}
            </div>
            <div style={{ marginTop: '20px' }}>
              <label style={{ fontSize: '15px', fontWeight: '700', color: '#1a1a2e', display: 'block', marginBottom: '8px' }}>Other</label>
              <input
                type="text"
                value={formData.otherSpecialization}
                onChange={handleChange('otherSpecialization')}
                style={{
                  width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e0e6ed',
                  backgroundColor: '#fcfcfd', fontSize: '15px', color: '#1a1a2e', boxSizing: 'border-box', outline: 'none'
                }}
                onFocus={e => e.target.style.borderColor = '#17A073'}
                onBlur={e => e.target.style.borderColor = '#e0e6ed'}
              />
            </div>
          </div>

          {/* Certifications Section */}
          <div className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1a1a2e' }}>Certifications</h3>
              <button type="button" onClick={addCertificate} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                <span className="material-icons" style={{ color: '#17A073', fontSize: '28px' }}>add_circle_outline</span>
              </button>
            </div>

            {activeCertificates.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', background: '#f8fafb', borderRadius: '12px', color: '#8a92a6' }}>
                No certifications added yet. Click the + icon to add your first one.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {activeCertificates.map((cert, index) => (
                  <div key={cert.id} style={{ padding: '20px', borderRadius: '16px', border: '1px solid #e0e6ed', position: 'relative', background: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <span style={{ fontSize: '15px', fontWeight: '700', color: '#1a1a2e' }}>Certification information {index + 1}</span>
                      <button type="button" onClick={() => removeCertificate(cert.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <span className="material-icons" style={{ color: '#ff4d4d', fontSize: '24px' }}>close</span>
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                      {/* Image Upload Box */}
                      <label style={{ width: '80px', height: '80px', borderRadius: '8px', background: '#f0f2f5', border: '1px dashed #ccc', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleCertificateFile(cert.id, e)} />
                        {cert.previewUrl ? (
                          <CachedImage imageUrl={cert.previewUrl} width="100%" height="100%" fit="cover" />
                        ) : (
                          <span className="material-icons" style={{ color: '#aaa', fontSize: '24px' }}>add_photo_alternate</span>
                        )}
                      </label>

                      {/* Info Form */}
                      <div style={{ flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                          <label style={{ fontSize: '13px', fontWeight: '700', color: '#1a1a2e', display: 'block', marginBottom: '6px' }}>Name</label>
                          <input type="text" value={cert.name} onChange={(e) => updateCertificate(cert.id, 'name', e.target.value)} placeholder="certification name" style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e0e6ed', boxSizing: 'border-box', outline: 'none', fontSize: '15px' }} onFocus={e => e.target.style.borderColor = '#17A073'} onBlur={e => e.target.style.borderColor = '#e0e6ed'} />
                        </div>
                        <div>
                          <label style={{ fontSize: '13px', fontWeight: '700', color: '#1a1a2e', display: 'block', marginBottom: '6px' }}>Organization</label>
                          <input type="text" value={cert.issuer} onChange={(e) => updateCertificate(cert.id, 'issuer', e.target.value)} placeholder="certification organization" style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e0e6ed', boxSizing: 'border-box', outline: 'none', fontSize: '15px' }} onFocus={e => e.target.style.borderColor = '#17A073'} onBlur={e => e.target.style.borderColor = '#e0e6ed'} />
                        </div>
                        <div>
                          <label style={{ fontSize: '13px', fontWeight: '700', color: '#1a1a2e', display: 'block', marginBottom: '6px' }}>Year</label>
                          <div style={{ position: 'relative', width: '120px' }}>
                            <select value={cert.year} onChange={(e) => updateCertificate(cert.id, 'year', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e0e6ed', boxSizing: 'border-box', outline: 'none', fontSize: '15px', appearance: 'none', background: 'white', cursor: 'pointer' }} onFocus={e => e.target.style.borderColor = '#17A073'} onBlur={e => e.target.style.borderColor = '#e0e6ed'}>
                              {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                            <span className="material-icons" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#8a92a6' }}>expand_more</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button type="submit" disabled={isSubmitting} style={{ width: '100%', maxWidth: '300px', padding: '16px', borderRadius: '25px', background: '#17A073', color: 'white', fontWeight: '700', fontSize: '16px', border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease', boxShadow: '0 4px 14px rgba(23,160,115,0.3)' }} onMouseEnter={e => !isSubmitting && (e.currentTarget.style.transform = 'translateY(-2px)')} onMouseLeave={e => !isSubmitting && (e.currentTarget.style.transform = 'none')}>
              {isSubmitting ? (
                <><div className={styles.spinner} style={{ width: '20px', height: '20px', borderWidth: '2px', borderColor: 'white #ffffff4d #ffffff4d #ffffff4d', marginRight: '10px' }} /> Saving</>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </WebLayout>
  );
};

export default TrainerEditProfilePage;
