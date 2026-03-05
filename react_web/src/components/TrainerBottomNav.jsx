import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const TrainerBottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        { id: 'home', icon: 'home', path: '/trainer/home' },
        { id: 'chat', icon: 'chat', path: '/trainer/chat' },
        { id: 'profile', icon: 'person', path: '/trainer/profile' }
    ];

    return (
        <div style={{
            position: 'fixed', bottom: 0, left: 0, width: '100%', height: '60px',
            backgroundColor: 'white', display: 'flex', justifyContent: 'space-around', alignItems: 'center',
            borderRadius: '30px 30px 0 0', boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)', zIndex: 1000
        }}>
            {tabs.map(tab => {
                const isActive = location.pathname.startsWith(tab.path);
                return (
                    <div
                        key={tab.id}
                        style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            color: isActive ? 'var(--color-primary)' : 'var(--color-text-second)', cursor: 'pointer',
                            height: '100%', width: '60px', position: 'relative'
                        }}
                        onClick={() => navigate(tab.path)}
                    >
                        <span className="material-icons" style={{ fontSize: '28px' }}>{tab.icon}</span>
                        {isActive && <div style={{ position: 'absolute', top: 0, width: '30px', height: '3px', backgroundColor: 'var(--color-primary)', borderRadius: '0 0 3px 3px' }} />}
                    </div>
                );
            })}
        </div>
    );
};

export default TrainerBottomNav;
