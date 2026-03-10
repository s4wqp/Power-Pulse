import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WebLayout from '../../components/WebLayout';
import { showToast } from '../../utils/custom';
import styles from '../../components/WebLayout.module.css';

const PaymentDetailsPage = () => {
  const navigate = useNavigate();

  const [cards, setCards] = useState([
    { id: 1, last4: '3212', expiry: '12/56', brand: 'Mastercard' },
    { id: 2, last4: '7777', expiry: '08/27', brand: 'Mastercard' },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newCard, setNewCard] = useState({ number: '', expiry: '', cvv: '' });

  const handleCardNumberChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 16) setNewCard({ ...newCard, number: val });
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.slice(0, 4);
    if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2);
    setNewCard({ ...newCard, expiry: val });
  };

  const handleAddCard = () => {
    if (newCard.number.length !== 16) {
      showToast('Card number must be exactly 16 digits.', true);
      return;
    }
    if (newCard.cvv.length !== 3) {
      showToast('CVV must be exactly 3 digits.', true);
      return;
    }
    if (newCard.expiry.length !== 5 || !/^\d{2}\/\d{2}$/.test(newCard.expiry)) {
      showToast('Expiry date must be in MM/YY format (2 digits / 2 digits).', true);
      return;
    }

    const card = {
      id: Date.now(),
      last4: newCard.number.slice(-4),
      expiry: newCard.expiry,
      brand: 'Mastercard',
    };
    setCards([...cards, card]);
    setNewCard({ number: '', expiry: '', cvv: '' });
    setShowAddForm(false);
  };

  const handleDeleteCard = (id) => {
    setCards(cards.filter(c => c.id !== id));
  };

  return (
    <WebLayout title="Payment Details" subtitle="Manage your payment cards">
      <div style={{ maxWidth: '700px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a2e', marginBottom: '24px' }}>Your Cards</h3>

        {/* Card List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
          {cards.length === 0 && (
            <div className={styles.emptyState} style={{ padding: '40px' }}>
              <span className="material-icons">credit_card_off</span>
              <p>No cards saved yet</p>
            </div>
          )}

          {cards.map((card) => (
            <div
              key={card.id}
              style={{
                background: 'linear-gradient(135deg, #E53935 0%, #C62828 100%)',
                borderRadius: '20px',
                padding: '28px',
                color: 'white',
                position: 'relative',
                boxShadow: '0 8px 30px rgba(229, 57, 53, 0.3)',
                minHeight: '170px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'default',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(229,57,53,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(229,57,53,0.3)'; }}
            >
              {/* Top row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="material-icons" style={{ fontSize: '40px', opacity: 0.85 }}>credit_card</span>
                <span style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '1px' }}>{card.brand}</span>
              </div>

              {/* Card Number */}
              <div style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '3px', margin: '24px 0' }}>
                **** &nbsp; **** &nbsp; **** &nbsp; {card.last4}
              </div>

              {/* Bottom row */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '1px' }}>Expires</div>
                  <div style={{ fontSize: '15px', fontWeight: '700', marginTop: '3px' }}>{card.expiry}</div>
                </div>
              </div>

              {/* Delete button */}
              <button
                onClick={() => handleDeleteCard(card.id)}
                style={{
                  position: 'absolute', top: '14px', right: '14px',
                  background: 'rgba(255,255,255,0.15)', border: 'none',
                  borderRadius: '50%', width: '32px', height: '32px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'white', transition: 'background 0.2s',
                  backdropFilter: 'blur(4px)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              >
                <span className="material-icons" style={{ fontSize: '18px' }}>close</span>
              </button>
            </div>
          ))}
        </div>

        {/* Add Card Form */}
        {showAddForm && (
          <div className={styles.card} style={{ animation: 'fadeInUp 0.3s ease-out' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '700', color: '#1a1a2e' }}>Add New Card</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#8a92a6', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Card Number</label>
                <input className={styles.formInput} type="text" placeholder="0000 0000 0000 0000" value={newCard.number} onChange={handleCardNumberChange} style={{ width: '100%', boxSizing: 'border-box', letterSpacing: '2px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#8a92a6', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Expiry Date</label>
                  <input className={styles.formInput} type="text" placeholder="MM/YY" value={newCard.expiry} onChange={handleExpiryChange} style={{ width: '100%', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#8a92a6', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>CVV</label>
                  <input className={styles.formInput} type="text" placeholder="123" maxLength={3} value={newCard.cvv} onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })} style={{ width: '100%', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button className={styles.btnSecondary} onClick={() => setShowAddForm(false)} style={{ flex: 1, textAlign: 'center', justifyContent: 'center' }}>Cancel</button>
                <button className={styles.btnPrimary} onClick={handleAddCard} style={{ flex: 1, justifyContent: 'center' }}>Save Card</button>
              </div>
            </div>
          </div>
        )}

        {/* Add Button */}
        {!showAddForm && (
          <button className={styles.btnPrimary} onClick={() => setShowAddForm(true)} style={{ width: '100%', justifyContent: 'center', padding: '16px' }}>
            <span className="material-icons" style={{ fontSize: '20px' }}>add</span>
            Add New Card
          </button>
        )}
      </div>
    </WebLayout>
  );
};

export default PaymentDetailsPage;
