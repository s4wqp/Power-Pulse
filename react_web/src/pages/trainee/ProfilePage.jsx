import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import useTraineeStore from '../../stores/traineeStore';
import { traineeService } from '../../services/traineeService';
import { driveService } from '../../services/driveService';
import { useGoogleLogin } from '@react-oauth/google';
import WebLayout from '../../components/WebLayout';
import CachedImage from '../../components/CachedImage';
import { showToast } from '../../utils/custom';
import styles from '../../components/WebLayout.module.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuthStore();
  const { trainee, fetchProfile } = useTraineeStore();

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
      await traineeService.updateProfileImage(user.id, imageUrl);

      // Also update local user object so it shows globally
      if (updateUser) {
        updateUser({ ...user, profileImageUrl: imageUrl });
      }

      await fetchProfile(user.id);
      showToast('Profile image updated successfully!');
      setPreviewUrl(null);
    } catch (err) {
      console.error('Failed to upload image:', err);
      showToast('Failed to upload profile image.', true);
    } finally {
      setIsUploading(false);
    }
  };

  const menuItems = [
    { icon: 'person', label: 'Personal Details', desc: 'Manage your account info', path: '/trainee/personal-details', color: '#17A073', bg: 'rgba(23,160,115,0.1)' },
    { icon: 'location_on', label: 'Delivery Addresses', desc: 'Add or edit addresses', path: '/trainee/addresses', color: '#4285f4', bg: 'rgba(66,133,244,0.1)' },
    { icon: 'credit_card', label: 'Payment Details', desc: 'Manage your cards', path: '/trainee/payment-details', color: '#9C27B0', bg: 'rgba(156,39,176,0.1)' },
    { icon: 'receipt_long', label: 'My Orders', desc: 'Track your order history', path: '/trainee/orders', color: '#ff9800', bg: 'rgba(255,152,0,0.1)' },
    { icon: 'mail', label: 'Contact Us', desc: 'Get help from our team', path: '/trainee/contact-us', color: '#00BCD4', bg: 'rgba(0,188,212,0.1)' },
    { icon: 'description', label: 'Terms & Privacy', desc: 'Legal information', path: '/trainee/terms', color: '#607D8B', bg: 'rgba(96,125,139,0.1)' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <WebLayout title="My Profile" subtitle="Manage your account settings">
      {/* Profile Hero Card */}
      <div className={styles.card} style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '28px', position: 'relative', overflow: 'hidden' }}>
        {/* Background accent */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(23,160,115,0.06) 0%, transparent 70%)', borderRadius: '50%', transform: 'translate(30%, -30%)' }} />

        <div
          style={{ width: '90px', height: '90px', borderRadius: '22px', overflow: 'hidden', background: 'linear-gradient(135deg, #17A073, #14c486)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 16px rgba(23,160,115,0.3)', cursor: pendingFile ? 'default' : 'pointer', position: 'relative' }}
          onClick={() => { if (!isUploading && !pendingFile) fileInputRef.current?.click(); }}
        >
          {isUploading ? (
            <div className={styles.spinner} style={{ width: '30px', height: '30px', borderWidth: '3px', borderColor: 'white rgba(255,255,255,0.3) rgba(255,255,255,0.3) rgba(255,255,255,0.3)' }} />
          ) : pendingFile ? (
            <>
              <CachedImage imageUrl={previewUrl} width="100%" height="100%" fit="cover" />
              <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', display: 'flex' }}>
                <button onClick={handleConfirmUpload} style={{ flex: 1, padding: 4, background: 'rgba(23,160,115,0.9)', color: 'white', border: 'none', cursor: 'pointer', zIndex: 10 }}><span className="material-icons" style={{ fontSize: 18 }}>check</span></button>
                <button onClick={handleCancelUpload} style={{ flex: 1, padding: 4, background: 'rgba(255,77,77,0.9)', color: 'white', border: 'none', cursor: 'pointer', zIndex: 10 }}><span className="material-icons" style={{ fontSize: 18 }}>close</span></button>
              </div>
            </>
          ) : trainee?.profileImageUrl || user?.profileImageUrl ? (
            <>
              <CachedImage imageUrl={trainee?.profileImageUrl || user?.profileImageUrl} width="100%" height="100%" fit="cover" />
              <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'rgba(0,0,0,0.5)', width: '100%', height: '30%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <span className="material-icons" style={{ color: 'white', fontSize: '16px' }}>edit</span>
              </div>
            </>
          ) : (
            <>
              <span style={{ fontSize: '36px', fontWeight: '800', color: 'white' }}>{(trainee?.name || user?.fullName || 'U').charAt(0).toUpperCase()}</span>
              <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'rgba(0,0,0,0.5)', width: '100%', height: '30%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <span className="material-icons" style={{ color: 'white', fontSize: '16px' }}>edit</span>
              </div>
            </>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageSelect} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: '800', color: '#1a1a2e' }}>{trainee?.name || user?.fullName || 'User'}</h2>
          <p style={{ margin: '0 0 2px', color: '#8a92a6', fontSize: '14px', fontWeight: '500' }}>{trainee?.email || user?.email || ''}</p>
          {trainee?.phone && <p style={{ margin: 0, color: '#aab0bc', fontSize: '13px' }}>{trainee.phone}</p>}
        </div>
      </div>

      {/* Menu Items */}
      <div className={styles.card} style={{ padding: '8px 12px' }}>
        {menuItems.map((item, idx) => (
          <div
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 12px',
              borderBottom: idx < menuItems.length - 1 ? '1px solid #f5f6f8' : 'none',
              cursor: 'pointer', transition: 'all 0.2s ease', borderRadius: '12px',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f8fafb'; e.currentTarget.style.transform = 'translateX(4px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'none'; }}
          >
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span className="material-icons" style={{ color: item.color, fontSize: '22px' }}>{item.icon}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a2e' }}>{item.label}</div>
              <div style={{ fontSize: '12px', color: '#8a92a6', marginTop: '2px' }}>{item.desc}</div>
            </div>
            <span className="material-icons" style={{ color: '#ccc', fontSize: '18px' }}>chevron_right</span>
          </div>
        ))}

        {/* Logout */}
        <div
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 12px',
            cursor: 'pointer', marginTop: '8px', borderRadius: '12px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,77,77,0.05)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,77,77,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span className="material-icons" style={{ color: '#ff4d4d', fontSize: '22px' }}>logout</span>
          </div>
          <span style={{ fontSize: '15px', fontWeight: '600', color: '#ff4d4d' }}>Logout</span>
        </div>
      </div>
    </WebLayout>
  );
};

export default ProfilePage;
