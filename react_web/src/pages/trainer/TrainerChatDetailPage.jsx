import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import useChatStore from '../../stores/chatStore';
import useTrainerStore from '../../stores/trainerStore';
import CachedImage from '../../components/CachedImage';
import { showToast } from '../../utils/custom';
import { trainerService } from '../../services/trainerService';
import styles from './Trainer.module.css';

const TrainerChatDetailPage = () => {
  const navigate = useNavigate();
  const { id: rawReceiverId } = useParams();
  const receiverId = parseInt(rawReceiverId, 10);
  const location = useLocation();
  const contact = location.state?.contact || {};

  const { user } = useAuthStore();
  const { currentTrainer, fetchCurrentTrainer } = useTrainerStore();
  const { messages, fetchMessages, sendMessage, startPolling, stopPolling, markChatAsRead } = useChatStore();

  const [newMessage, setNewMessage] = useState('');
  const [showAttach, setShowAttach] = useState(false);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [trainerWorkouts, setTrainerWorkouts] = useState([]);
  const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    if (user?.id && receiverId) {
      fetchMessages(user.id, receiverId);
      markChatAsRead(receiverId);
      startPolling(user.id, receiverId);
      if (!currentTrainer || currentTrainer.id !== user.id) {
        fetchCurrentTrainer(user.id);
      }
    }
    return () => stopPolling();
  }, [user?.id, receiverId, currentTrainer?.id, fetchCurrentTrainer]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ---- Send text message ---- */
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const payload = {
      senderId: user.id,
      senderRole: user.role || 'Trainer',
      receiverId,
      content: newMessage,
      messageType: 'Text',
    };
    setNewMessage('');
    await sendMessage(payload);
  };

  /* ---- Navigate to Notes screen (like mobile) ---- */
  const handleNotePick = () => {
    setShowAttach(false);
    navigate(`/trainer/chat/${receiverId}/notes`, { state: { contact } });
  };

  /* ---- File / Image picking ---- */
  const handleFilePick = (type) => {
    setShowAttach(false);
    if (type === 'media') {
      imageInputRef.current?.click();
    } else if (type === 'camera') {
      cameraInputRef.current?.click();
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleWorkoutPick = async () => {
    setShowAttach(false);
    setShowWorkoutModal(true);
    setIsLoadingWorkouts(true);
    try {
      const workouts = await trainerService.getWorkouts(user.id);
      setTrainerWorkouts(workouts || []);
    } catch {
      showToast('Failed to load workouts', 'error');
    } finally {
      setIsLoadingWorkouts(false);
    }
  };

  const handleSendWorkout = async (workoutTitle) => {
    setShowWorkoutModal(false);
    const payload = {
      senderId: user.id,
      senderRole: user.role || 'Trainer',
      receiverId,
      content: `🏋️ ${workoutTitle}`,
      messageType: 'Text',
    };
    await sendMessage(payload);
  };

  const handleFileChange = async (e, msgType) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result;
      const payload = {
        senderId: user.id,
        senderRole: user.role || 'Trainer',
        receiverId,
        content: msgType === 'Image' ? 'Photo' : file.name,
        fileUrl: dataUrl,
        messageType: msgType,
      };
      await sendMessage(payload);
    };
    reader.readAsDataURL(file);
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
      timerRef.current = setInterval(() => { setRecordDuration(d => d + 1); }, 1000);
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
      const reader = new FileReader();
      reader.onload = async () => {
        const payload = {
          senderId: user.id,
          senderRole: user.role || 'Trainer',
          receiverId,
          content: 'Voice Message',
          fileUrl: reader.result,
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
    } catch { return ''; }
  };

  const contactName = contact.name || contact.senderName || 'Client';
  const contactImage = contact.image || contact.profileImageUrl || contact.senderImageUrl;

  const parseWorkoutName = (w) => w.title || w.name || w.workoutName || 'Untitled';
  const parseTarget = (w) => {
    if (w.muscles && Array.isArray(w.muscles)) {
      const primary = w.muscles.find(m => m.isPrimary);
      return primary?.muscleName || '';
    }
    return w.targetMuscle || 'Other';
  };

  /* ---- Render a single message bubble ---- */
  const renderMessage = (msg, idx) => {
    const isMe = msg.senderId === user?.id;
    const msgText = msg.message || msg.content || '';
    const msgTime = msg.timestamp || msg.sentAt || msg.time || '';
    const msgType = (msg.messageType || msg.type || 'text').toLowerCase();
    const fileUrl = msg.fileUrl;
    const isNote = msgText.startsWith('📝 [Trainer Note]:');

    return (
      <div key={msg.id || idx} style={{
        display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start',
        alignItems: 'flex-end', gap: '8px',
      }}>
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

        <div style={{
          maxWidth: '70%',
          padding: msgType === 'image' ? '4px' : '12px 16px',
          borderRadius: '16px',
          borderBottomLeftRadius: isMe ? '16px' : '0',
          borderBottomRightRadius: isMe ? '0' : '16px',
          backgroundColor: isNote ? '#FFF9C4' : (isMe ? '#344955' : '#17A073'),
          color: isNote ? '#F57F17' : 'white',
          boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
          border: isNote ? '1px solid #FFEB3B' : 'none',
        }}>
          {msgType === 'image' && fileUrl && (
            <img src={fileUrl} alt="Sent" style={{ maxWidth: '100%', borderRadius: '12px', display: 'block', maxHeight: '200px', objectFit: 'cover' }} onClick={() => window.open(fileUrl, '_blank')} />
          )}
          {msgType === 'document' && (
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white', textDecoration: 'none' }}>
              <div style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '8px' }}>
                <span className="material-icons" style={{ fontSize: '24px' }}>insert_drive_file</span>
              </div>
              <span style={{ textDecoration: 'underline', fontSize: '14px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msgText}</span>
            </a>
          )}
          {msgType === 'audio' && fileUrl && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '180px' }}>
              <span className="material-icons" style={{ fontSize: '28px' }}>play_circle_filled</span>
              <audio controls src={fileUrl} style={{ height: '32px', flex: 1, filter: 'invert(1)' }} />
            </div>
          )}
          {(msgType === 'text' || (!['image', 'document', 'audio'].includes(msgType))) && (
            <div style={{ fontSize: '15px', lineHeight: '1.5', wordBreak: 'break-word', fontWeight: isNote ? 'bold' : 'normal' }}>
              {msgText.startsWith('🏋️ ') ? (
                <span style={{ textDecoration: 'underline', fontWeight: 'bold' }}>{msgText}</span>
              ) : (msgText)}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '4px' }}>
            <span style={{ fontSize: '10px', color: isNote ? '#F57F17' : 'rgba(255,255,255,0.7)' }}>{formatMsgTime(msgTime)}</span>
            {isMe && !isNote && (
              <span className="material-icons" style={{ fontSize: '14px', color: (msg.isRead || msg.status === 'read') ? '#90CAF9' : 'rgba(255,255,255,0.5)' }}>done_all</span>
            )}
          </div>
        </div>

        {isMe && (
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, backgroundColor: '#f0f0f0' }}>
            {(currentTrainer?.profileImageUrl || user?.profileImageUrl) ? (
              <CachedImage imageUrl={currentTrainer?.profileImageUrl || user?.profileImageUrl} width="100%" height="100%" fit="cover" />
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
            {contactImage ? (<CachedImage imageUrl={contactImage} width="100%" height="100%" fit="cover" />) : (
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
      <input ref={imageInputRef} type="file" accept="image/*,video/*" hidden onChange={(e) => handleFileChange(e, 'Image')} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => handleFileChange(e, 'Image')} />
      <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt" hidden onChange={(e) => handleFileChange(e, 'Document')} />

      {/* Attach Bottom Sheet */}
      {showAttach && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setShowAttach(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'white', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '20px', width: '100%', maxWidth: '500px', animation: 'slideUp 0.25s ease-out' }}>
            <div style={{ width: '40px', height: '4px', backgroundColor: '#DDD', borderRadius: '2px', margin: '0 auto 20px' }} />
            <h3 style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '18px', margin: '0 0 24px' }}>Share Content</h3>
            {/* Camera */}
            <div onClick={() => handleFilePick('camera')} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 0', cursor: 'pointer' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(23,160,115,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-icons" style={{ color: '#17A073', fontSize: '24px' }}>camera_alt</span>
              </div>
              <div><div style={{ fontWeight: 'bold', fontSize: '15px' }}>Camera</div></div>
            </div>

            {/* Documents */}
            <div onClick={() => handleFilePick('documents')} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 0', cursor: 'pointer' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(23,160,115,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-icons" style={{ color: '#17A073', fontSize: '24px' }}>description</span>
              </div>
              <div><div style={{ fontWeight: 'bold', fontSize: '15px' }}>Documents</div><div style={{ fontSize: '12px', color: '#999' }}>Share your files</div></div>
            </div>

            {/* Workouts */}
            <div onClick={handleWorkoutPick} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 0', cursor: 'pointer' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(23,160,115,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-icons" style={{ color: '#17A073', fontSize: '24px' }}>bar_chart</span>
              </div>
              <div><div style={{ fontWeight: 'bold', fontSize: '15px' }}>Workouts</div><div style={{ fontSize: '12px', color: '#999' }}>Open library of workouts</div></div>
            </div>

            {/* Media */}
            <div onClick={() => handleFilePick('media')} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 0', cursor: 'pointer' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(23,160,115,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-icons" style={{ color: '#17A073', fontSize: '24px' }}>image</span>
              </div>
              <div><div style={{ fontWeight: 'bold', fontSize: '15px' }}>Media</div><div style={{ fontSize: '12px', color: '#999' }}>Share photos and videos</div></div>
            </div>

            {/* Note */}
            <div onClick={handleNotePick} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 0', cursor: 'pointer' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(23,160,115,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-icons" style={{ color: '#17A073', fontSize: '24px' }}>note_alt</span>
              </div>
              <div><div style={{ fontWeight: 'bold', fontSize: '15px' }}>Note</div><div style={{ fontSize: '12px', color: '#999' }}>Write notes about trainee</div></div>
            </div>
            <div style={{ height: '20px' }} />
          </div>
        </div>
      )}

      {/* Input Area — check if subscription ended (like mobile) */}
      {(() => {
        const latestStatusMsg = messages.find(msg => {
          const c = (msg.message || msg.content || '').toLowerCase();
          return (c.includes('subscription') && (c.includes('ended') || c.includes('expired'))) ||
            c.includes('ai performance report') ||
            c.includes('welcome to the');
        });
        const isSubEnded = latestStatusMsg &&
          !(latestStatusMsg.message || latestStatusMsg.content || '').toLowerCase().includes('welcome to the');

        if (isSubEnded) {
          return (
            <div style={{ padding: '16px 20px 24px', backgroundColor: 'white' }}>
              <div style={{
                padding: '14px', backgroundColor: '#F5F5F5', borderRadius: '12px',
                textAlign: 'center', color: '#888', fontWeight: 'bold', fontSize: '14px',
              }}>
                Chat is closed. Subscription has ended.
              </div>
            </div>
          );
        }

        return (
          <div style={{ padding: '12px 16px 20px', backgroundColor: 'white' }}>
            <form onSubmit={handleSend} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '8px 16px', borderRadius: '30px',
              backgroundColor: 'white', boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            }}>
              {!isRecording ? (
                <>
                  <span className="material-icons" style={{ fontSize: '24px', color: '#CCC', cursor: 'pointer' }}>emoji_emotions</span>
                  <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Start typing..."
                    style={{ flex: 1, padding: '8px 0', border: 'none', outline: 'none', fontSize: '14px', backgroundColor: 'transparent', color: '#333' }} />
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
                  <span style={{ color: '#FF3B30', fontWeight: 'bold', fontSize: '14px', flex: 1 }}>Recording... {formatRecordDuration(recordDuration)}</span>
                  <span className="material-icons" onClick={sendRecording} style={{ fontSize: '28px', color: '#17A073', cursor: 'pointer' }}>send</span>
                </>
              )}
            </form>
          </div>
        );
      })()}

      {/* Workout Selection Modal */}
      {showWorkoutModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '500px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #E0E0E0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#333' }}>Select Workout</h3>
              <button onClick={() => setShowWorkoutModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <span className="material-icons" style={{ color: '#999' }}>close</span>
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
              {isLoadingWorkouts ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Loading workouts...</div>
              ) : trainerWorkouts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>No workouts found in your library.</div>
              ) : (
                trainerWorkouts.map((w, idx) => (
                  <div key={idx} onClick={() => handleSendWorkout(parseWorkoutName(w))} style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px',
                    cursor: 'pointer', borderBottom: '1px solid #f5f5f5'
                  }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#e0e0e0', flexShrink: 0 }}>
                      {w.imageUrl ? <CachedImage imageUrl={w.imageUrl} width="100%" height="100%" fit="cover" /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="material-icons" style={{ color: '#999' }}>fitness_center</span></div>}
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#333', fontSize: '15px' }}>{parseWorkoutName(w)}</div>
                      <div style={{ fontSize: '12px', color: '#777', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '250px' }}>{parseTarget(w)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default TrainerChatDetailPage;
