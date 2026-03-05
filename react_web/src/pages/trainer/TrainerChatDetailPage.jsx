import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import useChatStore from '../../stores/chatStore';
import CachedImage from '../../components/CachedImage';
import styles from './Trainer.module.css';
import TraineePlaceholder from '../../assets/images/trainee.jpeg';

const TrainerChatDetailPage = () => {
  const navigate = useNavigate();
  const { id: receiverId } = useParams();
  const location = useLocation();
  const contact = location.state?.contact || {};

  const { user } = useAuthStore();
  const { messages, fetchMessages, sendMessage, startPolling, stopPolling, markAsRead } = useChatStore();

  const [newMessage, setNewMessage] = useState('');
  const [showNotesParams, setShowNotesParams] = useState(false);
  const [notesText, setNotesText] = useState('');

  const messagesEndRef = useRef(null);

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

  const handleSendNote = async () => {
    if (!notesText.trim()) return;
    // Note logic mirrors normal chat message but styled or injected specially if backend supports 'note' type,
    // or just sending normal text indicating a note. We'll send it as normal message for now as per api docs.
    const payload = {
      senderId: user.id,
      receiverId: receiverId,
      message: `📝 [Trainer Note]: ${notesText}`,
      type: 'text'
    };

    setNotesText('');
    setShowNotesParams(false);
    await sendMessage(payload);
  };

  return (
    <div className={styles.pageContainer} style={{ paddingBottom: 0 }}>
      {/* Header */}
      <div className={styles.appBar} style={{ backgroundColor: 'white', borderBottom: '1px solid #E0E0E0', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'black', display: 'flex', alignItems: 'center' }}>
            <span className="material-icons">arrow_back_ios</span>
          </button>

          <CachedImage
            imageUrl={contact.senderImageUrl || TraineePlaceholder}
            width="40px"
            height="40px"
            borderRadius={20}
            style={{ marginLeft: '12px', marginRight: '12px' }}
          />

          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold', fontSize: '16px', color: 'black' }}>{contact.senderName || 'Client'}</div>
            <div style={{ fontSize: '12px', color: 'var(--color-primary)' }}>Online</div>
          </div>

          <button onClick={() => setShowNotesParams(!showNotesParams)} style={{ background: 'rgba(23, 160, 115, 0.1)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: 'var(--color-primary)', display: 'flex', alignItems: 'center' }}>
            <span className="material-icons" style={{ fontSize: '20px' }}>edit_note</span>
          </button>
        </div>
      </div>

      {/* Notes Drawer */}
      {showNotesParams && (
        <div style={{ padding: '16px', backgroundColor: '#F9F9F9', borderBottom: '1px solid #E0E0E0' }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Daily AI Note / Report</div>
          <textarea
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            placeholder="Write notes about client's performance..."
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #CCC', backgroundColor: 'white', minHeight: '80px', fontFamily: 'inherit' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button onClick={handleSendNote} style={{ backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              Send Note
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#F5F5F5' }}>
        {contact.isEnded && (
          <div style={{ textAlign: 'center', backgroundColor: '#E0E0E0', padding: '8px', borderRadius: '8px', fontSize: '12px', color: 'var(--color-text-second)', marginBottom: '16px' }}>
            Subscription has ended. Chat is closed.
          </div>
        )}

        {currentMessages.map((msg, idx) => {
          const isMine = msg.senderId === user?.id;
          const isNote = msg.message.startsWith('📝 [Trainer Note]:');

          return (
            <div key={idx} style={{
              display: 'flex',
              justifyContent: isMine ? 'flex-end' : 'flex-start'
            }}>
              <div style={{
                maxWidth: '75%',
                padding: '12px 16px',
                borderRadius: '16px',
                borderBottomRightRadius: isMine ? (isNote ? '16px' : '4px') : '16px',
                borderBottomLeftRadius: isMine ? '16px' : '4px',
                backgroundColor: isNote ? '#FFF9C4' : (isMine ? 'var(--color-primary)' : 'white'),
                color: isNote ? '#F57F17' : (isMine ? 'white' : 'black'),
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                border: isNote ? '1px solid #FFEB3B' : 'none'
              }}>
                <div style={{ fontSize: '15px', lineHeight: '1.4', wordBreak: 'break-word', fontWeight: isNote ? 'bold' : 'normal' }}>
                  {msg.message}
                </div>
                <div style={{
                  fontSize: '10px',
                  marginTop: '4px',
                  textAlign: 'right',
                  color: isMine ? (isNote ? '#F57F17' : 'rgba(255,255,255,0.7)') : 'var(--color-text-second)'
                }}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
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

          <button type="submit" style={{ width: '40px', height: '40px', borderRadius: '20px', backgroundColor: newMessage.trim() ? 'var(--color-primary)' : 'var(--color-black)', color: 'white', border: 'none', marginLeft: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <span className="material-icons" style={{ fontSize: '20px' }}>{newMessage.trim() ? 'send' : 'mic'}</span>
          </button>
        </form>
      )}
    </div>
  );
};

export default TrainerChatDetailPage;
