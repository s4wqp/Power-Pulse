import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useCartStore from '../../stores/cartStore';
import useTraineeStore from '../../stores/traineeStore';
import useAuthStore from '../../stores/authStore';
import Button from '../../components/Button';
import { showToast } from '../../utils/custom';
import styles from './Trainee.module.css';

const PaymentDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items: cartItems, clearCart } = useCartStore();
  const placeOrder = useTraineeStore(state => state.placeOrder);
  const user = useAuthStore(state => state.user);

  // Passed from CheckoutPage
  const deliveryAddressId = location.state?.addressId;

  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'cash'
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = async () => {
    if (!user?.id) {
      showToast('You must be logged in to checkout.', true);
      return;
    }

    if (cartItems.length === 0) {
      showToast('Your cart is empty', true);
      return;
    }

    setIsProcessing(true);

    // Format items to match backend API requirement: { productId, quantity, selectedOption }
    const itemsPayload = cartItems.map(item => ({
      productId: item.id,
      quantity: item.quantity,
      selectedOption: item.size || item.subCategory || "None" // Fallback if no specific variance selected
    }));

    const orderData = {
      traineeId: user.id,
      deliveryAddressId: deliveryAddressId || null,
      items: itemsPayload
    };

    const orderResponse = await placeOrder(orderData);

    if (orderResponse) {
      clearCart();
      showToast('Order placed successfully!');
      navigate('/trainee/orders', { replace: true });
    } else {
      showToast('Failed to place order. Please try again.', true);
    }

    setIsProcessing(false);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.appBar}>
        <div className={styles.headerRow} style={{ marginBottom: 0 }}>
          <button className={styles.backBtn} onClick={() => navigate(-1)} disabled={isProcessing}>
            <span className="material-icons">arrow_back_ios</span>
          </button>
          <span style={{ fontSize: '20px', fontWeight: 'bold' }}>Payment Details</span>
        </div>
      </div>

      <div className={styles.scrollContent}>
        <span style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', display: 'block' }}>Payment Method</span>

        {/* Method Selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '30px' }}>
          <div
            onClick={() => setPaymentMethod('card')}
            style={{ display: 'flex', alignItems: 'center', padding: '16px', borderRadius: '12px', border: paymentMethod === 'card' ? '2px solid var(--color-primary)' : '1px solid #E0E0E0', cursor: 'pointer', backgroundColor: 'var(--color-white)' }}
          >
            <span className="material-icons" style={{ color: paymentMethod === 'card' ? 'var(--color-primary)' : 'var(--color-gray)', marginRight: '16px' }}>credit_card</span>
            <span style={{ fontWeight: 'bold', flex: 1 }}>Credit / Debit Card</span>
            {paymentMethod === 'card' && <span className="material-icons" style={{ color: 'var(--color-primary)' }}>check_circle</span>}
          </div>

          <div
            onClick={() => setPaymentMethod('cash')}
            style={{ display: 'flex', alignItems: 'center', padding: '16px', borderRadius: '12px', border: paymentMethod === 'cash' ? '2px solid var(--color-primary)' : '1px solid #E0E0E0', cursor: 'pointer', backgroundColor: 'var(--color-white)' }}
          >
            <span className="material-icons" style={{ color: paymentMethod === 'cash' ? 'var(--color-primary)' : 'var(--color-gray)', marginRight: '16px' }}>payments</span>
            <span style={{ fontWeight: 'bold', flex: 1 }}>Cash on Delivery</span>
            {paymentMethod === 'cash' && <span className="material-icons" style={{ color: 'var(--color-primary)' }}>check_circle</span>}
          </div>
        </div>

        {/* Card Form Dummy */}
        {paymentMethod === 'card' && (
          <div style={{ backgroundColor: '#F9F9F9', padding: '20px', borderRadius: '12px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', color: 'var(--color-text-second)', marginBottom: '8px', display: 'block' }}>Cardholder Name</label>
              <input type="text" placeholder="John Doe" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E0E0E0', fontSize: '16px' }} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', color: 'var(--color-text-second)', marginBottom: '8px', display: 'block' }}>Card Number</label>
              <input type="text" placeholder="**** **** **** 1234" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E0E0E0', fontSize: '16px' }} />
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '14px', color: 'var(--color-text-second)', marginBottom: '8px', display: 'block' }}>Expiry Date</label>
                <input type="text" placeholder="MM/YY" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E0E0E0', fontSize: '16px' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '14px', color: 'var(--color-text-second)', marginBottom: '8px', display: 'block' }}>CVV</label>
                <input type="password" placeholder="***" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E0E0E0', fontSize: '16px' }} />
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: 'auto', paddingTop: '40px' }}>
          <Button onClick={handlePay} disabled={isProcessing || paymentMethod === 'card'}>
            {isProcessing ? 'Processing API Order...' : paymentMethod === 'card' ? 'Card Payments Disabled in Web Demo' : `Confirm & Place Order`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailsPage;
