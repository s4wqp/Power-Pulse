import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../../stores/cartStore';
import useTraineeStore from '../../stores/traineeStore';
import useAuthStore from '../../stores/authStore';
import WebLayout from '../../components/WebLayout';
import CachedImage from '../../components/CachedImage';
import styles from '../../components/WebLayout.module.css';

const ShoppingCartPage = () => {
  const navigate = useNavigate();
  const { items: cart, updateQuantity: updateCartItem, removeItem: removeFromCart } = useCartStore();
  const { user } = useAuthStore();
  const { addresses, fetchAddresses, isLoading } = useTraineeStore();

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const total = (cart || []).reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

  // Fetch addresses when modal opens
  useEffect(() => {
    if (showAddressModal && user?.id) {
      fetchAddresses(user.id);
    }
  }, [showAddressModal, user, fetchAddresses]);

  // Auto-select first address when addresses load
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      setSelectedAddressId(addresses[0].id);
    }
  }, [addresses, selectedAddressId]);

  const handleProceedToCheckout = () => {
    setShowAddressModal(true);
  };

  const handleContinueToCheckout = () => {
    if (!selectedAddressId) {
      return;
    }
    setShowAddressModal(false);
    navigate('/trainee/checkout', { state: { selectedAddressId } });
  };

  return (
    <WebLayout title="Shopping Cart" subtitle={`${cart?.length || 0} items in your cart`}>
      {!cart || cart.length === 0 ? (
        <div className={styles.emptyState}>
          <span className="material-icons">shopping_cart</span>
          <p>Your cart is empty</p>
          <button className={styles.btnPrimary} style={{ marginTop: 16 }} onClick={() => navigate('/trainee/food')}>
            Browse Store
          </button>
        </div>
      ) : (
        <>
          <div className={styles.card}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 50, height: 50, borderRadius: 10, overflow: 'hidden', background: '#f5f5f5', flexShrink: 0 }}>
                        {item.image || item.imageUrl ? (
                          <CachedImage imageUrl={item.image || item.imageUrl} width="100%" height="100%" fit="cover" />
                        ) : (
                          <span className="material-icons" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#ccc' }}>image</span>
                        )}
                      </div>
                      <span style={{ fontWeight: 600 }}>{item.name || item.title}</span>
                    </td>
                    <td>{item.price} EGP</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          onClick={() => updateCartItem(idx, Math.max(1, (item.quantity || 1) - 1))}
                          style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #e0e0e0', background: '#f5f5f5', cursor: 'pointer', fontSize: 16 }}
                        >−</button>
                        <span style={{ fontWeight: 600, minWidth: 20, textAlign: 'center' }}>{item.quantity || 1}</span>
                        <button
                          onClick={() => updateCartItem(idx, (item.quantity || 1) + 1)}
                          style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #e0e0e0', background: '#f5f5f5', cursor: 'pointer', fontSize: 16 }}
                        >+</button>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: '#17A073' }}>{(item.price || 0) * (item.quantity || 1)} EGP</td>
                    <td>
                      <button onClick={() => removeFromCart(idx)} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer' }}>
                        <span className="material-icons">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.card} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: 16, color: '#888' }}>Total: </span>
              <span style={{ fontSize: 24, fontWeight: 700, color: '#17A073' }}>{total} EGP</span>
            </div>
            <button className={styles.btnPrimary} onClick={handleProceedToCheckout}>
              Proceed to Checkout
            </button>
          </div>
        </>
      )}

      {/* ============ Address Selection Modal ============ */}
      {showAddressModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
        }} onClick={() => setShowAddressModal(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white', borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
              padding: '24px', width: '100%', maxWidth: '500px',
              maxHeight: '70vh', overflowY: 'auto',
              animation: 'slideUp 0.3s ease-out'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Select Delivery Address</h3>
              <button onClick={() => setShowAddressModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <span className="material-icons">close</span>
              </button>
            </div>

            {/* Address List */}
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#888' }}>Loading addresses...</div>
            ) : addresses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px' }}>
                <span className="material-icons" style={{ fontSize: '48px', color: '#ccc', marginBottom: '12px', display: 'block' }}>location_off</span>
                <p style={{ color: '#888', marginBottom: '16px' }}>No saved addresses found.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    style={{
                      padding: '16px',
                      borderRadius: '14px',
                      border: selectedAddressId === addr.id ? '2px solid #17A073' : '2px solid #EEE',
                      backgroundColor: selectedAddressId === addr.id ? '#F0FFF7' : '#FAFAFA',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    {/* Radio indicator */}
                    <div style={{
                      width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                      border: selectedAddressId === addr.id ? '2px solid #17A073' : '2px solid #CCC',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {selectedAddressId === addr.id && (
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#17A073' }} />
                      )}
                    </div>
                    {/* Address details */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: '4px' }}>
                        {addr.building || addr.title || 'Address'}
                      </div>
                      <div style={{ fontSize: '13px', color: '#777' }}>
                        {[addr.street, addr.floor ? `Floor ${addr.floor}` : '', addr.apartment ? `Apt ${addr.apartment}` : ''].filter(Boolean).join(' • ')}
                      </div>
                      {addr.phone && (
                        <div style={{ fontSize: '12px', color: '#AAA', marginTop: '4px' }}>
                          <span className="material-icons" style={{ fontSize: '14px', verticalAlign: 'middle', marginRight: '4px' }}>phone</span>
                          {addr.phone}
                        </div>
                      )}
                    </div>
                    {/* Check icon */}
                    {selectedAddressId === addr.id && (
                      <span className="material-icons" style={{ color: '#17A073', fontSize: '24px' }}>check_circle</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Create New Address button */}
            <button
              onClick={() => {
                setShowAddressModal(false);
                navigate('/trainee/addresses/new');
              }}
              style={{
                width: '100%', padding: '14px', borderRadius: '14px',
                border: '2px dashed #CCC', background: 'white',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '8px', color: '#17A073',
                fontSize: '15px', fontWeight: 'bold', marginBottom: '16px'
              }}
            >
              <span className="material-icons">add_location_alt</span>
              Create New Address
            </button>

            {/* Continue button */}
            <button
              onClick={handleContinueToCheckout}
              disabled={!selectedAddressId || addresses.length === 0}
              style={{
                width: '100%', padding: '16px', borderRadius: '30px',
                border: 'none', backgroundColor: (!selectedAddressId || addresses.length === 0) ? '#CCC' : '#17A073',
                color: 'white', fontSize: '16px', fontWeight: 'bold',
                cursor: (!selectedAddressId || addresses.length === 0) ? 'not-allowed' : 'pointer'
              }}
            >
              Continue to Checkout
            </button>
          </div>
        </div>
      )}

      {/* Keyframe for modal slide up animation */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </WebLayout>
  );
};

export default ShoppingCartPage;
