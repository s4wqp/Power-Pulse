import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../../stores/cartStore';
import useTraineeStore from '../../stores/traineeStore';
import useAuthStore from '../../stores/authStore';
import Button from '../../components/Button';
import CachedImage from '../../components/CachedImage';
import styles from './Trainee.module.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items } = useCartStore();
  const { user } = useAuthStore();
  const { addresses, fetchAddresses, isLoading } = useTraineeStore();

  const [selectedAddressId, setSelectedAddressId] = useState(null);

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
  const selectedAddress = addresses.find(a => a.id === selectedAddressId) || addresses[0];

  if (items.length === 0) {
    navigate('/trainee/cart', { replace: true });
    return null;
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.appBar}>
        <div className={styles.headerRow} style={{ marginBottom: 0 }}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <span className="material-icons">arrow_back_ios</span>
          </button>
          <span style={{ fontSize: '20px', fontWeight: 'bold' }}>Checkout</span>
        </div>
      </div>

      <div className={styles.scrollContent}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Delivery Address</span>
            <button onClick={() => navigate('/trainee/addresses')} style={{ color: 'var(--color-primary)', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
              Change
            </button>
          </div>

          {isLoading ? (
            <div style={{ padding: '16px', textAlign: 'center', color: '#888' }}>Loading address...</div>
          ) : selectedAddress ? (
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F9F9F9', padding: '16px', borderRadius: '12px' }}>
              <span className="material-icons" style={{ color: 'var(--color-primary)', marginRight: '16px', fontSize: '28px' }}>location_on</span>
              <div>
                <div style={{ fontWeight: 'bold' }}>{selectedAddress.building || 'Home'}</div>
                <div style={{ color: 'var(--color-text-second)', fontSize: '14px', marginTop: '4px' }}>
                  {selectedAddress.street}{selectedAddress.apartment ? `, Apt ${selectedAddress.apartment}` : ''}
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

        <div style={{ marginBottom: '24px' }}>
          <span style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', display: 'block' }}>Order Summary</span>
          {items.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #F0F0F0' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <CachedImage imageUrl={item.image} width="40px" height="40px" borderRadius={8} />
                <span style={{ marginLeft: '12px', fontWeight: 'bold' }}>{item.quantity}x {item.title}</span>
              </div>
              <span style={{ fontWeight: 'bold' }}>{(item.price * item.quantity).toFixed(2)} EGP</span>
            </div>
          ))}
        </div>

        {/* Total Footer */}
        <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: 'var(--color-text-second)' }}>Subtotal:</span>
            <span style={{ fontWeight: 'bold' }}>{totalAmount.toFixed(2)} EGP</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            <span style={{ color: 'var(--color-text-second)' }}>Delivery:</span>
            <span style={{ fontWeight: 'bold' }}>0.00 EGP</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '18px', fontWeight: 'bold' }}>
            <span>Total:</span>
            <span style={{ color: 'var(--color-primary)' }}>{totalAmount.toFixed(2)} EGP</span>
          </div>

          <Button
            onClick={() => navigate('/trainee/payment-details', { state: { addressId: selectedAddressId } })}
            disabled={!selectedAddress}
          >
            {selectedAddress ? 'Proceed to Payment' : 'Select an Address First'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
