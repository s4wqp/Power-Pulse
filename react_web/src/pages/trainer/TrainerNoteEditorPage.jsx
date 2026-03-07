import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { trainerService } from '../../services/trainerService';
import styles from './Trainer.module.css';

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
            if (traineeSubs.length > 0) {
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
            alert('No active subscription found for this trainee.');
            return;
        }

        setSaving(true);
        try {
            await trainerService.addDailyNote(subscriptionId, title.trim(), content.trim());
            setIsDirty(false);
            navigate(-1);
        } catch (err) {
            console.error('Failed to save note:', err);
            alert('Failed to save note: ' + (err.response?.data?.message || err.message));
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

    return (
        <div className={styles.pageContainer} style={{ backgroundColor: 'white', display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {/* AppBar */}
            <div style={{
                backgroundColor: 'white', padding: '12px 16px',
                borderBottom: '1px solid #F0F0F0',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <button onClick={handleBack} style={{
                    background: '#17A073', border: 'none', cursor: 'pointer',
                    width: '36px', height: '36px', borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <span className="material-icons" style={{ fontSize: '20px', color: 'white' }}>arrow_back_ios_new</span>
                </button>
                <button onClick={handleSave} disabled={saving} style={{
                    background: '#17A073', border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                    width: '36px', height: '36px', borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: saving ? 0.6 : 1,
                }}>
                    <span className="material-icons" style={{ fontSize: '22px', color: 'white' }}>
                        {saving ? 'hourglass_empty' : 'save'}
                    </span>
                </button>
            </div>

            {/* Editor Body */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Title Input */}
                <div style={{ padding: '20px 20px 10px' }}>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="Title"
                        style={{
                            width: '100%', border: 'none', outline: 'none',
                            fontSize: '28px', fontWeight: 'bold', color: '#1a1a2e',
                            backgroundColor: 'transparent', padding: 0,
                            fontFamily: 'inherit',
                        }}
                    />
                </div>

                {/* Content Input */}
                <div style={{ flex: 1, padding: '0 20px 20px', overflow: 'auto' }}>
                    <textarea
                        value={content}
                        onChange={(e) => handleContentChange(e.target.value)}
                        placeholder="Type something..."
                        style={{
                            width: '100%', height: '100%', border: 'none', outline: 'none',
                            fontSize: '16px', lineHeight: '1.6', color: '#444',
                            backgroundColor: 'transparent', resize: 'none',
                            fontFamily: 'inherit', padding: 0,
                            boxSizing: 'border-box',
                        }}
                    />
                </div>

                {/* Formatting Toolbar (visual only, like mobile) */}
                <div style={{
                    padding: '12px 16px', backgroundColor: '#F5F5F5',
                    display: 'flex', justifyContent: 'space-evenly', alignItems: 'center',
                    borderTop: '1px solid #E0E0E0',
                }}>
                    {['format_bold', 'format_italic', 'format_underlined', 'link', 'format_list_bulleted', 'code', 'text_fields', 'functions'].map(icon => (
                        <span key={icon} className="material-icons" style={{ fontSize: '22px', color: '#999', cursor: 'pointer' }}>{icon}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TrainerNoteEditorPage;
