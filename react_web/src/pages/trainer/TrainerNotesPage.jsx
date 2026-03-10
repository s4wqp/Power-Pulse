import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { trainerService } from '../../services/trainerService';
import WebLayout from '../../components/WebLayout';
import styles from '../../components/WebLayout.module.css';

const ACCENT_COLORS = [
    { bg: 'rgba(23, 160, 115, 0.08)', border: '#17A073', icon: '#17A073' },
    { bg: 'rgba(66, 133, 244, 0.08)', border: '#4285f4', icon: '#4285f4' },
    { bg: 'rgba(255, 152, 0, 0.08)', border: '#FF9800', icon: '#FF9800' },
    { bg: 'rgba(156, 39, 176, 0.08)', border: '#9C27B0', icon: '#9C27B0' },
    { bg: 'rgba(233, 30, 99, 0.08)', border: '#E91E63', icon: '#E91E63' },
    { bg: 'rgba(0, 188, 212, 0.08)', border: '#00BCD4', icon: '#00BCD4' },
];

const TrainerNotesPage = () => {
    const navigate = useNavigate();
    const { traineeId } = useParams();
    const location = useLocation();
    const contact = location.state?.contact || {};
    const { user } = useAuthStore();

    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [subscriptionId, setSubscriptionId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const subscriptions = await trainerService.getTrainerSubscriptions(user?.id);
            const traineeSubs = (subscriptions || [])
                .filter(s => s.traineeId === parseInt(traineeId))
                .sort((a, b) => b.id - a.id);

            if (traineeSubs.length === 0) {
                setLoading(false);
                return;
            }

            const activeSub = traineeSubs.find(s => s.endDate && new Date(s.endDate) > new Date()) || traineeSubs[0];
            const subId = activeSub.id;
            setSubscriptionId(subId);

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
            try {
                const subscriptions = await trainerService.getTrainerSubscriptions(user?.id);
                const traineeSubs = (subscriptions || [])
                    .filter(s => s.traineeId === parseInt(traineeId))
                    .sort((a, b) => b.id - a.id);
                const activeSub = traineeSubs.find(s => s.endDate && new Date(s.endDate) > new Date()) || traineeSubs[0];
                if (activeSub) {
                    setSubscriptionId(activeSub.id);
                    const notesData = await trainerService.getDailyNotes(activeSub.id);
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
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
        } catch { return ''; }
    };

    const formatTime = (dateStr) => {
        try {
            const d = new Date(dateStr);
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch { return ''; }
    };

    const contactName = contact.name || contact.senderName || 'Trainee';

    const filteredNotes = notes.filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <WebLayout title="" subtitle="">
            <div style={{ minHeight: 'calc(100vh - 48px)' }}>
                {/* Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    marginBottom: '32px', flexWrap: 'wrap', gap: '16px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button onClick={() => navigate(-1)} style={{
                            background: '#fff', border: '1.5px solid #e0e4e8', cursor: 'pointer',
                            width: '42px', height: '42px', borderRadius: '12px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s ease', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'none'; }}
                        >
                            <span className="material-icons" style={{ fontSize: '20px', color: '#333' }}>arrow_back</span>
                        </button>
                        <div>
                            <h1 style={{
                                margin: 0, fontSize: '28px', fontWeight: 800,
                                background: 'linear-gradient(135deg, #1a1a2e 0%, #344955 100%)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                letterSpacing: '-0.3px',
                            }}>Notes</h1>
                            <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#8a92a6', fontWeight: 500 }}>
                                Session notes for {contactName}
                            </p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className={styles.searchBar} style={{ minWidth: '280px' }}>
                        <span className="material-icons">search</span>
                        <input
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search notes..."
                        />
                    </div>
                </div>

                {/* Stats Row */}
                <div style={{
                    display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap',
                }}>
                    <div style={{
                        background: '#fff', borderRadius: '16px', padding: '18px 24px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.03)',
                        display: 'flex', alignItems: 'center', gap: '14px', flex: '1', minWidth: '160px',
                    }}>
                        <div style={{
                            width: '44px', height: '44px', borderRadius: '12px',
                            background: 'rgba(23, 160, 115, 0.1)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                        }}>
                            <span className="material-icons" style={{ color: '#17A073', fontSize: '22px' }}>description</span>
                        </div>
                        <div>
                            <div style={{ fontSize: '24px', fontWeight: 800, color: '#1a1a2e' }}>{notes.length}</div>
                            <div style={{ fontSize: '12px', color: '#8a92a6', fontWeight: 500 }}>Total Notes</div>
                        </div>
                    </div>
                    <div style={{
                        background: '#fff', borderRadius: '16px', padding: '18px 24px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.03)',
                        display: 'flex', alignItems: 'center', gap: '14px', flex: '1', minWidth: '160px',
                    }}>
                        <div style={{
                            width: '44px', height: '44px', borderRadius: '12px',
                            background: 'rgba(66, 133, 244, 0.1)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                        }}>
                            <span className="material-icons" style={{ color: '#4285f4', fontSize: '22px' }}>today</span>
                        </div>
                        <div>
                            <div style={{ fontSize: '24px', fontWeight: 800, color: '#1a1a2e' }}>
                                {notes.filter(n => {
                                    const d = new Date(n.date);
                                    const today = new Date();
                                    return d.toDateString() === today.toDateString();
                                }).length}
                            </div>
                            <div style={{ fontSize: '12px', color: '#8a92a6', fontWeight: 500 }}>Today</div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className={styles.loadingSpinner}>
                        <div className={styles.spinner} />
                    </div>
                ) : filteredNotes.length === 0 ? (
                    <div className={styles.emptyState}>
                        <span className="material-icons" style={{ fontSize: '72px' }}>edit_note</span>
                        <p>{searchQuery ? 'No notes match your search' : 'Create your first note!'}</p>
                        {!searchQuery && (
                            <button
                                onClick={() => navigate(`/trainer/chat/${traineeId}/notes/new`, { state: { contact, subscriptionId } })}
                                className={styles.btnPrimary}
                                style={{ marginTop: '20px' }}
                            >
                                <span className="material-icons" style={{ fontSize: '18px' }}>add</span>
                                New Note
                            </button>
                        )}
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: '20px',
                    }}>
                        {filteredNotes.map((note, idx) => {
                            const accent = ACCENT_COLORS[idx % ACCENT_COLORS.length];
                            return (
                                <div
                                    key={note.id}
                                    onClick={() => navigate(`/trainer/chat/${traineeId}/notes/${note.id}`, {
                                        state: { contact, note, subscriptionId }
                                    })}
                                    style={{
                                        background: '#ffffff',
                                        borderRadius: '18px',
                                        padding: 0,
                                        overflow: 'hidden',
                                        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                                        border: '1px solid rgba(0,0,0,0.04)',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        position: 'relative',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,0,0,0.1)';
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    {/* Accent Top Strip */}
                                    <div style={{
                                        height: '4px',
                                        background: `linear-gradient(90deg, ${accent.border}, ${accent.border}88)`,
                                    }} />

                                    <div style={{ padding: '22px 24px' }}>
                                        {/* Header Row */}
                                        <div style={{
                                            display: 'flex', alignItems: 'flex-start',
                                            justifyContent: 'space-between', marginBottom: '14px',
                                        }}>
                                            <div style={{
                                                width: '40px', height: '40px', borderRadius: '12px',
                                                background: accent.bg,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                flexShrink: 0,
                                            }}>
                                                <span className="material-icons" style={{ fontSize: '20px', color: accent.icon }}>
                                                    sticky_note_2
                                                </span>
                                            </div>
                                            <span className="material-icons" style={{
                                                fontSize: '18px', color: '#ccc',
                                                transition: 'color 0.2s',
                                            }}>
                                                chevron_right
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h3 style={{
                                            margin: '0 0 8px', fontSize: '17px', fontWeight: 700,
                                            color: '#1a1a2e', lineHeight: 1.3,
                                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                        }}>
                                            {note.title}
                                        </h3>

                                        {/* Content Preview */}
                                        <p style={{
                                            margin: '0 0 16px', fontSize: '13px', color: '#8a92a6',
                                            lineHeight: 1.6, fontWeight: 400,
                                            display: '-webkit-box', WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                        }}>
                                            {note.content || 'No content'}
                                        </p>

                                        {/* Footer */}
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                            paddingTop: '12px', borderTop: '1px solid #f5f6f8',
                                        }}>
                                            <span className="material-icons" style={{ fontSize: '14px', color: '#b0b8c9' }}>schedule</span>
                                            <span style={{ fontSize: '12px', color: '#b0b8c9', fontWeight: 500 }}>
                                                {formatDate(note.date)} · {formatTime(note.date)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* FAB */}
                <button
                    onClick={() => navigate(`/trainer/chat/${traineeId}/notes/new`, {
                        state: { contact, subscriptionId }
                    })}
                    style={{
                        position: 'fixed', bottom: '32px', right: '32px',
                        padding: '14px 28px', borderRadius: '16px',
                        background: 'linear-gradient(135deg, #17A073 0%, #14c486 100%)',
                        border: 'none', cursor: 'pointer', color: '#fff',
                        fontSize: '14px', fontWeight: 700, letterSpacing: '0.2px',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        boxShadow: '0 8px 25px rgba(23, 160, 115, 0.35)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        zIndex: 100,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 12px 35px rgba(23, 160, 115, 0.45)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(23, 160, 115, 0.35)'; }}
                >
                    <span className="material-icons" style={{ fontSize: '20px' }}>add</span>
                    New Note
                </button>
            </div>
        </WebLayout>
    );
};

export default TrainerNotesPage;
