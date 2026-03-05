import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useCartStore from '../../stores/cartStore';
import WebLayout from '../../components/WebLayout';
import CachedImage from '../../components/CachedImage';
import { showToast } from '../../utils/custom';
import styles from '../../components/WebLayout.module.css';

const GenericDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const item = location.state?.product || location.state?.item;
  const addItem = useCartStore(state => state.addItem);

  const [quantity, setQuantity] = useState(1);

  if (!item) {
    navigate(-1);
    return null;
  }

  // API returns number for price, fallback to 0 if undefined
  const numericPrice = typeof item.price === 'number' ? item.price : parseFloat((item.price || '0').toString().replace(/[^0-9.]/g, '')) || 0;

  // Real API returns imageUrls array, mock returned image string
  const imageUrl = item.imageUrls?.[0] || item.image;

  const handleAddToCart = () => {
    addItem({
      title: item.name,
      price: numericPrice,
      quantity: quantity,
      image: imageUrl,
      id: item.id
    });
    showToast('Item added to cart!');
    navigate('/trainee/cart');
  };

  return (
    <WebLayout title={item.name} subtitle="Product Details" showBackButton>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>

        {/* Left Column: Image */}
        <div className={styles.card} style={{ flex: '1 1 400px', padding: 0, overflow: 'hidden' }}>
          <div style={{ height: 400, width: '100%', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {imageUrl ? (
              <CachedImage imageUrl={imageUrl} width="100%" height="100%" fit="contain" />
            ) : (
              <span className="material-icons" style={{ fontSize: 80, color: '#ccc' }}>images</span>
            )}
          </div>
        </div>

        {/* Right Column: Details */}
        <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          <div className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <h1 className={styles.cardTitle} style={{ fontSize: 32 }}>{item.name}</h1>
              {item.calories && (
                <span style={{ backgroundColor: 'rgba(238, 59, 59, 0.1)', color: '#ee3b3b', padding: '6px 12px', borderRadius: 12, fontSize: 13, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span className="material-icons" style={{ fontSize: 16 }}>local_fire_department</span>
                  {item.calories} kcal
                </span>
              )}
            </div>

            <div style={{ color: 'var(--color-primary)', fontSize: 28, fontWeight: 'bold', marginBottom: 24 }}>
              {numericPrice.toFixed(2)} EGP
            </div>

            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Description</h2>
            <p style={{ color: '#666', lineHeight: 1.6, fontSize: 15, whiteSpace: 'pre-wrap', marginBottom: 24 }}>
              {item.description || "No description provided."}
            </p>

            {/* Quantity Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <span style={{ fontWeight: 600, color: '#333' }}>Quantity</span>
              <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F0F0F0', borderRadius: 20, padding: 4 }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'white', cursor: 'pointer', fontWeight: 'bold', color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                >-</button>
                <span style={{ margin: '0 16px', fontWeight: 'bold', minWidth: 20, textAlign: 'center' }}>{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', backgroundColor: 'var(--color-primary)', color: 'white', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(23,160,115,0.2)' }}
                >+</button>
              </div>
            </div>

            {/* Total and Add to Cart */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingtop: 24, borderTop: '1px solid #efefef', marginTop: 'auto' }}>
              <div>
                <span style={{ color: '#999', fontSize: 14 }}>Total Price</span>
                <div style={{ color: 'var(--color-black)', fontSize: 24, fontWeight: 'bold' }}>
                  {(numericPrice * quantity).toFixed(2)} EGP
                </div>
              </div>
              <button
                onClick={handleAddToCart}
                style={{ backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 12, padding: '14px 24px', fontWeight: 'bold', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'background 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#12825c'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
              >
                <span className="material-icons">shopping_cart</span>
                Add to Cart
              </button>
            </div>

          </div>

        </div>
      </div>
    </WebLayout>
  );
};

export default GenericDetailsPage;
