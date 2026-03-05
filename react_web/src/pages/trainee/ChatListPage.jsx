import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import useChatStore from '../../stores/chatStore';
import WebLayout from '../../components/WebLayout';
import CachedImage from '../../components/CachedImage';
import styles from '../../components/WebLayout.module.css';

const ChatListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { contacts, isLoading, fetchContacts } = useChatStore();

  useEffect(() => {
    if (user?.id) fetchContacts(user.id, user.role || 'Trainee');
  }, [user?.id, user?.role, fetchContacts]);

  const formatTime = (time) => {
    if (!time) return '';
    const date = new Date(time);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString();
  };

  return (
    <WebLayout title="Messages" subtitle="Your conversations">
      {isLoading ? (
        <div className={styles.loadingSpinner}><div className={styles.spinner} /></div>
      ) : contacts.length === 0 ? (
        <div className={styles.emptyState}>
          <span className="material-icons">chat_bubble_outline</span>
          <p>No conversations yet</p>
        </div>
      ) : (
        <div className={styles.card}>
          {contacts.map((contact) => (
            <div
              key={contact.userId}
              onClick={() => navigate(`/trainee/chat/${contact.userId}`, { state: { contact } })}
              style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 12px',
                borderBottom: '1px solid #f5f5f5', cursor: 'pointer', transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ width: 48, height: 48, borderRadius: 14, overflow: 'hidden', background: '#f0f0f0', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {contact.profileImageUrl ? (
                  <CachedImage imageUrl={contact.profileImageUrl} width="100%" height="100%" fit="cover" />
                ) : (
                  <span className="material-icons" style={{ fontSize: 24, color: '#ccc' }}>person</span>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{contact.name}</span>
                  <span style={{ fontSize: 12, color: '#aaa' }}>{formatTime(contact.lastMessageTime)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <span style={{ fontSize: 13, color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 300 }}>
                    {contact.lastMessage || 'Start a conversation'}
                  </span>
                  {contact.unreadCount > 0 && (
                    <span style={{ background: '#17A073', color: 'white', borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 700, minWidth: 20, textAlign: 'center' }}>
                      {contact.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </WebLayout>
  );
};

export default ChatListPage;
