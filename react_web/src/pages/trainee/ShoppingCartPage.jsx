import React from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../../stores/cartStore';
import WebLayout from '../../components/WebLayout';
import CachedImage from '../../components/CachedImage';
import styles from '../../components/WebLayout.module.css';

const ShoppingCartPage = () => {
  const navigate = useNavigate();
  // Map cartStore methods to the previous variable names
  const { items: cart, updateQuantity: updateCartItem, removeItem: removeFromCart } = useCartStore();

  const total = (cart || []).reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

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
            <button className={styles.btnPrimary} onClick={() => navigate('/trainee/checkout')}>
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </WebLayout>
  );
};

export default ShoppingCartPage;
