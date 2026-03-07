import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import useChatStore from '../../stores/chatStore';
import CachedImage from '../../components/CachedImage';
import styles from './Trainee.module.css';

const ChatListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { contacts, isLoading, fetchContacts, markChatAsRead } = useChatStore();

  useEffect(() => {
    if (user?.id) fetchContacts(user.id, user.role || 'Trainee');
  }, [user?.id, user?.role, fetchContacts]);

  const formatTime = (time) => {
    if (!time) return '';
    try {
      const date = new Date(time);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const msgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

      if (msgDay.getTime() === today.getTime()) {
        let h = date.getHours();
        const m = date.getMinutes().toString().padStart(2, '0');
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return `${h}:${m} ${ampm}`;
      }
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (msgDay.getTime() === yesterday.getTime()) return 'Yesterday';
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    } catch {
      return '';
    }
  };

  // De-duplicate contacts by userId
  const uniqueMap = {};
  (contacts || []).forEach(c => { uniqueMap[c.userId] = c; });
  const uniqueContacts = Object.values(uniqueMap);

  return (
    <div className={styles.pageContainer} style={{ backgroundColor: 'white' }}>
      {/* Green Header Banner matching mobile */}
      <div style={{
        background: 'linear-gradient(135deg, #1B3A2D 0%, #17A073 100%)',
        padding: '40px 20px 30px',
        textAlign: 'center',
      }}>
        <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Chats</h1>
      </div>

      {/* Contact List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid #E0E0E0', borderTopColor: '#17A073', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : uniqueContacts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
            <span className="material-icons" style={{ fontSize: '48px', color: '#DDD', display: 'block', marginBottom: '12px' }}>chat_bubble_outline</span>
            <p style={{ fontSize: '14px' }}>No active chats found.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {uniqueContacts.map((contact) => (
              <div
                key={contact.userId}
                onClick={() => {
                  markChatAsRead(contact.userId);
                  navigate(`/trainee/chat/${contact.userId}`, {
                    state: {
                      contact: {
                        id: contact.userId,
                        name: contact.name,
                        image: contact.profileImageUrl,
                        role: contact.role,
                      }
                    }
                  });
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '14px',
                  backgroundColor: 'white',
                  borderRadius: '24px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; }}
              >
                {/* Avatar */}
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', overflow: 'hidden', background: '#f0f0f0', flexShrink: 0 }}>
                  {contact.profileImageUrl ? (
                    <CachedImage imageUrl={contact.profileImageUrl} width="100%" height="100%" fit="cover" />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8F5E9' }}>
                      <span className="material-icons" style={{ fontSize: '28px', color: '#17A073' }}>person</span>
                    </div>
                  )}
                </div>

                {/* Name + Last Message */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#17A073' }}>
                    {contact.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(23, 160, 115, 0.7)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {contact.lastMessage || 'No messages yet'}
                  </div>
                </div>

                {/* Time + Unread Badge */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#17A073' }}>
                    {formatTime(contact.lastMessageTime)}
                  </span>
                  {contact.unreadCount > 0 && (
                    <span style={{
                      backgroundColor: '#FF3B30', color: 'white', borderRadius: '50%',
                      width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '10px', fontWeight: 'bold'
                    }}>
                      {contact.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ChatListPage;
