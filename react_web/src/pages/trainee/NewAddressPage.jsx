import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import useTraineeStore from '../../stores/traineeStore';
import { showToast } from '../../utils/custom';
import WebLayout from '../../components/WebLayout';
import styles from '../../components/WebLayout.module.css';

// Leaflet Imports
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Custom Marker Icon definition
const customMarkerIcon = new L.divIcon({
  className: 'custom-map-marker',
  html: `<div style="width: 28px; height: 38px; background: linear-gradient(135deg, #17A073, #12825d); border-radius: 14px 14px 14px 0; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 12px rgba(23, 160, 115, 0.4); transform: rotate(-45deg);"><div style="width: 10px; height: 10px; background-color: white; border-radius: 50%;"></div></div>`,
  iconSize: [28, 38],
  iconAnchor: [14, 38]
});

// Component to handle map clicks for pin placement
const MapEvents = ({ setLocation }) => {
  useMapEvents({
    click(e) {
      setLocation(e.latlng);
    },
  });
  return null;
};

// Component to handle programmatic flying to the user's location
const LocaterComponent = ({ locateToggle }) => {
  const map = useMap();
  useEffect(() => {
    if (locateToggle > 0) {
      map.locate().on("locationfound", function (e) {
        map.flyTo(e.latlng, 15, { animate: true, duration: 1.5 });
      });
    }
  }, [locateToggle, map]);
  return null;
};

const NewAddressPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addAddress, isLoading } = useTraineeStore();

  const [formData, setFormData] = useState({
    buildingName: '',
    apartmentNumber: '',
    floor: '',
    street: '',
    phone: '',
    additionalDetails: ''
  });

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locateToggle, setLocateToggle] = useState(0);
  const [detectedAddress, setDetectedAddress] = useState('');

  const handleChange = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  // Optional: Reverse Geocoding when a pin is dropped (Nomimatim API)
  useEffect(() => {
    if (selectedLocation) {
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${selectedLocation.lat}&lon=${selectedLocation.lng}&format=json`)
        .then(res => res.json())
        .then(data => {
          if (data && data.address) {
            const streetPart = data.address.road || data.address.residential || data.address.path || data.address.suburb || data.address.neighbourhood || '';
            const districtPart = data.address.county || data.address.state_district || '';
            const cityPart = data.address.city || data.address.town || data.address.village || data.address.state || '';
            const finalStreet = streetPart || (data.display_name ? data.display_name.split(',')[0] : '');
            const buildingPart = data.address.building || data.address.house_number || '';
            const floorPart = data.address.level || data.address.floor || '';

            const fullAddress = [finalStreet, districtPart, cityPart].filter(Boolean).join(', ') || data.display_name || 'Unknown Location';

            setDetectedAddress(fullAddress);

            setFormData(prev => ({
              ...prev,
              street: finalStreet,
              buildingName: prev.buildingName || buildingPart,
              floor: prev.floor || floorPart
            }));
          }
        }).catch(err => console.error("Geocoding failed", err));
    }
  }, [selectedLocation]);

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.buildingName || !formData.apartmentNumber || !formData.floor || !formData.street || !formData.phone) {
      showToast('Please fill all required fields.', true);
      return;
    }

    const phoneTrimmed = formData.phone.trim();
    if (phoneTrimmed.length !== 10) {
      showToast('Phone number must be exactly 10 digits long.', true);
      return;
    }

    if (!user?.id) {
      showToast('User session not found. Please log in.', true);
      return;
    }

    const addressPayload = {
      building: formData.buildingName,
      apartment: formData.apartmentNumber,
      floor: formData.floor,
      street: formData.street,
      phone: '+20' + phoneTrimmed,
      additionalDetails: formData.additionalDetails
    };

    const result = await addAddress(user.id, addressPayload);
    if (result === true) {
      showToast('Address added successfully');
      navigate(-1);
    } else {
      showToast(result?.message || 'Failed to add address', true);
    }
  };

  const requestLocation = (e) => {
    if (e) e.preventDefault();

    if ("geolocation" in navigator) {
      showToast("Detecting your location...", false);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latlng = { lat: position.coords.latitude, lng: position.coords.longitude };
          setSelectedLocation(latlng);
          setLocateToggle(prev => prev + 1);
        },
        (error) => {
          console.error("Geolocation Error:", error);
          if (error.code === error.PERMISSION_DENIED) {
            showToast("Please allow location access in your browser settings.", true);
          } else {
            showToast("Could not detect location. Please tap the map instead.", true);
          }
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      showToast("Geolocation not supported by this browser.", true);
    }
  };

  return (
    <WebLayout title="New Address" subtitle="Add a delivery location for your orders">
      <div className={styles.card} style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {/* Modern Map Header */}
        <div style={{ position: 'relative', width: '100%', height: '280px', backgroundColor: '#f0f2f5' }}>
          <MapContainer
            center={[30.0444, 31.2357]} // Default Cairo
            zoom={13}
            style={{ height: '100%', width: '100%', zIndex: 1 }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution="&copy; OpenStreetMap contributors &copy; CARTO"
            />
            <MapEvents setLocation={setSelectedLocation} />
            <LocaterComponent locateToggle={locateToggle} />
            {selectedLocation && <Marker position={selectedLocation} icon={customMarkerIcon} />}
          </MapContainer>

          {/* Overlay gradient for premium feel */}
          <div style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0, height: '80px',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,1))',
            zIndex: 2,
            pointerEvents: 'none'
          }} />

          {/* Location Action Overlay */}
          <div style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '90%',
            maxWidth: '400px',
            gap: '12px'
          }}>
            <button
              type="button"
              onClick={requestLocation}
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '30px',
                padding: '12px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '15px',
                boxShadow: '0 8px 16px rgba(23, 160, 115, 0.3)',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <span className="material-icons" style={{ fontSize: '20px' }}>my_location</span>
              Use My Current Location
            </button>
            <div style={{
              backgroundColor: 'white',
              padding: '12px 16px',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              width: '100%',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              border: '1px solid rgba(0,0,0,0.05)'
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(23, 160, 115, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <span className="material-icons-outlined" style={{ fontSize: '18px', color: 'var(--color-primary)' }}>place</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Detected Address</div>
                <div style={{ fontSize: '14px', color: '#333', fontWeight: '500', lineHeight: '1.4' }}>
                  {detectedAddress ? detectedAddress : 'Tap map to drop pin or use current location'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '4px', height: '24px', backgroundColor: 'var(--color-primary)', borderRadius: '4px' }}></div>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#222' }}>Delivery Details</h3>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Street Address</label>
              <div className={styles.inputWrapper} style={{ position: 'relative' }}>
                <span className="material-icons" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#999', fontSize: '20px' }}>add_road</span>
                <input
                  className={styles.formInput}
                  placeholder="Street name e.g. El Tahrir St"
                  value={formData.street}
                  onChange={handleChange('street')}
                  style={{ paddingLeft: '48px' }}
                />
              </div>
            </div>

            <div className={styles.formRow} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Building</label>
                <div className={styles.inputWrapper} style={{ position: 'relative' }}>
                  <span className="material-icons" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#999', fontSize: '20px' }}>apartment</span>
                  <input
                    className={styles.formInput}
                    placeholder="Building name/no"
                    value={formData.buildingName}
                    onChange={handleChange('buildingName')}
                    style={{ paddingLeft: '48px' }}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Floor</label>
                <div className={styles.inputWrapper} style={{ position: 'relative' }}>
                  <span className="material-icons" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#999', fontSize: '20px' }}>stairs</span>
                  <input
                    className={styles.formInput}
                    placeholder="Floor"
                    value={formData.floor}
                    onChange={handleChange('floor')}
                    style={{ paddingLeft: '48px' }}
                  />
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Apartment Number</label>
              <div className={styles.inputWrapper} style={{ position: 'relative' }}>
                <span className="material-icons" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#999', fontSize: '20px' }}>door_front</span>
                <input
                  className={styles.formInput}
                  placeholder="Appt no. e.g. 14"
                  value={formData.apartmentNumber}
                  onChange={handleChange('apartmentNumber')}
                  style={{ paddingLeft: '48px' }}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Contact Phone</label>
              <div style={{
                display: 'flex', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', overflow: 'hidden', backgroundColor: 'var(--color-surface)', transition: 'all 0.2s ease',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
              }}>
                <div style={{
                  backgroundColor: '#f8f9fc', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '600', fontSize: '15px', color: '#555', borderRight: '1px solid rgba(0,0,0,0.08)'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <img src="https://flagcdn.com/w20/eg.png" alt="EG" style={{ width: '18px', borderRadius: '2px' }} />
                    +20
                  </span>
                </div>
                <input
                  type="tel"
                  placeholder="10XXXXXXXX"
                  maxLength={10}
                  value={formData.phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 10) {
                      setFormData({ ...formData, phone: val });
                    }
                  }}
                  style={{
                    flex: 1, padding: '16px', border: 'none', outline: 'none', fontSize: '15px',
                    fontWeight: '500', color: '#333', backgroundColor: 'transparent'
                  }}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Additional Details (Optional)</label>
              <textarea
                className={styles.formInput}
                placeholder="e.g. Leave package at the door, building color..."
                value={formData.additionalDetails}
                onChange={handleChange('additionalDetails')}
                style={{ minHeight: '100px', resize: 'vertical', paddingTop: '16px' }}
              />
            </div>

            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className={styles.btnSecondary}
                style={{
                  minWidth: '130px',
                  padding: '14px 24px',
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  color: '#64748b',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#334155'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={styles.btnPrimary}
                style={{
                  minWidth: '180px',
                  padding: '14px 24px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--color-primary, #17A073)',
                  border: 'none',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                  boxShadow: '0 4px 12px rgba(23, 160, 115, 0.25)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                onMouseOver={(e) => { if (!isLoading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(23, 160, 115, 0.35)'; } }}
                onMouseOut={(e) => { if (!isLoading) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(23, 160, 115, 0.25)'; } }}
              >
                {isLoading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span className="material-icons" style={{ animation: 'spin 1s linear infinite', fontSize: '18px' }}>refresh</span>
                    Saving...
                  </span>
                ) : 'Save Address'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </WebLayout>
  );
};

export default NewAddressPage;
