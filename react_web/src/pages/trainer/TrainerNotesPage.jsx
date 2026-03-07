import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { trainerService } from '../../services/trainerService';
import styles from './Trainer.module.css';

const TrainerNotesPage = () => {
    const navigate = useNavigate();
    const { traineeId } = useParams();
    const location = useLocation();
    const contact = location.state?.contact || {};
    const { user } = useAuthStore();

    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [subscriptionId, setSubscriptionId] = useState(null);

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            // 1. Get trainer subscriptions
            const subscriptions = await trainerService.getTrainerSubscriptions(user?.id);
            // 2. Find subscriptions for this trainee
            const traineeSubs = (subscriptions || [])
                .filter(s => s.traineeId === parseInt(traineeId))
                .sort((a, b) => b.id - a.id);

            if (traineeSubs.length === 0) {
                setLoading(false);
                return;
            }

            const subId = traineeSubs[0].id;
            setSubscriptionId(subId);

            // 3. Get subscription details which includes dailyNotes
            const subDetails = await trainerService.getSubscriptionDetails(subId);
            const dailyNotes = subDetails?.dailyNotes || subDetails?.notes || [];

            setNotes(dailyNotes.map(n => ({
                id: (n.id || n.noteId || '').toString(),
                title: n.title || n.noteTitle || 'Untitled',
                content: n.noteText || n.content || n.text || n.description || '',
                date: n.date || n.createdAt || new Date().toISOString(),
            })));
        } catch (err) {
            console.error('Failed to fetch notes:', err);
            // Try fallback endpoint
            try {
                const subscriptions = await trainerService.getTrainerSubscriptions(user?.id);
                const traineeSubs = (subscriptions || [])
                    .filter(s => s.traineeId === parseInt(traineeId))
                    .sort((a, b) => b.id - a.id);
                if (traineeSubs.length > 0) {
                    setSubscriptionId(traineeSubs[0].id);
                    const notesData = await trainerService.getDailyNotes(traineeSubs[0].id);
                    setNotes((notesData || []).map(n => ({
                        id: (n.id || n.noteId || '').toString(),
                        title: n.title || n.noteTitle || 'Untitled',
                        content: n.noteText || n.content || n.text || '',
                        date: n.date || n.createdAt || new Date().toISOString(),
                    })));
                }
            } catch { /* silent */ }
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        try {
            const d = new Date(dateStr);
            return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
        } catch { return ''; }
    };

    const contactName = contact.name || contact.senderName || 'Trainee';

    return (
        <div className={styles.pageContainer} style={{ backgroundColor: 'white', display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {/* AppBar */}
            <div style={{
                backgroundColor: 'white', padding: '16px 20px',
                borderBottom: '1px solid #F0F0F0',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => navigate(-1)} style={{
                        background: '#17A073', border: 'none', cursor: 'pointer',
                        width: '36px', height: '36px', borderRadius: '10px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <span className="material-icons" style={{ fontSize: '20px', color: 'white' }}>arrow_back_ios_new</span>
                    </button>
                    <h1 style={{ margin: 0, fontWeight: 'bold', fontSize: '24px', color: '#17A073' }}>Notes</h1>
                </div>
                <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    backgroundColor: '#17A073', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                }}>
                    <span className="material-icons" style={{ color: 'white', fontSize: '22px' }}>search</span>
                </div>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                        <div style={{ width: '40px', height: '40px', border: '4px solid #E0E0E0', borderTopColor: '#17A073', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    </div>
                ) : notes.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '20px' }}>
                        <span className="material-icons" style={{ fontSize: '120px', color: '#E0E0E0' }}>edit_note</span>
                        <p style={{ color: '#999', fontSize: '16px' }}>Create your first note !</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {notes.map((note) => (
                            <div
                                key={note.id}
                                onClick={() => navigate(`/trainer/chat/${traineeId}/notes/${note.id}`, {
                                    state: { contact, note, subscriptionId }
                                })}
                                style={{
                                    padding: '16px', borderRadius: '12px', border: '1px solid #E0E0E0',
                                    backgroundColor: 'white', cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }}
                            >
                                <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 'bold', color: '#1a1a2e' }}>{note.title}</h3>
                                <p style={{
                                    margin: '0 0 10px', fontSize: '14px', color: '#666',
                                    display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                }}>{note.content}</p>
                                <span style={{ fontSize: '12px', color: '#999' }}>{formatDate(note.date)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* FAB */}
            <button
                onClick={() => navigate(`/trainer/chat/${traineeId}/notes/new`, {
                    state: { contact, subscriptionId }
                })}
                style={{
                    position: 'fixed', bottom: '30px', right: '30px',
                    width: '56px', height: '56px', borderRadius: '50%',
                    backgroundColor: '#17A073', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 16px rgba(23,160,115,0.4)',
                    transition: 'transform 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                <span className="material-icons" style={{ color: 'white', fontSize: '30px' }}>add</span>
            </button>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default TrainerNotesPage;
