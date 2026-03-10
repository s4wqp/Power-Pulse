import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import useTrainerStore from '../../stores/trainerStore';
import { trainerService } from '../../services/trainerService';
import { driveService } from '../../services/driveService';
import { useGoogleLogin } from '@react-oauth/google';
import WebLayout from '../../components/WebLayout';
import CachedImage from '../../components/CachedImage';
import { showToast } from '../../utils/custom';
import styles from '../../components/WebLayout.module.css';

const TrainerProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuthStore();
  const { currentTrainer, fetchCurrentTrainer } = useTrainerStore();

  const [googleToken, setGoogleToken] = React.useState(null);
  const [pendingFile, setPendingFile] = React.useState(null);
  const [previewUrl, setPreviewUrl] = React.useState(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef(null);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleToken(tokenResponse.access_token);
      if (pendingFile) {
        uploadImageToDrive(pendingFile, tokenResponse.access_token);
      }
    },
    onError: (error) => {
      console.error('Login Failed', error);
      showToast('Google Sign-In failed. Cannot upload image.', true);
      setIsUploading(false);
      setPendingFile(null);
    },
    scope: 'https://www.googleapis.com/auth/drive.file'
  });

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleConfirmUpload = (e) => {
    e.stopPropagation();
    if (import.meta.env.VITE_GOOGLE_CLIENT_ID === undefined) {
      showToast('Google Drive API not configured. Cannot upload files locally.', true);
      return;
    }
    if (!googleToken) {
      login();
      return;
    }
    uploadImageToDrive(pendingFile, googleToken);
  };

  const handleCancelUpload = (e) => {
    e.stopPropagation();
    setPendingFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadImageToDrive = async (file, token) => {
    setIsUploading(true);
    setPendingFile(null);
    try {
      showToast('Uploading profile image...');
      const imageUrl = await driveService.uploadFileWithToken(file, token);
      await trainerService.updateProfileImage(user.id, imageUrl);

      if (updateUser) {
        updateUser({ ...user, profileImageUrl: imageUrl });
      }

      await fetchCurrentTrainer(user.id);
      showToast('Profile image updated successfully!');
      setPreviewUrl(null);
    } catch (err) {
      console.error('Failed to upload image:', err);
      showToast('Failed to upload profile image.', true);
    } finally {
      setPendingFile(null);
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (user?.id && !currentTrainer) fetchCurrentTrainer(user.id);
  }, [user?.id, currentTrainer, fetchCurrentTrainer]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: 'person_outline', label: 'My Account', path: '/trainer/account' },
    { icon: 'credit_card', label: 'Payment Details', path: '/trainer/payment-details' },
    { icon: 'people_outline', label: 'Subscribers', path: '/trainer/subscribers' },
    { icon: 'monetization_on', label: 'Manage Plans', path: '/trainer/plans' },
    { icon: 'headset_mic', label: 'Contact us', path: '/trainer/contact-us' },
    { icon: 'shield', label: 'Privacy Policy', path: '/trainer/terms' },
    { icon: 'logout', label: 'Logout', action: handleLogout, color: '#ff4d4d' },
  ];

  return (
    <WebLayout title="Trainer Profile" subtitle="View and manage your professional profile">
      <div className={styles.card} style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, position: 'relative' }}>
        <div
          style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.1)', cursor: pendingFile ? 'default' : 'pointer', position: 'relative' }}
          onClick={() => { if (!isUploading && !pendingFile) fileInputRef.current?.click(); }}
        >
          {isUploading ? (
            <div className={styles.spinner} style={{ width: '30px', height: '30px', borderWidth: '3px', borderColor: 'white rgba(255,255,255,0.3) rgba(255,255,255,0.3) rgba(255,255,255,0.3)' }} />
          ) : pendingFile ? (
            <>
              <CachedImage imageUrl={previewUrl} width="100%" height="100%" fit="cover" />
              <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', display: 'flex' }}>
                <button onClick={handleConfirmUpload} style={{ flex: 1, padding: 4, background: 'rgba(23,160,115,0.9)', color: 'white', border: 'none', cursor: 'pointer', zIndex: 10 }}><span className="material-icons" style={{ fontSize: 16 }}>check</span></button>
                <button onClick={handleCancelUpload} style={{ flex: 1, padding: 4, background: 'rgba(255,77,77,0.9)', color: 'white', border: 'none', cursor: 'pointer', zIndex: 10 }}><span className="material-icons" style={{ fontSize: 16 }}>close</span></button>
              </div>
            </>
          ) : (currentTrainer?.profileImageUrl || user?.profileImageUrl) ? (
            <>
              <CachedImage imageUrl={currentTrainer?.profileImageUrl || user?.profileImageUrl} width="100%" height="100%" fit="cover" />
              <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'rgba(0,0,0,0.5)', width: '100%', height: '30%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <span className="material-icons" style={{ color: 'white', fontSize: '14px' }}>edit</span>
              </div>
            </>
          ) : (
            <>
              <span style={{ fontSize: 32, fontWeight: 700, color: '#999' }}>{(user?.fullName || 'T').charAt(0).toUpperCase()}</span>
              <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'rgba(0,0,0,0.5)', width: '100%', height: '30%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <span className="material-icons" style={{ color: 'white', fontSize: '14px' }}>edit</span>
              </div>
            </>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageSelect} />
        <div>
          <h2 style={{ margin: 0, fontSize: 22 }}>{user?.fullName || 'Trainer'}</h2>
          <p style={{ margin: '4px 0 0', color: '#888', fontSize: 14 }}>Professional Trainer</p>
        </div>
      </div>

      <div className={styles.card}>
        {menuItems.map((item) => (
          <div
            key={item.label}
            onClick={() => item.action ? item.action() : navigate(item.path)}
            style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '16px 8px',
              borderBottom: item.label === 'Logout' ? 'none' : '1px solid #f5f5f5', cursor: 'pointer',
              color: item.color || '#333'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span className="material-icons" style={{ color: item.color || '#17A073', fontSize: 24 }}>{item.icon}</span>
            <span style={{ flex: 1, fontSize: 16, fontWeight: 600 }}>{item.label}</span>
            {item.label !== 'Logout' && <span className="material-icons" style={{ color: '#ccc', fontSize: 18 }}>chevron_right</span>}
          </div>
        ))}
      </div>
    </WebLayout>
  );
};

export default TrainerProfilePage;
