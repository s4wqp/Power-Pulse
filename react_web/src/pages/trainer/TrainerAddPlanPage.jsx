import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { trainerService } from '../../services/trainerService';
import WebLayout from '../../components/WebLayout';
import toast from 'react-hot-toast';
import styles from '../../components/WebLayout.module.css';

const TrainerAddPlanPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const existingPlan = location.state?.plan;
  const isEditing = !!existingPlan;

  const [isLoading, setIsLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [durationVal, setDurationVal] = useState('');
  const [durationUnit, setDurationUnit] = useState('Months');
  const [badge, setBadge] = useState('');
  const [features, setFeatures] = useState(['']);

  useEffect(() => {
    if (existingPlan) {
      setTitle(existingPlan.name || '');
      setDescription(existingPlan.description || '');
      setPrice(existingPlan.price?.toString() || '');
      setBadge(existingPlan.badge || '');

      if (existingPlan.features && existingPlan.features.length > 0) {
        setFeatures(existingPlan.features);
      }

      // Parse Duration
      if (existingPlan.durationMonths && existingPlan.durationMonths > 0) {
        setDurationUnit('Months');
        setDurationVal(existingPlan.durationMonths.toString());
      } else if (existingPlan.durationDays && existingPlan.durationDays > 0) {
        setDurationUnit('Days');
        setDurationVal(existingPlan.durationDays.toString());
      } else if (existingPlan.durationHours && existingPlan.durationHours > 0) {
        if (existingPlan.durationHours < 1.0) {
          setDurationUnit('Minutes');
          setDurationVal((existingPlan.durationHours * 60).toString());
        } else {
          setDurationUnit('Hours');
          setDurationVal(existingPlan.durationHours.toString());
        }
      } else {
        setDurationUnit('Months');
        setDurationVal('0');
      }
    }
  }, [existingPlan]);

  const handleAddFeature = () => setFeatures([...features, '']);
  const handleRemoveFeature = (index) => setFeatures(features.filter((_, i) => i !== index));
  const handleFeatureChange = (index, val) => {
    const newF = [...features];
    newF[index] = val;
    setFeatures(newF);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) { toast.error('Title is required'); return; }
    if (!description.trim()) { toast.error('Description is required'); return; }
    if (!price.trim()) { toast.error('Price is required'); return; }
    if (!durationVal.trim()) { toast.error('Duration is required'); return; }

    const finalFeatures = features.map(f => f.trim()).filter(f => f !== '');

    const durationNum = parseFloat(durationVal) || 0;

    const planData = {
      name: title.trim(),
      description: description.trim(),
      price: parseFloat(price) || 0,
      badge: badge.trim() || null,
      features: finalFeatures,
      isActive: existingPlan ? existingPlan.isActive : true,
    };

    if (durationUnit === 'Months') {
      planData.durationMonths = durationNum;
      planData.durationDays = 0;
      planData.durationHours = 0;
    } else if (durationUnit === 'Days') {
      planData.durationMonths = 0;
      planData.durationDays = durationNum;
      planData.durationHours = 0;
    } else if (durationUnit === 'Hours') {
      planData.durationMonths = 0;
      planData.durationDays = 0;
      planData.durationHours = durationNum;
    } else if (durationUnit === 'Minutes') {
      planData.durationMonths = 0;
      planData.durationDays = 0;
      planData.durationHours = durationNum / 60.0;
    }

    setIsLoading(true);
    try {
      if (isEditing) {
        await trainerService.updatePlan(user.id, existingPlan.id || existingPlan.trainingPlanId, planData);
        toast.success('Plan updated successfully');
      } else {
        await trainerService.addPlan(user.id, planData);
        toast.success('Plan created successfully');
      }
      navigate(-1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save plan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WebLayout title="" subtitle="">
      <div style={{
        display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 48px)',
        backgroundColor: '#f5f6f8', margin: '-24px',
      }}>
        {/* Simple White AppBar */}
        <div style={{
          padding: '20px 24px', backgroundColor: '#fff', borderBottom: '1px solid #eaeaea',
          display: 'flex', alignItems: 'center', gap: '16px'
        }}>
          <span
            className="material-icons"
            style={{ cursor: 'pointer', fontSize: '24px', color: '#333' }}
            onClick={() => navigate(-1)}
          >arrow_back</span>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
            {isEditing ? 'Edit Plan' : 'Add New Plan'}
          </h1>
        </div>

        <div style={{ padding: '24px', display: 'flex', justifyContent: 'center' }}>
          <form onSubmit={handleSave} style={{
            width: '100%', maxWidth: '700px', display: 'flex', flexDirection: 'column', gap: '20px',
            backgroundColor: '#fff', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#555', marginBottom: '8px' }}>Plan Title</label>
              <input className={styles.formInput} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., 1 Month Coaching" style={{ width: '100%', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#555', marginBottom: '8px' }}>Description</label>
              <textarea className={styles.formInput} value={description} onChange={e => setDescription(e.target.value)} placeholder="Enter plan description" rows={3} style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#555', marginBottom: '8px' }}>Price (EGP)</label>
                <input className={styles.formInput} type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g., 100" style={{ width: '100%', boxSizing: 'border-box' }} />
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#555', marginBottom: '8px' }}>Duration</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input className={styles.formInput} type="number" value={durationVal} onChange={e => setDurationVal(e.target.value)} placeholder="e.g., 1" style={{ flex: 2, boxSizing: 'border-box' }} />
                  <select
                    value={durationUnit} onChange={e => setDurationUnit(e.target.value)}
                    style={{
                      flex: 3, padding: '12px', borderRadius: '10px', border: '1px solid #dcdfe6',
                      backgroundColor: '#f9f9f9', fontSize: '14px', outline: 'none'
                    }}
                  >
                    <option value="Months">Months</option>
                    <option value="Days">Days</option>
                    <option value="Hours">Hours</option>
                    <option value="Minutes">Minutes</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#555', marginBottom: '8px' }}>Badge (Optional)</label>
              <input className={styles.formInput} value={badge} onChange={e => setBadge(e.target.value)} placeholder="e.g., Save 20%" style={{ width: '100%', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#555', margin: 0 }}>Features</label>
                <button type="button" onClick={handleAddFeature} style={{
                  background: 'none', border: 'none', color: '#17A073', fontSize: '14px', fontWeight: '600',
                  display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer'
                }}>
                  <span className="material-icons" style={{ fontSize: '18px' }}>add_circle_outline</span> Add Feature
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input className={styles.formInput} value={f} onChange={e => handleFeatureChange(i, e.target.value)} placeholder="Enter feature description" style={{ flex: 1 }} />
                    {features.length > 1 && (
                      <button type="button" onClick={() => handleRemoveFeature(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff8a8a', padding: 0, display: 'flex' }}>
                        <span className="material-icons" style={{ fontSize: '22px' }}>remove_circle</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={isLoading} style={{
              marginTop: '24px', width: '100%', padding: '16px', backgroundColor: '#17A073', color: '#fff',
              border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}>
              {isLoading ? 'Saving...' : (isEditing ? 'Update Plan' : 'Create Plan')}
            </button>

          </form>
        </div>
      </div>
    </WebLayout>
  );
};

export default TrainerAddPlanPage;
