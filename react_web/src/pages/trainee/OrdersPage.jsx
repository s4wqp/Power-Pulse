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

  return (
    <WebLayout title="My Orders" subtitle="Track your order history">
      {isLoading ? (
        <div className={styles.loadingSpinner}><div className={styles.spinner} /></div>
      ) : orders.length === 0 ? (
        <div className={styles.emptyState}>
          <span className="material-icons">receipt_long</span>
          <p>You haven&apos;t placed any orders yet</p>
        </div>
      ) : (
        <div className={styles.card}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, idx) => (
                <tr key={order.id || idx}>
                  <td style={{ fontWeight: 600 }}>#{(order.id?.toString() || 'XXXX').substring(0, 8)}</td>
                  <td>{new Date(order.orderDate || order.createdAt).toLocaleDateString()}</td>
                  <td>
                    {order.items?.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 13 }}>{item.productName || item.title} x{item.quantity}</span>
                      </div>
                    )) || 'N/A'}
                  </td>
                  <td style={{ fontWeight: 700, color: '#17A073' }}>{order.totalPrice || order.totalAmount} EGP</td>
                  <td>
                    <span className={`${styles.badge} ${order.orderStatus === 'Delivered' || order.status === 'Delivered' ? styles.badgeGreen : styles.badgeBlue}`}>
                      {order.orderStatus || order.status || 'Processing'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </WebLayout>
  );
};

export default OrdersPage;
