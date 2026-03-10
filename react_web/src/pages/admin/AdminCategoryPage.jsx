import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productService } from '../../services/productService';
import WebLayout from '../../components/WebLayout';
import CachedImage from '../../components/CachedImage';
import styles from '../../components/WebLayout.module.css';
import toast from 'react-hot-toast';
import useAuthStore from '../../stores/authStore';

const storeTypeMap = { Food: 'HealthyMeals', Supplements: 'Supplements', Clothes: 'Apparel' };

const AdminCategoryPage = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const categoryType = categoryId || 'Food';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const { user } = useAuthStore();

  useEffect(() => {
    fetchProducts();
  }, [categoryType]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const storeType = storeTypeMap[categoryType] || 'HealthyMeals';
      const data = await productService.getProducts(storeType);
      setItems((data || []).map(p => ({
        ...p,
        id: p.id,
        name: p.name || 'Unknown',
        price: p.price || 0,
        image: p.imageUrls?.[0] || null,
        calories: p.calories || '',
        measure: p.measure || '',
        unit: p.unit || '',
        type: p.type || '',
        description: p.description || '',
      })));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await productService.deleteProduct(productId, user?.id);
      setItems(prev => prev.filter(i => i.id !== productId));
      toast.success('Item deleted successfully');
    } catch (err) {
      console.error('Delete failed:', err?.response?.status, err?.response?.data, err);
      const msg = err?.response?.data?.message || err?.response?.data || err?.message || 'Unknown error';
      toast.error(`Failed to delete item: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
    }
  };

  const filtered = items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <WebLayout title={`${categoryType} Management`} subtitle={`Manage your ${categoryType.toLowerCase()} products`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div className={styles.searchBar}>
          <span className="material-icons">search</span>
          <input placeholder="Search items..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <button className={styles.btnPrimary} onClick={() => navigate(`/admin/category/${categoryType}/add`)}>
          <span className="material-icons">add</span> Add {categoryType} Item
        </button>
      </div>

      {loading ? (
        <div className={styles.loadingSpinner}><div className={styles.spinner} /></div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <span className="material-icons">inventory_2</span>
          <p>No {categoryType.toLowerCase()} items found</p>
        </div>
      ) : (
        <div className={styles.card}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                {categoryType === 'Food' && <th>Calories</th>}
                {categoryType === 'Supplements' && <th>Details</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ width: 50, height: 50, borderRadius: 10, overflow: 'hidden', background: '#f5f5f5' }}>
                      {item.image ? (
                        <CachedImage imageUrl={item.image} width="100%" height="100%" fit="cover" />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span className="material-icons" style={{ color: '#ccc' }}>image</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{item.name}</td>
                  <td style={{ color: '#17A073', fontWeight: 600 }}>{item.price} EGP</td>
                  {categoryType === 'Food' && <td>{item.calories} {/^\d+$/.test(item.calories) ? 'kcal' : ''}</td>}
                  {categoryType === 'Supplements' && (
                    <td>{item.measure ? `${item.type || 'Supplement'}: ${item.measure}${item.unit}` : item.calories}</td>
                  )}
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => navigate(`/admin/category/${categoryType}/add`, { state: { editItem: item } })}
                        style={{ background: 'rgba(23,160,115,0.1)', color: '#17A073', border: 'none', padding: '8px 12px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <span className="material-icons" style={{ fontSize: 18 }}>edit</span> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        style={{ background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: 'none', padding: '8px 12px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <span className="material-icons" style={{ fontSize: 18 }}>delete</span> Delete
                      </button>
                    </div>
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

export default AdminCategoryPage;
