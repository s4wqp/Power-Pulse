import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { productService } from '../../services/productService';
import WebLayout from '../../components/WebLayout';
import styles from '../../components/WebLayout.module.css';
import toast from 'react-hot-toast';

const storeTypeMap = { Food: 'HealthyMeals', Supplements: 'Supplements', Clothes: 'Apparel' };

const AdminAddItemPage = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const categoryType = categoryId || 'Food';
  const { user } = useAuthStore();

  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');
  const [measure, setMeasure] = useState('');
  const [supplementType, setSupplementType] = useState('Protein');
  const [gender, setGender] = useState('Men');
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    fetchCategories();
  }, [categoryType]);

  const fetchCategories = async () => {
    try {
      const storeType = storeTypeMap[categoryType] || 'HealthyMeals';
      const data = await productService.getProductCategories(storeType);
      setCategories(data || []);
    } catch {
      setCategories([]);
    } finally {
      setLoadingCats(false);
    }
  };

  const toggleSize = (size) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const handleSave = async () => {
    if (!name.trim() || !price.trim()) {
      toast.error('Name and price are required');
      return;
    }
    if (!selectedCategoryId) {
      toast.error('Please select a category');
      return;
    }

    setSaving(true);
    const priceNum = parseFloat(price.replace(/[^0-9.]/g, '')) || 0;
    const storeType = storeTypeMap[categoryType] || 'HealthyMeals';

    const attributes = [];
    if (categoryType === 'Food') {
      attributes.push({ attrName: 'Calories', attrValue: calories.trim(), attrUnit: 'kcal' });
    } else if (categoryType === 'Supplements') {
      attributes.push({ attrName: 'Type', attrValue: supplementType });
      attributes.push({ attrName: 'Grams', attrValue: measure.trim(), attrUnit: supplementType === 'Protein' ? 'g' : 'ml' });
    } else if (categoryType === 'Clothes') {
      selectedSizes.forEach(size => {
        attributes.push({ attrName: 'Size', attrValue: size, attrUnit: gender });
      });
    }

    const payload = {
      name: name.trim(),
      price: priceNum,
      description: description.trim() || 'No description',
      imageUrls: imageUrl.trim() ? [imageUrl.trim()] : [],
      storeType,
      productCategoryId: parseInt(selectedCategoryId),
      attributes,
    };

    try {
      await productService.createProduct(user?.id, payload);
      toast.success('Product added successfully!');
      navigate(-1);
    } catch (err) {
      toast.error('Failed to add product: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <WebLayout title={`Add ${categoryType} Item`} subtitle="Fill in the product details below">
      <div className={styles.card}>
        {loadingCats ? (
          <div className={styles.loadingSpinner}><div className={styles.spinner} /></div>
        ) : (
          <div className={styles.formGrid}>
            {/* Category */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Category</label>
              <select className={styles.formSelect} value={selectedCategoryId} onChange={e => setSelectedCategoryId(e.target.value)}>
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Name */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Item Name</label>
              <input className={styles.formInput} placeholder="Enter item name" value={name} onChange={e => setName(e.target.value)} />
            </div>

            {/* Price */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Price (EGP)</label>
              <input className={styles.formInput} placeholder="e.g. 200" value={price} onChange={e => setPrice(e.target.value)} />
            </div>

            {/* Image URL */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Image URL</label>
              <input className={styles.formInput} placeholder="https://..." value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
            </div>

            {/* Description */}
            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.formLabel}>Description</label>
              <textarea className={styles.formInput} rows={3} placeholder="Enter item description" value={description} onChange={e => setDescription(e.target.value)} />
            </div>

            {/* Food-specific */}
            {categoryType === 'Food' && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Calories</label>
                <input className={styles.formInput} type="number" placeholder="e.g. 500" value={calories} onChange={e => setCalories(e.target.value)} />
              </div>
            )}

            {/* Supplements-specific */}
            {categoryType === 'Supplements' && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Type</label>
                  <div style={{ display: 'flex', gap: 16 }}>
                    {['Protein', 'Supplements'].map(t => (
                      <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                        <input type="radio" name="suppType" value={t} checked={supplementType === t} onChange={() => setSupplementType(t)} />
                        {t}
                      </label>
                    ))}
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{supplementType === 'Protein' ? 'Grams' : 'Volume (ml)'}</label>
                  <input className={styles.formInput} type="number" placeholder={supplementType === 'Protein' ? 'e.g. 30' : 'e.g. 250'} value={measure} onChange={e => setMeasure(e.target.value)} />
                </div>
              </>
            )}

            {/* Clothes-specific */}
            {categoryType === 'Clothes' && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Gender</label>
                  <div style={{ display: 'flex', gap: 16 }}>
                    {['Men', 'Women'].map(g => (
                      <label key={g} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                        <input type="radio" name="gender" value={g} checked={gender === g} onChange={() => setGender(g)} />
                        {g}
                      </label>
                    ))}
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Sizes</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        style={{
                          padding: '8px 16px', borderRadius: 8, border: '1px solid #e0e0e0',
                          background: selectedSizes.includes(size) ? '#17A073' : '#f5f5f5',
                          color: selectedSizes.includes(size) ? '#fff' : '#333',
                          cursor: 'pointer', fontWeight: 600, fontSize: 13,
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Submit */}
            <div className={`${styles.formGroup} ${styles.formGroupFull}`} style={{ marginTop: 10 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className={styles.btnPrimary} onClick={handleSave} disabled={saving}>
                  {saving ? 'Adding...' : 'Add Item'}
                </button>
                <button className={styles.btnSecondary} onClick={() => navigate(-1)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </WebLayout>
  );
};

export default AdminAddItemPage;
