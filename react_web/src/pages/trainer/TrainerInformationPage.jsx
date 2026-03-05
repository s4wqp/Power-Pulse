import React, { useEffect, useState } from 'react';
import useAuthStore from '../../stores/authStore';
import { trainerService } from '../../services/trainerService';
import WebLayout from '../../components/WebLayout';
import CachedImage from '../../components/CachedImage';
import styles from '../../components/WebLayout.module.css';

const TrainerInformationPage = () => {
  const { user } = useAuthStore();
  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) loadTrainer();
  }, [user?.id]);

  const loadTrainer = async () => {
    try {
      const data = await trainerService.getTrainerDetails(user.id);
      setTrainer(data);
    } catch {
      setTrainer(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <WebLayout title="Personal Information">
        <div className={styles.loadingSpinner}><div className={styles.spinner} /></div>
      </WebLayout>
    );
  }

  return (
    <WebLayout title="Personal Information" subtitle="Your professional details">
      <div className={styles.card}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#888' }}>Full Name</label>
            <p style={{ fontSize: 16, fontWeight: 500, margin: '4px 0 16px' }}>{trainer?.name || 'N/A'}</p>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#888' }}>Email</label>
            <p style={{ fontSize: 16, fontWeight: 500, margin: '4px 0 16px' }}>{trainer?.email || 'N/A'}</p>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#888' }}>Phone</label>
            <p style={{ fontSize: 16, fontWeight: 500, margin: '4px 0 16px' }}>{trainer?.phone || 'N/A'}</p>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#888' }}>Professional Title</label>
            <p style={{ fontSize: 16, fontWeight: 500, margin: '4px 0 16px' }}>{trainer?.professionalTitle || 'N/A'}</p>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#888' }}>Experience</label>
            <p style={{ fontSize: 16, fontWeight: 500, margin: '4px 0 16px' }}>{trainer?.experienceYears || 0} years</p>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#888' }}>Rating</label>
            <p style={{ fontSize: 16, fontWeight: 500, margin: '4px 0 16px' }}>⭐ {trainer?.rating?.toFixed(1) || '0.0'}</p>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#888' }}>Bio</label>
            <p style={{ fontSize: 15, color: '#555', lineHeight: 1.6, margin: '4px 0 16px' }}>{trainer?.bio || 'No bio provided'}</p>
          </div>
        </div>
      </div>

      {trainer?.specializations?.length > 0 && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle} style={{ marginBottom: 12 }}>Specializations</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {trainer.specializations.map((s, i) => (
              <span key={i} className={styles.badgeGreen} style={{ padding: '6px 14px', fontSize: 13 }}>{s.name || s}</span>
            ))}
          </div>
        </div>
      )}

      {trainer?.certificates?.length > 0 && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle} style={{ marginBottom: 12 }}>Certificates</h3>
          <div className={styles.itemsGrid}>
            {trainer.certificates.map((cert) => (
              <div key={cert.id} style={{ border: '1px solid #f0f0f0', borderRadius: 12, padding: 16 }}>
                <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600 }}>{cert.name || cert.title}</h4>
                <p style={{ margin: 0, fontSize: 13, color: '#888' }}>{cert.issuer || cert.institution || ''}</p>
                {cert.imageUrl && <CachedImage imageUrl={cert.imageUrl} width="100%" height="120px" fit="contain" style={{ marginTop: 8, borderRadius: 8 }} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </WebLayout>
  );
};

export default TrainerInformationPage;
