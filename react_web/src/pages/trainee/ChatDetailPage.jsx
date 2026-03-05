import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import useChatStore from '../../stores/chatStore';
import CachedImage from '../../components/CachedImage';
import styles from './Trainee.module.css';
import TrainerPlaceholder from '../../assets/images/trainer.jpeg';

const ChatDetailPage = () => {
  const navigate = useNavigate();
  const { id: receiverId } = useParams();
  const location = useLocation();
  const contact = location.state?.contact || {};

  const { user } = useAuthStore();
  const { messages, fetchMessages, sendMessage, startPolling, stopPolling, markAsRead } = useChatStore();

  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Filter messages for this specific conversation
  const currentMessages = messages.filter(
    m => (m.senderId === user?.id && m.receiverId === receiverId) ||
      (m.senderId === receiverId && m.receiverId === user?.id)
  );

  useEffect(() => {
    if (user?.id && receiverId) {
      fetchMessages(user.id, receiverId);
      markAsRead(user.id, receiverId);
      startPolling(user.id, receiverId);
    }
    return () => stopPolling();
  }, [user?.id, receiverId, fetchMessages, markAsRead, startPolling, stopPolling]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const payload = {
      senderId: user.id,
      receiverId: receiverId,
      message: newMessage,
      type: 'text'
    };

    setNewMessage('');
    await sendMessage(payload);
  };

  return (
    <div className={styles.pageContainer} style={{ paddingBottom: 0 }}>
      {/* Chat header */}
      <div className={styles.appBar} style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '16px 20px', borderRadius: '0 0 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center' }}>
            <span className="material-icons">arrow_back_ios</span>
          </button>

          <CachedImage
            imageUrl={contact.trainerImageUrl || TrainerPlaceholder}
            width="40px"
            height="40px"
            borderRadius={20}
            style={{ marginLeft: '12px', marginRight: '12px', border: '2px solid white' }}
          />

          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{contact.trainerName || 'Trainer'}</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>Online</div>
          </div>

          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'white' }}>
            <span className="material-icons">more_vert</span>
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {contact.isEnded && (
          <div style={{ textAlign: 'center', backgroundColor: '#F0F0F0', padding: '8px', borderRadius: '8px', fontSize: '12px', color: 'var(--color-text-second)', marginBottom: '16px' }}>
            This subscription has ended. The chat is read-only.
          </div>
        )}

        {currentMessages.map((msg, idx) => {
          const isMine = msg.senderId === user?.id;
          return (
            <div key={idx} style={{
              display: 'flex',
              justifyContent: isMine ? 'flex-end' : 'flex-start'
            }}>
              <div style={{
                maxWidth: '75%',
                padding: '12px 16px',
                borderRadius: '16px',
                borderBottomRightRadius: isMine ? '4px' : '16px',
                borderBottomLeftRadius: isMine ? '16px' : '4px',
                backgroundColor: isMine ? 'var(--color-primary)' : '#F5F5F5',
                color: isMine ? 'white' : 'black',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '15px', lineHeight: '1.4', wordBreak: 'break-word' }}>
                  {msg.message}
                </div>
                <div style={{
                  fontSize: '10px',
                  marginTop: '4px',
                  textAlign: 'right',
                  color: isMine ? 'rgba(255,255,255,0.7)' : 'var(--color-text-second)'
                }}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      {!contact.isEnded && (
        <form onSubmit={handleSend} style={{ display: 'flex', alignItems: 'center', padding: '16px', backgroundColor: 'white', borderTop: '1px solid #F0F0F0' }}>
          <button type="button" style={{ background: 'transparent', border: 'none', color: 'var(--color-gray)', marginRight: '8px', cursor: 'pointer' }}>
            <span className="material-icons">attach_file</span>
          </button>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            style={{ flex: 1, padding: '12px 16px', borderRadius: '24px', border: '1px solid #E0E0E0', backgroundColor: '#F9F9F9', outline: 'none' }}
          />

          {newMessage.trim() ? (
            <button type="submit" style={{ width: '40px', height: '40px', borderRadius: '20px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', marginLeft: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <span className="material-icons" style={{ fontSize: '20px' }}>send</span>
            </button>
          ) : (
            <button type="button" style={{ width: '40px', height: '40px', borderRadius: '20px', backgroundColor: 'var(--color-black)', color: 'white', border: 'none', marginLeft: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <span className="material-icons" style={{ fontSize: '20px' }}>mic</span>
            </button>
          )}
        </form>
      )}
    </div>
  );
};

export default ChatDetailPage;
