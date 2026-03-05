import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';
import WebLayout from '../../components/WebLayout';
import CachedImage from '../../components/CachedImage';
import styles from '../../components/WebLayout.module.css';

const GenericCategoryPage = () => {
  const navigate = useNavigate();
  const storeType = window.location.pathname.includes('supplements') ? 'Supplements'
    : window.location.pathname.includes('clothes') ? 'Apparel' : 'HealthyMeals';
  const pageTitle = storeType === 'Supplements' ? 'Supplements' : storeType === 'Apparel' ? 'Gym Wear' : 'Food Store';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProducts();
  }, [storeType]);

  const loadProducts = async () => {
    try {
      const data = await productService.getProducts(storeType);
      setProducts(data || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter(p =>
    (p.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <WebLayout title={pageTitle} subtitle={`Browse our ${pageTitle.toLowerCase()} collection`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div className={styles.searchBar}>
          <span className="material-icons">search</span>
          <input placeholder={`Search ${pageTitle.toLowerCase()}...`} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingSpinner}><div className={styles.spinner} /></div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <span className="material-icons">storefront</span>
          <p>No products found</p>
        </div>
      ) : (
        <div className={styles.itemsGrid}>
          {filtered.map((product) => (
            <div
              key={product.id}
              className={styles.itemCard}
              onClick={() => navigate(`/trainee/product/${product.id}`, { state: { product } })}
            >
              <div className={styles.itemImage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {product.imageUrls?.[0] ? (
                  <CachedImage imageUrl={product.imageUrls[0]} width="100%" height="100%" fit="cover" />
                ) : (
                  <span className="material-icons" style={{ fontSize: 40, color: '#ddd' }}>image</span>
                )}
              </div>
              <div className={styles.itemBody}>
                <div className={styles.itemName}>{product.name}</div>
                <div className={styles.itemPrice}>{product.price} EGP</div>
                {product.calories && <div className={styles.itemMeta}>{product.calories} kcal</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </WebLayout>
  );
};

export default GenericCategoryPage;
