import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import useChatStore from '../../stores/chatStore';
import CachedImage from '../../components/CachedImage';
import { showToast } from '../../utils/custom';
import styles from './Trainee.module.css';

const ChatDetailPage = () => {
  const navigate = useNavigate();
  const { id: rawReceiverId } = useParams();
  const receiverId = parseInt(rawReceiverId, 10);
  const location = useLocation();
  const contact = location.state?.contact || {};

  const { user } = useAuthStore();
  const { messages, fetchMessages, sendMessage, startPolling, stopPolling, markChatAsRead } = useChatStore();

  const [newMessage, setNewMessage] = useState('');
  const [showAttach, setShowAttach] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    if (user?.id && receiverId) {
      fetchMessages(user.id, receiverId);
      markChatAsRead(receiverId);
      startPolling(user.id, receiverId);
    }
    return () => stopPolling();
  }, [user?.id, receiverId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ---- Send text message ---- */
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const payload = {
      senderId: user.id,
      senderRole: user.role || 'Trainee',
      receiverId,
      content: newMessage,
      messageType: 'Text',
    };
    setNewMessage('');
    await sendMessage(payload);
  };

  /* ---- File / Image picking ---- */
  const handleFilePick = (type) => {
    setShowAttach(false);
    if (type === 'media') {
      imageInputRef.current?.click();
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e, msgType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to data URL for fileUrl (the backend stores it)
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result;
      const payload = {
        senderId: user.id,
        senderRole: user.role || 'Trainee',
        receiverId,
        content: msgType === 'Image' ? 'Photo' : file.name,
        fileUrl: dataUrl,
        messageType: msgType,
      };
      await sendMessage(payload);
    };
    reader.readAsDataURL(file);
    // Reset input so the same file can be picked again
    e.target.value = '';
  };

  /* ---- Voice Recording ---- */
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordDuration(0);

      timerRef.current = setInterval(() => {
        setRecordDuration(d => d + 1);
      }, 1000);
    } catch (err) {
      console.error('Mic permission denied:', err);
      showToast('Microphone permission denied', 'error');
    }
  }, []);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
    clearInterval(timerRef.current);
    setIsRecording(false);
    setRecordDuration(0);
    recordedChunksRef.current = [];
  }, []);

  const sendRecording = useCallback(async () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return;

    clearInterval(timerRef.current);

    mediaRecorderRef.current.onstop = async () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());

      // Convert to data URL
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result;
        const payload = {
          senderId: user.id,
          senderRole: user.role || 'Trainee',
          receiverId,
          content: 'Voice Message',
          fileUrl: dataUrl,
          messageType: 'Audio',
        };
        await sendMessage(payload);
      };
      reader.readAsDataURL(blob);

      setIsRecording(false);
      setRecordDuration(0);
      recordedChunksRef.current = [];
    };

    mediaRecorderRef.current.stop();
  }, [receiverId, sendMessage, user]);

  const formatRecordDuration = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const formatMsgTime = (ts) => {
    try {
      const dt = new Date(ts);
      let h = dt.getHours();
      const m = dt.getMinutes().toString().padStart(2, '0');
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      return `${h}:${m} ${ampm}`;
    } catch {
      return '';
    }
  };

  const contactName = contact.name || contact.trainerName || 'Chat';
  const contactImage = contact.image || contact.profileImageUrl || contact.trainerImageUrl;

  /* ---- Render a single message bubble ---- */
  const renderMessage = (msg, idx) => {
    const isMe = msg.senderId === user?.id;
    const msgText = msg.message || msg.content || '';
    const msgTime = msg.timestamp || msg.sentAt || msg.time || '';
    const msgType = (msg.messageType || msg.type || 'text').toLowerCase();
    const fileUrl = msg.fileUrl;

    return (
      <div key={msg.id || idx} style={{
        display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start',
        alignItems: 'flex-end', gap: '8px',
      }}>
        {/* Other person's avatar */}
        {!isMe && (
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, backgroundColor: '#f0f0f0' }}>
            {contactImage ? (
              <CachedImage imageUrl={contactImage} width="100%" height="100%" fit="cover" />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8F5E9' }}>
                <span className="material-icons" style={{ fontSize: '18px', color: '#17A073' }}>person</span>
              </div>
            )}
          </div>
        )}

        {/* Bubble */}
        <div style={{
          maxWidth: '70%',
          padding: msgType === 'image' ? '4px' : '12px 16px',
          borderRadius: '16px',
          borderBottomLeftRadius: isMe ? '16px' : '0',
          borderBottomRightRadius: isMe ? '0' : '16px',
          backgroundColor: isMe ? '#344955' : '#17A073',
          color: 'white',
          boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
        }}>
          {/* Image message */}
          {msgType === 'image' && fileUrl && (
            <img
              src={fileUrl}
              alt="Sent"
              style={{ maxWidth: '100%', borderRadius: '12px', display: 'block', maxHeight: '200px', objectFit: 'cover' }}
              onClick={() => window.open(fileUrl, '_blank')}
            />
          )}

          {/* Document message */}
          {msgType === 'document' && (
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{
              display: 'flex', alignItems: 'center', gap: '10px', color: 'white', textDecoration: 'none'
            }}>
              <div style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '8px' }}>
                <span className="material-icons" style={{ fontSize: '24px' }}>insert_drive_file</span>
              </div>
              <span style={{ textDecoration: 'underline', fontSize: '14px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msgText}</span>
            </a>
          )}

          {/* Audio message */}
          {msgType === 'audio' && fileUrl && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '180px' }}>
              <span className="material-icons" style={{ fontSize: '28px' }}>play_circle_filled</span>
              <audio controls src={fileUrl} style={{ height: '32px', flex: 1, filter: 'invert(1)' }} />
            </div>
          )}

          {/* Text message (or fallback) */}
          {(msgType === 'text' || (!['image', 'document', 'audio'].includes(msgType))) && (
            <div style={{ fontSize: '15px', lineHeight: '1.5', wordBreak: 'break-word' }}>
              {msgText.startsWith('🏋️ ') ? (
                <span style={{ textDecoration: 'underline', fontWeight: 'bold' }}>{msgText}</span>
              ) : (msgText)}
            </div>
          )}

          {/* Time + read ticks */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '4px' }}>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>{formatMsgTime(msgTime)}</span>
            {isMe && (
              <span className="material-icons" style={{
                fontSize: '14px',
                color: (msg.isRead || msg.status === 'read') ? '#90CAF9' : 'rgba(255,255,255,0.5)'
              }}>done_all</span>
            )}
          </div>
        </div>

        {/* My avatar */}
        {isMe && (
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, backgroundColor: '#f0f0f0' }}>
            {user?.profileImageUrl ? (
              <CachedImage imageUrl={user.profileImageUrl} width="100%" height="100%" fit="cover" />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E3F2FD' }}>
                <span className="material-icons" style={{ fontSize: '18px', color: '#344955' }}>person</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.pageContainer} style={{ paddingBottom: 0, backgroundColor: 'white' }}>
      {/* AppBar */}
      <div style={{
        backgroundColor: 'white', padding: '12px 16px',
        borderBottom: '1px solid #F0F0F0',
        display: 'flex', alignItems: 'center', gap: '12px'
      }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <span className="material-icons" style={{ fontSize: '22px' }}>arrow_back_ios</span>
        </button>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#f0f0f0' }}>
            {contactImage ? (
              <CachedImage imageUrl={contactImage} width="100%" height="100%" fit="cover" />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8F5E9' }}>
                <span className="material-icons" style={{ color: '#17A073' }}>person</span>
              </div>
            )}
          </div>
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#17A073', border: '2px solid white' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#17A073' }}>{contactName}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>Online</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column-reverse', gap: '16px' }}>
        <div ref={messagesEndRef} />
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#CCC', padding: '40px' }}>No messages yet</div>
        ) : messages.map((msg, idx) => renderMessage(msg, idx))}
      </div>

      {/* Hidden file inputs */}
      <input ref={imageInputRef} type="file" accept="image/*" hidden onChange={(e) => handleFileChange(e, 'Image')} />
      <input ref={fileInputRef} type="file" hidden onChange={(e) => handleFileChange(e, 'Document')} />

      {/* Attach Bottom Sheet */}
      {showAttach && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 9999,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
        }} onClick={() => setShowAttach(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{
            backgroundColor: 'white', borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
            padding: '20px', width: '100%', maxWidth: '500px',
            animation: 'slideUp 0.25s ease-out'
          }}>
            {/* Handle */}
            <div style={{ width: '40px', height: '4px', backgroundColor: '#DDD', borderRadius: '2px', margin: '0 auto 20px' }} />
            <h3 style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '18px', margin: '0 0 24px' }}>Share Content</h3>

            {/* Documents */}
            <div onClick={() => handleFilePick('documents')} style={{
              display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 0', cursor: 'pointer'
            }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(23,160,115,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-icons" style={{ color: '#17A073', fontSize: '24px' }}>description</span>
              </div>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '15px' }}>Documents</div>
                <div style={{ fontSize: '12px', color: '#999' }}>Share your files</div>
              </div>
            </div>

            {/* Media */}
            <div onClick={() => handleFilePick('media')} style={{
              display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 0', cursor: 'pointer'
            }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(23,160,115,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-icons" style={{ color: '#17A073', fontSize: '24px' }}>image</span>
              </div>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '15px' }}>Media</div>
                <div style={{ fontSize: '12px', color: '#999' }}>Share photos and videos</div>
              </div>
            </div>

            <div style={{ height: '20px' }} />
          </div>
        </div>
      )}

      {/* Input Area */}
      <div style={{ padding: '12px 16px 20px', backgroundColor: 'white' }}>
        <form onSubmit={handleSend} style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '8px 16px',
          borderRadius: '30px',
          backgroundColor: 'white',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        }}>
          {!isRecording ? (
            <>
              <span className="material-icons" style={{ fontSize: '24px', color: '#CCC', cursor: 'pointer' }}>emoji_emotions</span>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Start typing..."
                style={{ flex: 1, padding: '8px 0', border: 'none', outline: 'none', fontSize: '14px', backgroundColor: 'transparent', color: '#333' }}
              />
              <span className="material-icons" onClick={startRecording} style={{ fontSize: '24px', color: '#CCC', cursor: 'pointer' }}>mic_none</span>
              <span className="material-icons" onClick={() => setShowAttach(true)} style={{ fontSize: '24px', color: '#CCC', cursor: 'pointer' }}>attach_file</span>
              <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                <span className="material-icons" style={{ fontSize: '26px', color: '#17A073' }}>send</span>
              </button>
            </>
          ) : (
            <>
              <span className="material-icons" onClick={cancelRecording} style={{ fontSize: '26px', color: '#FF3B30', cursor: 'pointer' }}>delete_outline</span>
              <span className="material-icons" style={{ fontSize: '12px', color: '#FF3B30' }}>circle</span>
              <span style={{ color: '#FF3B30', fontWeight: 'bold', fontSize: '14px', flex: 1 }}>
                Recording... {formatRecordDuration(recordDuration)}
              </span>
              <span className="material-icons" onClick={sendRecording} style={{ fontSize: '28px', color: '#17A073', cursor: 'pointer' }}>send</span>
            </>
          )}
        </form>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ChatDetailPage;
