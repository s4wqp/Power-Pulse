import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import useTraineeStore from '../../stores/traineeStore';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { showToast } from '../../utils/custom';
import styles from './Trainee.module.css';

// Leaflet Imports
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Custom Marker Icon definition
const customMarkerIcon = new L.divIcon({
  className: 'custom-map-marker',
  html: `<div style="width: 24px; height: 32px; background: linear-gradient(135deg, #F44336, #D32F2F); border-radius: 12px 12px 12px 0; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.2);"><div style="width: 8px; height: 8px; background-color: white; border-radius: 50%;"></div></div>`,
  iconSize: [24, 32],
  iconAnchor: [12, 32]
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
        map.flyTo(e.latlng, map.getZoom());
      });
    }
  }, [locateToggle, map]);
  return null;
};

const GrayInput = ({ placeholder, value, onChange, ...rest }) => (
  <input
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    style={{
      width: '100%',
      padding: '16px',
      backgroundColor: '#F5F5F5',
      border: 'none',
      borderRadius: '12px',
      fontSize: '15px',
      outline: 'none',
      color: '#333'
    }}
    {...rest}
  />
);

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
            // Provide a robust cascade of fallback properties since 'road' is often empty depending on the country/region
            const streetPart = data.address.road || data.address.residential || data.address.path || data.address.suburb || data.address.neighbourhood || '';
            const districtPart = data.address.county || data.address.state_district || '';
            const cityPart = data.address.city || data.address.town || data.address.village || data.address.state || '';

            // If we somehow still have no street part, pull the first chunk of the raw display_name
            const finalStreet = streetPart || (data.display_name ? data.display_name.split(',')[0] : '');

            const buildingPart = data.address.building || data.address.house_number || '';
            const floorPart = data.address.level || data.address.floor || '';

            const fullAddress = [finalStreet, districtPart, cityPart].filter(Boolean).join(', ') || data.display_name || 'Unknown Location';

            setDetectedAddress(fullAddress);

            setFormData(prev => ({
              ...prev,
              street: finalStreet, // Always overwrite the street when a new location is detected
              buildingName: prev.buildingName || buildingPart,
              floor: prev.floor || floorPart
            }));
          }
        }).catch(err => console.error("Geocoding failed", err));
    }
  }, [selectedLocation]);

  const handleSave = async (e) => {
    e.preventDefault();

    // 1. Check all required fields are filled
    if (!formData.buildingName || !formData.apartmentNumber || !formData.floor || !formData.street || !formData.phone) {
      showToast('Please fill all required fields.', true);
      return;
    }

    // 2. Validate phone number is exactly 10 characters/digits
    const phoneTrimmed = formData.phone.trim();
    if (phoneTrimmed.length !== 10) {
      showToast('Phone number must be exactly 10 digits long.', true);
      return;
    }

    if (!user?.id) {
      showToast('User session not found. Please log in.', true);
      return;
    }

    // Payload must match the exact .NET backend model: building, apartment, floor, street, phone, additionalDetails
    const addressPayload = {
      building: formData.buildingName,
      apartment: formData.apartmentNumber,
      floor: formData.floor,
      street: formData.street,
      phone: '+20' + phoneTrimmed,
      additionalDetails: formData.additionalDetails
    };

    const success = await addAddress(user.id, addressPayload);
    if (success) {
      showToast('Address added successfully');
      navigate(-1);
    } else {
      showToast('Failed to add address', true);
    }
  };

  const requestLocation = (e) => {
    if (e) e.preventDefault();

    if ("geolocation" in navigator) {
      // Show loading toast to indicate we are trying
      showToast("Detecting your location...", false);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latlng = { lat: position.coords.latitude, lng: position.coords.longitude };
          setSelectedLocation(latlng);
          setLocateToggle(prev => prev + 1); // Trigger map flyTo
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
    <div className={styles.pageContainer} style={{ paddingBottom: '20px', backgroundColor: 'var(--color-white)' }}>
      {/* Header matching original Trainee mobile style exactly */}
      <div style={{ backgroundColor: 'var(--color-primary)', padding: '20px', paddingBottom: '40px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button style={{ position: 'absolute', left: '20px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'white' }} onClick={() => navigate(-1)}>
            <span className="material-icons">arrow_back</span>
          </button>
          <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>New Address</span>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', marginTop: '-24px', padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Interactive Map */}
        <div style={{ width: '100%', height: '140px', backgroundColor: '#E0E0E0', borderRadius: '24px', marginBottom: '20px', position: 'relative', overflow: 'hidden' }}>
          <MapContainer
            center={[30.0444, 31.2357]} // Default Cairo
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
            <MapEvents setLocation={setSelectedLocation} />
            <LocaterComponent locateToggle={locateToggle} />
            {selectedLocation && <Marker position={selectedLocation} icon={customMarkerIcon} />}
          </MapContainer>
        </div>

        {/* Detected Address Section */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '18px' }}>Detected Address</span>
            <span style={{ color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>Change</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: '8px', color: '#444' }}>
            <span className="material-icons-outlined" style={{ fontSize: '18px', color: 'var(--color-primary)', marginRight: '8px', marginTop: '2px' }}>place</span>
            <span style={{ fontSize: '14px', lineHeight: '1.4' }}>
              {detectedAddress ? detectedAddress : 'Tap map to drop pin or use current location'}
            </span>
          </div>
        </div>

        {/* Use My Current Location Button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <button
            type="button"
            onClick={requestLocation}
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '24px',
              padding: '12px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '15px'
            }}>
            <span className="material-icons" style={{ fontSize: '20px' }}>my_location</span>
            Use My Current Location
          </button>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>

          <GrayInput placeholder="Building name" value={formData.buildingName} onChange={handleChange('buildingName')} />

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <GrayInput placeholder="Apartment num..." value={formData.apartmentNumber} onChange={handleChange('apartmentNumber')} />
            </div>
            <div style={{ flex: 1 }}>
              <GrayInput placeholder="Floor" value={formData.floor} onChange={handleChange('floor')} />
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            {/* Fake cursor bar styling to match screenshot */}
            {formData.street.length === 0 && <div style={{ position: 'absolute', left: '16px', top: '16px', width: '2px', height: '18px', backgroundColor: '#6C5CE7', zIndex: 1 }} />}
            <GrayInput placeholder="Street" value={formData.street} onChange={handleChange('street')} style={{ paddingLeft: '16px', backgroundColor: '#F5F5F5', border: 'none', borderRadius: '12px', fontSize: '15px', outline: 'none', color: '#333', width: '100%', padding: '16px' }} />
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ backgroundColor: '#EEE', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '15px' }}>
              +20
            </div>
            <div style={{ flex: 1 }}>
              <GrayInput
                type="tel"
                placeholder="Phone number"
                maxLength={10}
                value={formData.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 10) {
                    setFormData({ ...formData, phone: val });
                  }
                }}
              />
            </div>
          </div>

          <div>
            <textarea
              placeholder="Additional details (optional)"
              value={formData.additionalDetails}
              onChange={handleChange('additionalDetails')}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#F5F5F5',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                outline: 'none',
                color: '#333',
                minHeight: '100px',
                resize: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                width: '100%',
                padding: '16px',
                borderRadius: '30px',
                border: 'none',
                fontWeight: 'bold',
                fontSize: '16px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewAddressPage;
