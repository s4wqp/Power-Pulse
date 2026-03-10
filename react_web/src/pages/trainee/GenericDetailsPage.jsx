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

  // Extract sizes from attributes if available
  const sizesFromApi = (item.attributes || [])
    .filter(a => a.attrName?.toLowerCase() === 'size')
    .map(a => a.attrValue);

  // Decide if clothing based on sizes or generic matching
  const isClothing = sizesFromApi.length > 0 ||
    String(item.productCategoryName || item.category || '').toLowerCase().includes('shirt') ||
    /shirt|hood|pant|short|apparel/i.test(item.name || '');

  const availableSizes = sizesFromApi.length > 0 ? sizesFromApi : ['S', 'M', 'L', 'XL', 'XXL'];

  const [selectedSize, setSelectedSize] = useState(availableSizes[0]);

  // Restore necessary product variables
  const numericPrice = typeof item.price === 'number' ? item.price : parseFloat((item.price || '0').toString().replace(/[^0-9.]/g, '')) || 0;
  const imageUrl = item.imageUrls?.[0] || item.image;

  const handleAddToCart = () => {
    addItem({
      title: item.name,
      price: numericPrice,
      quantity: quantity,
      image: imageUrl,
      id: item.id,
      size: isClothing ? selectedSize : null
    });
    showToast('Item added to cart!');
    navigate('/trainee/cart');
  };

  // Extract calories from attributes if available
  const caloriesFromAttr = item.attributes?.find(a => /calorie/i.test(a.attrName))?.attrValue;
  const displayCalories = caloriesFromAttr || item.calories;

  // Determine color based on category/type
  const categoryName = (item.productCategoryName || item.category || '').toLowerCase();
  const isSupplement = categoryName.includes('supplement') || categoryName.includes('protein');
  const isHealthyMeal = categoryName.includes('food') || categoryName.includes('meal') || categoryName.includes('healthy');

  // Rule: food = green, supplement = red
  const calorieColor = isSupplement ? '#ee3b3b' : (isHealthyMeal ? '#17A073' : '#ee3b3b');
  const calorieBg = isSupplement ? 'rgba(238, 59, 59, 0.1)' : (isHealthyMeal ? 'rgba(23, 160, 115, 0.1)' : 'rgba(238, 59, 59, 0.1)');

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
              {displayCalories && (
                <span style={{ backgroundColor: calorieBg, color: calorieColor, padding: '6px 12px', borderRadius: 12, fontSize: 13, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span className="material-icons" style={{ fontSize: 16 }}>local_fire_department</span>
                  {displayCalories} kcal
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

            {/* Sizes Selection */}
            {isClothing && (
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontWeight: 600, color: '#333', display: 'block', marginBottom: 12 }}>Size</span>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {availableSizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      style={{
                        padding: '10px 16px',
                        borderRadius: 12,
                        border: `2px solid ${selectedSize === size ? 'var(--color-primary)' : '#efefef'}`,
                        backgroundColor: selectedSize === size ? 'var(--color-primary)' : '#fff',
                        color: selectedSize === size ? '#fff' : '#666',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        minWidth: 48,
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

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
