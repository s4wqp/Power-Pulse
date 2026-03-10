import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { productService } from '../../services/productService';
import WebLayout from '../../components/WebLayout';
import styles from '../../components/WebLayout.module.css';
import toast from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';
import { driveService } from '../../services/driveService';
import CachedImage from '../../components/CachedImage';

const storeTypeMap = { Food: 'HealthyMeals', Supplements: 'Supplements', Clothes: 'Apparel' };

const AdminAddItemPage = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const categoryType = categoryId || 'Food';
  const { user } = useAuthStore();

  const location = useLocation();
  const editItem = location.state?.editItem;

  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Helper to extract attribute values
  const getAttr = (name) => {
    return editItem?.attributes?.find(a => a.attrName?.toLowerCase() === name.toLowerCase())?.attrValue || '';
  };

  // Form state
  const [name, setName] = useState(editItem?.name || '');
  const [price, setPrice] = useState(editItem?.price || '');
  const [description, setDescription] = useState(editItem?.description || '');
  const [calories, setCalories] = useState(getAttr('Calories') || getAttr('Calorie') || editItem?.calories || '');

  const typeAttr = getAttr('Type');
  const [supplementType, setSupplementType] = useState(typeAttr || 'Protein');

  const [measure, setMeasure] = useState(getAttr('Grams') || editItem?.measure || '');
  const [gender, setGender] = useState(editItem?.attributes?.find(a => a.attrName?.toLowerCase() === 'size')?.attrUnit || 'Men');

  const [selectedSizes, setSelectedSizes] = useState(
    editItem?.attributes?.filter(a => a.attrName?.toLowerCase() === 'size').map(a => a.attrValue) || []
  );

  const [selectedCategoryId, setSelectedCategoryId] = useState(() => {
    // Attempt to match category name to id
    return editItem?.productCategoryId || editItem?.productCategoryName || '';
  });
  const [imageUrl, setImageUrl] = useState(editItem?.imageUrls?.[0] || '');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(editItem?.imageUrls?.[0] || null);

  useEffect(() => {
    fetchCategories();
  }, [categoryType]);

  const fetchCategories = async () => {
    try {
      const storeType = storeTypeMap[categoryType] || 'HealthyMeals';
      const data = await productService.getProductCategories(storeType);
      setCategories(data || []);

      // If we are editing, we need to ensure the ID matches an existing category.
      let finalCatId = '';
      if (editItem) {
        if (editItem.productCategoryId) {
          finalCatId = String(editItem.productCategoryId);
        } else if (editItem.productCategoryName) {
          const matched = (data || []).find(c => c.name.toLowerCase() === editItem.productCategoryName.toLowerCase());
          if (matched) finalCatId = String(matched.id);
        }
      }
      if (finalCatId) setSelectedCategoryId(finalCatId);
    } catch {
      setCategories([]);
    } finally {
      setLoadingCats(false);
    }
  };

  const toggleSize = (size) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => submitData(tokenResponse.access_token),
    onError: () => {
      setSaving(false);
      toast.error('Google login failed for image upload');
    },
    scope: 'https://www.googleapis.com/auth/drive.file'
  });

  const handleSave = () => {
    setApiError(null); // Clear previous errors

    const safeName = String(name || '').trim();
    const safePrice = String(price || '').trim();

    if (!safeName || !safePrice) {
      toast.error('Name and price are required');
      return;
    }
    const catIdNum = parseInt(selectedCategoryId);
    if (!selectedCategoryId || isNaN(catIdNum) || catIdNum <= 0) {
      toast.error('Please select a valid category');
      return;
    }

    setSaving(true);
    if (imageFile) {
      googleLogin(); // Trigger Google OAuth to get token, which then calls submitData
    } else {
      submitData(null); // Save without a new image
    }
  };

  const submitData = async (token) => {
    try {
      let finalImageUrl = imageUrl;
      if (imageFile) {
        if (!token) throw new Error("Missing Drive Token");
        finalImageUrl = await driveService.uploadFileWithToken(imageFile, token);
      }

      const safeName = String(name || '').trim();
      const safePrice = String(price || '').trim();
      const safeDesc = String(description || '').trim();
      const safeCalories = String(calories || '').trim();
      const safeMeasure = String(measure || '').trim();

      const priceNum = parseFloat(safePrice.replace(/[^0-9.]/g, '')) || 0;
      const storeType = storeTypeMap[categoryType] || 'HealthyMeals';

      const attributes = [];
      if (categoryType === 'Food') {
        attributes.push({ attrName: 'Calories', attrValue: safeCalories, attrUnit: 'kcal' });
      } else if (categoryType === 'Supplements') {
        attributes.push({ attrName: 'Type', attrValue: supplementType });
        attributes.push({ attrName: 'Grams', attrValue: safeMeasure, attrUnit: supplementType === 'Protein' ? 'g' : 'ml' });
      } else if (categoryType === 'Clothes') {
        selectedSizes.forEach(size => {
          attributes.push({ attrName: 'Size', attrValue: size, attrUnit: gender });
        });
      }

      const basePayload = {
        name: safeName,
        price: priceNum,
        description: safeDesc || 'No description',
        imageUrls: finalImageUrl ? [finalImageUrl.trim()] : [],
        productCategoryId: parseInt(selectedCategoryId) || null,
        attributes,
      };

      if (editItem) {
        // UpdateProductRequest does NOT accept storeType
        await productService.updateProduct(editItem.id, user?.id, basePayload);
        toast.success('Product updated successfully!');
      } else {
        // CreateProductRequest requires storeType
        await productService.createProduct(user?.id, { ...basePayload, storeType });
        toast.success('Product added successfully!');
      }

      navigate(-1);
    } catch (err) {
      console.error('Save failed:', err.response?.data);
      const backendErrMsg = err.response?.data?.errors
        ? JSON.stringify(err.response.data.errors, null, 2)
        : (err.response?.data?.message || err.message);
      setApiError(backendErrMsg);
      toast.error('Failed to save!');
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      setImageUrl(''); // Clear the manual URL input if you pick a file
    }
  };

  return (
    <WebLayout title={editItem ? `Edit ${categoryType} Item` : `Add ${categoryType} Item`} subtitle={editItem ? "Update the product details below" : "Fill in the product details below"}>
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

            {/* Image Uploader */}
            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.formLabel}>Product Image</label>
              <div
                style={{
                  width: '120px', height: '120px', border: '1px dashed #ccc', borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  position: 'relative', overflow: 'hidden', background: '#f8f9fa'
                }}
                onClick={() => document.getElementById('adminImageUpload').click()}
              >
                {imagePreview ? (
                  imageFile ? (
                    <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <CachedImage imageUrl={imagePreview} width="100%" height="100%" fit="cover" />
                  )
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#888' }}>
                    <span className="material-icons" style={{ fontSize: '32px', marginBottom: '4px' }}>add_photo_alternate</span>
                    <span style={{ fontSize: '12px', fontWeight: '500' }}>Add Image</span>
                  </div>
                )}
                <input
                  type="file"
                  id="adminImageUpload"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                />
              </div>
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

            {apiError && (
              <div style={{ gridColumn: '1 / -1', padding: '16px', background: '#ffe6e6', color: '#cc0000', borderRadius: '8px', border: '1px solid #ffcccc' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Submission Error:</h4>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '12px' }}>{apiError}</pre>
                <div style={{ marginTop: '8px', fontSize: '12px', fontWeight: 'bold' }}>Please copy this message and send it to me!</div>
              </div>
            )}

            {/* Actions */}
            <div className={styles.formGroupFull} style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button className={styles.btnPrimary} onClick={handleSave} disabled={saving}>
                {saving ? (editItem ? 'Updating...' : 'Adding...') : (editItem ? 'Update Item' : 'Add Item')}
              </button>
              <button className={styles.btnSecondary} onClick={() => navigate(-1)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </WebLayout>
  );
};

export default AdminAddItemPage;
