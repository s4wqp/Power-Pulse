import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { traineeService } from '../../services/traineeService';
import WebLayout from '../../components/WebLayout';
import styles from '../../components/WebLayout.module.css';
import toast from 'react-hot-toast';

const DeliveryAddressesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) loadAddresses();
  }, [user?.id]);

  const loadAddresses = async () => {
    try {
      const data = await traineeService.getAddresses(user.id);
      // .NET API wraps in { value: [] }
      const list = Array.isArray(data) ? data : (data?.value || data?.$values || []);
      setAddresses(list);
    } catch {
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await traineeService.deleteAddress(user.id, addressId);
      setAddresses(prev => prev.filter(a => a.id !== addressId));
      toast.success('Address deleted');
    } catch {
      toast.error('Failed to delete address');
    }
  };

  return (
    <WebLayout title="Delivery Addresses" subtitle="Manage your delivery addresses">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button className={styles.btnPrimary} onClick={() => navigate('/trainee/addresses/new')}>
          <span className="material-icons">add</span> Add Address
        </button>
      </div>

      {loading ? (
        <div className={styles.loadingSpinner}><div className={styles.spinner} /></div>
      ) : addresses.length === 0 ? (
        <div className={styles.emptyState}>
          <span className="material-icons">location_off</span>
          <p>No addresses saved yet</p>
        </div>
      ) : (
        <div className={styles.itemsGrid}>
          {addresses.map((addr) => (
            <div key={addr.id} className={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600 }}>{addr.label || addr.title || 'Address'}</h3>
                  <p style={{ margin: 0, fontSize: 14, color: '#666', lineHeight: 1.5 }}>
                    {addr.street || addr.addressLine1 || ''}{addr.city ? `, ${addr.city}` : ''}{addr.area ? `, ${addr.area}` : ''}
                  </p>
                  {addr.phone && <p style={{ margin: '4px 0 0', fontSize: 13, color: '#888' }}>📞 {addr.phone}</p>}
                </div>
                <button onClick={() => handleDelete(addr.id)} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', padding: 4 }}>
                  <span className="material-icons" style={{ fontSize: 20 }}>delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </WebLayout>
  );
};

export default DeliveryAddressesPage;
