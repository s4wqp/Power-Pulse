import React, { useEffect } from 'react';
import useAuthStore from '../../stores/authStore';
import useTraineeStore from '../../stores/traineeStore';
import WebLayout from '../../components/WebLayout';
import CachedImage from '../../components/CachedImage';
import styles from '../../components/WebLayout.module.css';

const OrdersPage = () => {
  const { user } = useAuthStore();
  const { orders, fetchOrders, isLoading } = useTraineeStore();

  useEffect(() => {
    if (user?.id) fetchOrders(user.id);
  }, [user?.id, fetchOrders]);

  const getStatusStyle = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'delivered') return { bg: 'rgba(23,160,115,0.1)', color: '#17A073', icon: 'check_circle' };
    if (s === 'cancelled') return { bg: 'rgba(255,77,77,0.1)', color: '#ff4d4d', icon: 'cancel' };
    if (s === 'shipped') return { bg: 'rgba(66,133,244,0.1)', color: '#4285f4', icon: 'local_shipping' };
    return { bg: 'rgba(255,152,0,0.1)', color: '#ff9800', icon: 'schedule' };
  };

  const formatDate = (d) => {
    try {
      const date = new Date(d);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return ''; }
  };

  return (
    <WebLayout title="My Orders" subtitle="Track your order history">
      {isLoading ? (
        <div className={styles.loadingSpinner}><div className={styles.spinner} /></div>
      ) : orders.length === 0 ? (
        <div className={styles.emptyState}>
          <span className="material-icons">receipt_long</span>
          <p>You haven't placed any orders yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map((order, idx) => {
            const status = order.orderStatus || order.status || 'Processing';
            const statusStyle = getStatusStyle(status);
            const total = order.totalPrice || order.totalAmount || 0;
            const date = order.orderDate || order.createdAt;
            const items = order.items || [];

            return (
              <div key={order.id || idx} className={styles.card} style={{ padding: '24px' }}>
                {/* Order Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: statusStyle.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-icons" style={{ color: statusStyle.color, fontSize: '22px' }}>{statusStyle.icon}</span>
                    </div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a2e' }}>
                        Order #{(order.id?.toString() || 'XXXX').substring(0, 8)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#8a92a6', marginTop: '2px' }}>
                        {formatDate(date)}
                      </div>
                    </div>
                  </div>
                  <span className={styles.badge} style={{ background: statusStyle.bg, color: statusStyle.color }}>
                    {status}
                  </span>
                </div>

                {/* Order Items */}
                {items.length > 0 && (
                  <div style={{ borderTop: '1px solid #f5f6f8', paddingTop: '14px', marginBottom: '14px' }}>
                    {items.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f5f6f8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                          {item.imageUrl ? (
                            <CachedImage imageUrl={item.imageUrl} width="100%" height="100%" fit="cover" />
                          ) : (
                            <span className="material-icons" style={{ fontSize: '20px', color: '#ccc' }}>inventory_2</span>
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>{item.productName || item.title}</div>
                          <div style={{ fontSize: '12px', color: '#8a92a6' }}>Qty: {item.quantity}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Order Total */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f5f6f8', paddingTop: '14px' }}>
                  <span style={{ fontSize: '14px', color: '#8a92a6', fontWeight: '500' }}>Total Amount</span>
                  <span style={{ fontSize: '20px', fontWeight: '800', color: '#17A073' }}>{total} EGP</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </WebLayout>
  );
};

export default OrdersPage;
