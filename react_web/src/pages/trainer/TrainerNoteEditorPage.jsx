import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { trainerService } from '../../services/trainerService';
import WebLayout from '../../components/WebLayout';
import styles from '../../components/WebLayout.module.css';
import toast from 'react-hot-toast';

const TrainerNoteEditorPage = () => {
    const navigate = useNavigate();
    const { traineeId, noteId } = useParams();
    const location = useLocation();
    const contact = location.state?.contact || {};
    const existingNote = location.state?.note || null;
    const passedSubscriptionId = location.state?.subscriptionId || null;
    const { user } = useAuthStore();

    const isNew = noteId === 'new' || !noteId;

    const [title, setTitle] = useState(existingNote?.title || '');
    const [content, setContent] = useState(existingNote?.content || '');
    const [isDirty, setIsDirty] = useState(false);
    const [saving, setSaving] = useState(false);
    const [subscriptionId, setSubscriptionId] = useState(passedSubscriptionId);

    useEffect(() => {
        if (!subscriptionId) {
            resolveSubscriptionId();
        }
    }, []);

    const resolveSubscriptionId = async () => {
        try {
            const subs = await trainerService.getTrainerSubscriptions(user?.id);
            const traineeSubs = (subs || [])
                .filter(s => s.traineeId === parseInt(traineeId))
                .sort((a, b) => b.id - a.id);

            // Try to find an active subscription first
            const activeSub = traineeSubs.find(s => s.endDate && new Date(s.endDate) > new Date());

            if (activeSub) {
                setSubscriptionId(activeSub.id);
            } else if (traineeSubs.length > 0) {
                // Fallback to the latest one, but setting it might result in 403 on save
                setSubscriptionId(traineeSubs[0].id);
            }
        } catch (err) {
            console.error('Failed to resolve subscription:', err);
        }
    };

    const handleTitleChange = (val) => {
        setTitle(val);
        if (!isDirty) setIsDirty(true);
    };

    const handleContentChange = (val) => {
        setContent(val);
        if (!isDirty) setIsDirty(true);
    };

    const handleSave = async () => {
        if (!title.trim() && !content.trim()) return;
        if (!subscriptionId) {
            toast.error('No active subscription found for this trainee.');
            return;
        }

        setSaving(true);
        try {
            await trainerService.addDailyNote(subscriptionId, title.trim(), content.trim());
            setIsDirty(false);
            toast.success('Note saved successfully');
            navigate(-1);
        } catch (err) {
            console.error('Failed to save note:', err);
            toast.error('Failed to save note: ' + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    const handleBack = () => {
        if (isDirty) {
            if (window.confirm('Save changes?\n\nYour changes will be lost if you don\'t save them.')) {
                handleSave();
            } else {
                navigate(-1);
            }
        } else {
            navigate(-1);
        }
    };

    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
    const charCount = content.length;
    const contactName = contact.name || contact.senderName || 'Trainee';

    return (
        <WebLayout title="" subtitle="">
            <div style={{ minHeight: 'calc(100vh - 48px)' }}>
                {/* Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: '28px', flexWrap: 'wrap', gap: '16px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button onClick={handleBack} style={{
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
                            }}>
                                {isNew ? 'New Note' : 'Edit Note'}
                            </h1>
                            <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#8a92a6', fontWeight: 500 }}>
                                {contactName}
                            </p>
                        </div>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={saving || (!title.trim() && !content.trim())}
                        className={styles.btnPrimary}
                        style={{
                            opacity: saving || (!title.trim() && !content.trim()) ? 0.5 : 1,
                            cursor: saving ? 'not-allowed' : 'pointer',
                            position: 'relative',
                        }}
                    >
                        {isDirty && (
                            <span style={{
                                position: 'absolute', top: '-3px', right: '-3px',
                                width: '10px', height: '10px', borderRadius: '50%',
                                background: '#FF9800', border: '2px solid #fff',
                            }} />
                        )}
                        <span className="material-icons" style={{ fontSize: '18px' }}>
                            {saving ? 'hourglass_empty' : 'save'}
                        </span>
                        {saving ? 'Saving...' : 'Save Note'}
                    </button>
                </div>

                {/* Editor Card */}
                <div style={{
                    background: '#ffffff', borderRadius: '20px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                    border: '1px solid rgba(0,0,0,0.03)',
                    overflow: 'hidden',
                    minHeight: '500px',
                    display: 'flex', flexDirection: 'column',
                }}>
                    {/* Title Section */}
                    <div style={{
                        padding: '32px 36px 0',
                        borderBottom: 'none',
                    }}>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            placeholder="Give your note a title..."
                            autoComplete="off"
                            name="noteTitle_editor"
                            style={{
                                width: '100%', border: 'none', outline: 'none',
                                fontSize: '26px', fontWeight: 800, color: '#1a1a2e',
                                backgroundColor: 'transparent', padding: 0,
                                fontFamily: 'inherit', letterSpacing: '-0.3px',
                                lineHeight: 1.3,
                            }}
                        />
                        <div style={{
                            height: '2px', marginTop: '16px',
                            background: 'linear-gradient(90deg, #17A073, #14c486, transparent)',
                            borderRadius: '2px',
                        }} />
                    </div>

                    {/* Content Section */}
                    <div style={{
                        flex: 1, padding: '20px 36px 24px',
                        display: 'flex', flexDirection: 'column',
                    }}>
                        <textarea
                            value={content}
                            onChange={(e) => handleContentChange(e.target.value)}
                            placeholder="Start writing your session notes..."
                            autoComplete="off"
                            name="noteContent_editor"
                            style={{
                                width: '100%', flex: 1, minHeight: '350px',
                                border: 'none', outline: 'none',
                                fontSize: '15px', lineHeight: '1.8', color: '#444',
                                backgroundColor: 'transparent', resize: 'none',
                                fontFamily: 'inherit', padding: 0,
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    {/* Footer Bar */}
                    <div style={{
                        padding: '14px 36px',
                        borderTop: '1px solid #f0f2f5',
                        background: '#fafbfd',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '20px',
                        }}>
                            <span style={{ fontSize: '12px', color: '#b0b8c9', fontWeight: 500 }}>
                                {wordCount} {wordCount === 1 ? 'word' : 'words'}
                            </span>
                            <span style={{ fontSize: '12px', color: '#d0d5de' }}>·</span>
                            <span style={{ fontSize: '12px', color: '#b0b8c9', fontWeight: 500 }}>
                                {charCount} {charCount === 1 ? 'character' : 'characters'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {isDirty ? (
                                <>
                                    <span style={{
                                        width: '6px', height: '6px', borderRadius: '50%',
                                        background: '#FF9800', display: 'inline-block',
                                    }} />
                                    <span style={{ fontSize: '12px', color: '#FF9800', fontWeight: 600 }}>
                                        Unsaved changes
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span className="material-icons" style={{ fontSize: '14px', color: '#17A073' }}>check_circle</span>
                                    <span style={{ fontSize: '12px', color: '#17A073', fontWeight: 600 }}>
                                        {isNew ? 'Ready' : 'Saved'}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </WebLayout>
    );
};

export default TrainerNoteEditorPage;
