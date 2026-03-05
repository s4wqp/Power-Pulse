import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './BottomNav.module.css';

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        { id: 'home', icon: 'home', path: '/trainee/home' },
        { id: 'cart', icon: 'shopping_cart', path: '/trainee/cart' },
        { id: 'chat', icon: 'chat', path: '/trainee/chat' },
        { id: 'profile', icon: 'person', path: '/trainee/profile' }
    ];

    return (
        <div className={styles.navContainer}>
            {tabs.map(tab => {
                const isActive = location.pathname.startsWith(tab.path);
                return (
                    <div
                        key={tab.id}
                        className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                        onClick={() => navigate(tab.path)}
                    >
                        <span className="material-icons">{tab.icon}</span>
                        {isActive && <div className={styles.indicator} />}
                    </div>
                );
            })}
        </div>
    );
};

export default BottomNav;
