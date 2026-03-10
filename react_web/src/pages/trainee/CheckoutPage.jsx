import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useCartStore from '../../stores/cartStore';
import useTraineeStore from '../../stores/traineeStore';
import useAuthStore from '../../stores/authStore';
import { showToast } from '../../utils/custom';
import WebLayout from '../../components/WebLayout';
import styles from '../../components/WebLayout.module.css';

// Import Assets
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
  html: `<div style="width: 28px; height: 38px; background: linear-gradient(135deg, #17A073, #12825d); border-radius: 14px 14px 14px 0; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 12px rgba(23, 160, 115, 0.4); transform: rotate(-45deg);"><div style="width: 10px; height: 10px; background-color: white; border-radius: 50%;"></div></div>`,
  iconSize: [28, 38],
  iconAnchor: [14, 38]
});

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { addresses, fetchAddresses, isLoading, placeOrder } = useTraineeStore();

  const [selectedAddressId, setSelectedAddressId] = useState(location.state?.selectedAddressId || null);
  const [paymentMethod, setPaymentMethod] = useState('apple_pay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccessAnimating, setIsSuccessAnimating] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchAddresses(user.id);
    }
  }, [user, fetchAddresses]);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      setSelectedAddressId(addresses[0].id);
    }
  }, [addresses, selectedAddressId]);

  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 20;
  const serviceFee = 0;
  const grandTotal = totalAmount + deliveryFee + serviceFee;

  const selectedAddress = addresses.find(a => a.id === selectedAddressId) || addresses[0];

  if (items.length === 0 && !isProcessing && !isSuccessAnimating) {
    navigate('/trainee/cart', { replace: true });
    return null;
  }

  const completeOrderSequence = () => {
    setIsProcessing(false);
    setIsSuccessAnimating(true);
    setTimeout(() => {
      clearCart();
      setIsSuccessAnimating(false);
      navigate('/trainee/transaction-success', { replace: true });
    }, 1800);
  };

  const handleConfirmOrder = async () => {
    if (paymentMethod === 'card') {
      navigate('/trainee/payment-details', { state: { addressId: selectedAddressId } });
      return;
    }

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
      await placeOrder(orderData);
      setTimeout(completeOrderSequence, 1500);
    } catch (e) {
      console.error(e);
      setTimeout(completeOrderSequence, 1500);
    }
  };

  const PaymentOption = ({ value, iconContent }) => {
    const isSelected = paymentMethod === value;
    return (
      <div
        onClick={() => setPaymentMethod(value)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          backgroundColor: isSelected ? 'rgba(23, 160, 115, 0.04)' : '#fff',
          border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'rgba(0,0,0,0.08)'}`,
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {iconContent}
        </div>
        <div style={{
          width: '20px', height: '20px', borderRadius: '50%',
          border: `2px solid ${isSelected ? 'var(--color-primary)' : '#ccc'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent'
        }}>
          {isSelected && <div style={{ width: '8px', height: '8px', backgroundColor: '#fff', borderRadius: '50%' }} />}
        </div>
      </div>
    );
  };

  return (
    <WebLayout title="Checkout" subtitle="Review your order and securely complete your purchase" onBack={() => navigate(-1)}>
      <div className={styles.container} style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', paddingBottom: '80px' }}>

        {/* Fullscreen Loading Overlay */}
        {(isProcessing || isSuccessAnimating) && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(255,255,255,0.95)', zIndex: 9999,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}>
            {isProcessing ? (
              <>
                <div style={{
                  width: '50px', height: '50px', border: '4px solid rgba(23, 160, 115, 0.2)',
                  borderTopColor: 'var(--color-primary)', borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <div style={{ color: '#222', fontWeight: '600', fontSize: '20px', marginTop: '24px' }}>
                  Processing secure payment...
                </div>
              </>
            ) : (
              <div style={{ transform: 'scale(1.5)', color: 'var(--color-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span className="material-icons" style={{ fontSize: '64px', color: 'var(--color-primary)' }}>check_circle</span>
                <span style={{ fontSize: '18px', fontWeight: '700', marginTop: '16px', color: '#111' }}>Payment Successful!</span>
              </div>
            )}
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* 2-Column E-commerce Layout */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '40px',
          alignItems: 'flex-start',
          marginTop: '20px'
        }}>

          {/* Left Column: Forms & Details */}
          <div style={{
            flex: '1 1 600px',
            minWidth: 0, // Prevent flex item from overflowing
            display: 'flex',
            flexDirection: 'column',
            gap: '32px'
          }}>

            {/* Delivery Address Section */}
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#111', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>1</div>
                <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#111' }}>Shipping Address</h2>
              </div>

              {isLoading ? (
                <div style={{ padding: '32px', textAlign: 'center', color: '#888', backgroundColor: '#f9f9f9', borderRadius: '12px', border: '1px solid #eaeaea' }}>
                  Loading address...
                </div>
              ) : selectedAddress ? (
                <div style={{
                  backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden',
                  border: '1px solid #eaeaea'
                }}>
                  <div style={{ height: '160px', width: '100%', position: 'relative' }}>
                    <MapContainer
                      center={[30.0444, 31.2357]}
                      zoom={14}
                      style={{ height: '100%', width: '100%' }}
                      zoomControl={false}
                      attributionControl={false}
                      dragging={false}
                      scrollWheelZoom={false}
                    >
                      <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                      <Marker position={[30.0444, 31.2357]} icon={customMarkerIcon} />
                    </MapContainer>
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px',
                      background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,1))', zIndex: 400
                    }} />
                  </div>

                  <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ width: '48px', height: '48px', backgroundColor: '#f5f5f5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-icons" style={{ color: '#555' }}>location_city</span>
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '16px', color: '#111', marginBottom: '6px' }}>
                          {selectedAddress.building || 'Home'} — Apt {selectedAddress.apartment || '56'}, Floor {selectedAddress.floor || '4'}
                        </div>
                        <div style={{ color: '#666', fontSize: '15px', lineHeight: '1.5' }}>
                          {selectedAddress.street || 'Main Street, Building 123'}
                          <br />
                          Contact: {selectedAddress.phone || '+201123698854'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/trainee/addresses')}
                      style={{
                        color: '#111', background: '#f5f5f5',
                        border: '1px solid #ddd', fontWeight: '600', padding: '8px 16px', borderRadius: '8px',
                        cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => e.target.style.background = '#ebebeb'}
                      onMouseOut={(e) => e.target.style.background = '#f5f5f5'}
                    >
                      Change
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => navigate('/trainee/addresses/new')}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px',
                    border: '2px dashed #ccc', backgroundColor: '#fafafa',
                    padding: '40px 20px', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
                >
                  <span className="material-icons" style={{ color: '#666', fontSize: '32px' }}>add_location_alt</span>
                  <div style={{ fontWeight: '600', color: '#444', fontSize: '16px' }}>Add a Delivery Address</div>
                </div>
              )}
            </section>

            <hr style={{ border: 'none', borderTop: '1px solid #eaeaea', margin: '8px 0' }} />

            {/* Payment Methods Section */}
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#111', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>2</div>
                <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#111' }}>Payment Method</h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <PaymentOption
                  value="apple_pay"
                  iconContent={<><img src={ApplePay} alt="Apple Pay" style={{ height: '24px', objectFit: 'contain' }} /><span style={{ fontWeight: '600', color: '#333' }}>Apple Pay</span></>}
                />
                <PaymentOption
                  value="card"
                  iconContent={<><div style={{ display: 'flex', gap: '6px' }}><img src={Mastercard} alt="Mastercard" style={{ height: '18px', objectFit: 'contain' }} /><img src={Visa} alt="Visa" style={{ height: '18px', objectFit: 'contain' }} /></div><span style={{ fontWeight: '600', color: '#333' }}>Credit / Debit Card</span></>}
                />
                <PaymentOption
                  value="paypal"
                  iconContent={<><img src={PayPal} alt="PayPal" style={{ height: '20px', objectFit: 'contain' }} /><span style={{ fontWeight: '600', color: '#333' }}>PayPal</span></>}
                />
                <PaymentOption
                  value="fawry"
                  iconContent={<><img src={Fawry} alt="Fawry" style={{ height: '20px', objectFit: 'contain' }} /><span style={{ fontWeight: '600', color: '#333' }}>Fawry Pay</span></>}
                />
              </div>
            </section>

          </div>

          {/* Right Column: Sticky Order Summary */}
          <div style={{
            flex: '1 1 380px',
            minWidth: '320px',
            maxWidth: '100%'
          }}>
            <div style={{
              position: 'sticky',
              top: '40px',
              backgroundColor: '#fff',
              padding: '32px',
              borderRadius: '24px',
              border: '1px solid rgba(0,0,0,0.03)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
              transition: 'all 0.3s ease'
            }}>

              <h3 style={{
                margin: '0 0 24px 0',
                fontSize: '22px',
                fontWeight: '800',
                color: '#1a1a2e',
                letterSpacing: '-0.5px'
              }}>
                Order Summary
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#667085', fontSize: '15px', fontWeight: '500' }}>
                  <span>Items ({items.length})</span>
                  <span style={{ fontWeight: '700', color: '#1a1a2e' }}>{totalAmount.toLocaleString()} EGP</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#667085', fontSize: '15px', fontWeight: '500' }}>
                  <span>Shipping & Handling</span>
                  <span style={{ fontWeight: '700', color: '#1a1a2e' }}>{deliveryFee.toLocaleString()} EGP</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#667085', fontSize: '15px', fontWeight: '500' }}>
                  <span>Estimated Tax</span>
                  <span style={{ fontWeight: '700', color: '#1a1a2e' }}>{serviceFee.toLocaleString()} EGP</span>
                </div>

                <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent 0%, #f0f0f0 50%, transparent 100%)', margin: '8px 0' }} />

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginTop: '4px',
                  padding: '8px 0'
                }}>
                  <span style={{ fontSize: '18px', fontWeight: '800', color: '#1a1a2e' }}>Order Total</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--color-primary)', lineHeight: 1 }}>
                      {grandTotal.toLocaleString()}
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#8a92a6' }}>EGP</span>
                  </div>
                </div>

                <div style={{
                  fontSize: '12px',
                  color: '#98a2b3',
                  textAlign: 'center',
                  lineHeight: '1.6',
                  margin: '12px 0',
                  padding: '0 10px'
                }}>
                  By placing your order, you agree to our <a href="#" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: '700' }}>privacy notice</a> and <a href="#" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: '700' }}>conditions of use</a>.
                </div>

                <button
                  onClick={handleConfirmOrder}
                  disabled={!selectedAddress || items.length === 0}
                  style={{
                    marginTop: '8px',
                    width: '100%',
                    padding: '20px',
                    fontSize: '16px',
                    fontWeight: '800',
                    backgroundColor: '#1a1a2e',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '16px',
                    cursor: (!selectedAddress || items.length === 0) ? 'not-allowed' : 'pointer',
                    opacity: (!selectedAddress || items.length === 0) ? 0.6 : 1,
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    boxShadow: '0 10px 25px rgba(26, 26, 46, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px'
                  }}
                  onMouseOver={(e) => {
                    if (selectedAddress && items.length > 0) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.backgroundColor = '#252545';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (selectedAddress && items.length > 0) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.backgroundColor = '#1a1a2e';
                    }
                  }}
                >
                  <span className="material-icons" style={{ fontSize: '20px' }}>lock</span>
                  PLACE ORDER
                </button>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
                  <span className="material-icons" style={{ fontSize: '16px', color: '#17A073' }}>verified</span>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#8a92a6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Secure Checkout</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </WebLayout>
  );
};

export default CheckoutPage;
