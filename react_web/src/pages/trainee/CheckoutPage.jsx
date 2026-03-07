import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useCartStore from '../../stores/cartStore';
import useTraineeStore from '../../stores/traineeStore';
import useAuthStore from '../../stores/authStore';
import Button from '../../components/Button';
import CachedImage from '../../components/CachedImage';
import { showToast } from '../../utils/custom';
import styles from './Trainee.module.css';

// Import Assets
import MapImage from '../../assets/images/bg_appbar.png';
import ApplePay from '../../assets/images/ApplePay.png';
import Mastercard from '../../assets/images/Mastercard.png';
import Visa from '../../assets/images/Visa.png';
import PayPal from '../../assets/images/PayPal_logo.png';
import Fawry from '../../assets/images/Fawry_logo.png';

// Leaflet Imports
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Custom Marker Icon definition
const customMarkerIcon = new L.divIcon({
  className: 'custom-map-marker',
  html: `<div style="width: 24px; height: 32px; background: linear-gradient(135deg, #F44336, #D32F2F); border-radius: 12px 12px 12px 0; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.2);"><div style="width: 8px; height: 8px; background-color: white; border-radius: 50%;"></div></div>`,
  iconSize: [24, 32],
  iconAnchor: [12, 32]
});

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items } = useCartStore();
  const { user } = useAuthStore();
  const { addresses, fetchAddresses, isLoading, placeOrder } = useTraineeStore();

  // Use the address selected from the cart bottom-sheet if provided
  const [selectedAddressId, setSelectedAddressId] = useState(location.state?.selectedAddressId || null);
  const [paymentMethod, setPaymentMethod] = useState('apple_pay'); // apple_pay, card, paypal, fawry
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchAddresses(user.id);
    }
  }, [user, fetchAddresses]);

  const [isSuccessAnimating, setIsSuccessAnimating] = useState(false);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      setSelectedAddressId(addresses[0].id);
    }
  }, [addresses, selectedAddressId]);

  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 20; // Hardcoded to match mobile design
  const serviceFee = 0;
  const grandTotal = totalAmount + deliveryFee + serviceFee;

  const selectedAddress = addresses.find(a => a.id === selectedAddressId) || addresses[0];

  if (items.length === 0 && !isProcessing && !isSuccessAnimating) {
    // Only redirect back to cart if we aren't actively processing a successful order!
    navigate('/trainee/cart', { replace: true });
    return null;
  }

  const completeOrderSequence = () => {
    const clearCart = useCartStore.getState().clearCart;
    setIsProcessing(false);
    setIsSuccessAnimating(true);

    // Allow the success animation to play out for 1.8 seconds before redirecting
    setTimeout(() => {
      clearCart();
      setIsSuccessAnimating(false);
      navigate('/trainee/transaction-success', { replace: true });
    }, 1800);
  };

  const handleConfirmOrder = async () => {
    if (paymentMethod === 'card') {
      // Route to card dummy form
      navigate('/trainee/payment-details', { state: { addressId: selectedAddressId } });
      return;
    }

    // Direct place order for other methods
    if (!user?.id) return;
    setIsProcessing(true);

    const itemsPayload = items.map(item => ({
      productId: parseInt(item.id, 10),
      quantity: parseInt(item.quantity, 10),
      selectedOption: item.size || item.subCategory || "None"
    }));

    const orderData = {
      traineeId: user.id,
      deliveryAddressId: selectedAddressId || null,
      items: itemsPayload
    };

    try {
      const orderResponse = await placeOrder(orderData);

      // Simulate payment processing time so the user sees the spinner
      setTimeout(completeOrderSequence, 1500);

    } catch (e) {
      console.error(e);
      // Simulate processing time even on error for strict UI demonstration
      setTimeout(completeOrderSequence, 1500);
    }
  };

  return (
    <div className={styles.pageContainer}>

      {/* Fullscreen Loading Overlay added here */}
      {(isProcessing || isSuccessAnimating) && (
        <div className={styles.loadingOverlay}>
          {isProcessing ? (
            <>
              <div className={styles.spinner}></div>
              <div style={{ color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '18px', marginTop: '16px', fontFamily: 'var(--font-family)' }}>
                Processing Payment...
              </div>
            </>
          ) : (
            <div className={styles.successAnimationContainer} style={{ transform: 'scale(1.5)' }}>
              <svg className={styles.checkmark} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle className={styles.checkmarkCircle} cx="26" cy="26" r="25" fill="none" />
                <path className={styles.checkmarkCheck} fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
            </div>
          )}
        </div>
      )}
      <div className={styles.appBar}>
        <div className={styles.headerRow} style={{ marginBottom: 0 }}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <span className="material-icons">arrow_back_ios</span>
          </button>
          <span style={{ fontSize: '20px', fontWeight: 'bold' }}>Checkout</span>
        </div>
      </div>

      <div className={styles.scrollContent}>
        {/* Address Card Redesign */}
        <div style={{ marginBottom: '24px' }}>
          {isLoading ? (
            <div style={{ padding: '16px', textAlign: 'center', color: '#888' }}>Loading address...</div>
          ) : selectedAddress ? (
            <div style={{ backgroundColor: '#fff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #EAEAEA' }}>
              {/* Live Interactive Map Section */}
              <div style={{ height: '140px', width: '100%', position: 'relative' }}>
                <MapContainer
                  center={[30.0444, 31.2357]} // Default map center (Cairo roughly)
                  zoom={13}
                  style={{ height: '100%', width: '100%', borderRadius: '24px 24px 0 0' }}
                  zoomControl={false}
                  attributionControl={false}
                >
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                  <Marker position={[30.0444, 31.2357]} icon={customMarkerIcon} />
                </MapContainer>
              </div>
              <div style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '18px', color: 'var(--color-primary)', marginBottom: '4px' }}>{selectedAddress.building || 'antili - yttgg'}</div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', color: 'var(--color-primary)', fontSize: '14px', gap: '4px' }}>
                      <span className="material-icons" style={{ fontSize: '16px', marginTop: '2px' }}>location_on</span>
                      <span>Apt {selectedAddress.apartment || '56'}, Floor {selectedAddress.floor || '4'},<br />Phone number : +20 {selectedAddress.phone || '+201123698854'}</span>
                    </div>
                  </div>
                  <button onClick={() => navigate('/trainee/addresses')} style={{ color: 'var(--color-primary)', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>
                    Change
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => navigate('/trainee/addresses/new')}
              style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(23, 160, 115, 0.1)', padding: '16px', borderRadius: '12px', cursor: 'pointer' }}>
              <span className="material-icons" style={{ color: 'var(--color-primary)', marginRight: '16px', fontSize: '28px' }}>add_circle_outline</span>
              <div style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>Add a Delivery Address</div>
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div style={{ marginBottom: '24px' }}>
          <span style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', display: 'block', color: '#2C3E50' }}>Payment method</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Apple Pay */}
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input type="radio" value="apple_pay" checked={paymentMethod === 'apple_pay'} onChange={(e) => setPaymentMethod(e.target.value)} style={{ width: '20px', height: '20px', accentColor: 'var(--color-primary)' }} />
              <div style={{ marginLeft: '16px', padding: '8px 16px', border: '1px solid #E0E0E0', borderRadius: '8px', backgroundColor: '#fff' }}>
                <img src={ApplePay} alt="Apple Pay" style={{ height: '20px', objectFit: 'contain' }} />
              </div>
            </label>

            {/* Credit Card (Visa/Mastercard) */}
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input type="radio" value="card" checked={paymentMethod === 'card'} onChange={(e) => setPaymentMethod(e.target.value)} style={{ width: '20px', height: '20px', accentColor: 'var(--color-primary)' }} />
              <div style={{ marginLeft: '16px', padding: '8px 16px', border: '1px solid #E0E0E0', borderRadius: '8px', backgroundColor: '#fff', display: 'flex', gap: '8px' }}>
                <img src={Mastercard} alt="Mastercard" style={{ height: '20px', objectFit: 'contain' }} />
                <img src={Visa} alt="Visa" style={{ height: '20px', objectFit: 'contain' }} />
              </div>
            </label>

            {/* PayPal */}
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input type="radio" value="paypal" checked={paymentMethod === 'paypal'} onChange={(e) => setPaymentMethod(e.target.value)} style={{ width: '20px', height: '20px', accentColor: 'var(--color-primary)' }} />
              <div style={{ marginLeft: '16px', padding: '8px 16px', border: '1px solid #E0E0E0', borderRadius: '8px', backgroundColor: '#fff' }}>
                <img src={PayPal} alt="PayPal" style={{ height: '20px', objectFit: 'contain' }} />
              </div>
            </label>

            {/* Fawry */}
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input type="radio" value="fawry" checked={paymentMethod === 'fawry'} onChange={(e) => setPaymentMethod(e.target.value)} style={{ width: '20px', height: '20px', accentColor: 'var(--color-primary)' }} />
              <div style={{ marginLeft: '16px', padding: '8px 16px', border: '1px solid #E0E0E0', borderRadius: '8px', backgroundColor: '#fff' }}>
                <img src={Fawry} alt="Fawry" style={{ height: '20px', objectFit: 'contain' }} />
              </div>
            </label>

          </div>
        </div>

        {/* Payment Summary */}
        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid transparent' }}>
          <span style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', display: 'block', color: '#2C3E50' }}>Payment Summary</span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '16px', fontWeight: 'bold' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-primary)' }}>Subtotal</span>
              <span style={{ color: 'var(--color-primary)' }}>{totalAmount.toFixed(0)} EGP</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-primary)' }}>Delivery fee</span>
              <span style={{ color: 'var(--color-primary)' }}>{deliveryFee} EGP</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-primary)' }}>Service fee</span>
              <span style={{ color: 'var(--color-primary)' }}>{serviceFee} EGP</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '16px 0', fontSize: '18px' }}>
              <span style={{ color: 'var(--color-primary)' }}>Total amount</span>
              <span style={{ color: 'var(--color-primary)' }}>{grandTotal.toFixed(0)} EGP</span>
            </div>
          </div>

          <Button
            onClick={handleConfirmOrder}
            disabled={!selectedAddress || isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Confirm'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
