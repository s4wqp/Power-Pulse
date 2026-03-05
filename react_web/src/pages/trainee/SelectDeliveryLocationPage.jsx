import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import styles from './Trainee.module.css';

const SelectDeliveryLocationPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.pageContainer} style={{ paddingBottom: 0 }}>
      {/* Floating App Bar over map */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', zIndex: 10, display: 'flex', alignItems: 'center' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            width: '40px', height: '40px', borderRadius: '20px',
            backgroundColor: 'white', border: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <span className="material-icons">arrow_back</span>
        </button>
        <div style={{ flex: 1, marginLeft: '16px', backgroundColor: 'white', borderRadius: '20px', padding: '10px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center' }}>
          <span className="material-icons" style={{ color: 'var(--color-text-second)', marginRight: '8px' }}>search</span>
          <input type="text" placeholder="Search location" style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }} />
        </div>
      </div>

      {/* Map Mockup */}
      <div style={{ flex: 1, backgroundColor: '#E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: 'url("https://maps.googleapis.com/maps/api/staticmap?center=Cairo,Egypt&zoom=13&size=600x800&maptype=roadmap")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        {/* Centered Pin Indicator Mockup (Actual implementation would use Leaflet/GoogleMaps bounds center) */}
        <div style={{ position: 'relative', top: '-20px' }}>
          <span className="material-icons" style={{ fontSize: '48px', color: 'var(--color-primary)', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>location_on</span>
          <div style={{ width: '10px', height: '4px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.3)', position: 'absolute', bottom: '2px', left: '19px' }}></div>
        </div>
      </div>

      {/* Bottom Sheet */}
      <div style={{ backgroundColor: 'white', padding: '24px', borderTopLeftRadius: '30px', borderTopRightRadius: '30px', boxShadow: '0 -4px 16px rgba(0,0,0,0.1)', zIndex: 10, position: 'relative' }}>
        <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '8px' }}>Selected Location</div>
        <div style={{ color: 'var(--color-text-second)', fontSize: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center' }}>
          <span className="material-icons" style={{ fontSize: '18px', marginRight: '8px' }}>place</span>
          Tahrir Square, Downtown Cairo, Egypt
        </div>
        <Button onClick={() => navigate(-1)}>
          Confirm Location
        </Button>
      </div>
    </div>
  );
};

export default SelectDeliveryLocationPage;
