import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import styles from './Sidebar.module.css';

const traineeNav = [
    {
        label: 'MAIN', items: [
            { name: 'Home', icon: 'home', path: '/trainee/home' },
            { name: 'Exercises', icon: 'fitness_center', path: '/trainee/exercises' },
            { name: 'My Cart', icon: 'shopping_cart', path: '/trainee/cart' },
            { name: 'My Orders', icon: 'receipt_long', path: '/trainee/orders' },
        ]
    },
    {
        label: 'SOCIAL', items: [
            { name: 'Chat', icon: 'chat_bubble', path: '/trainee/chat' },
        ]
    },
    {
        label: 'ACCOUNT', items: [
            { name: 'Profile', icon: 'person', path: '/trainee/profile' },
        ]
    },
];

const trainerNav = [
    {
        label: 'MAIN', items: [
            { name: 'Home', icon: 'home', path: '/trainer/home' },
            { name: 'Subscribers', icon: 'people', path: '/trainer/subscribers' },
            { name: 'Workouts', icon: 'fitness_center', path: '/trainer/exercises' },
            { name: 'Plans', icon: 'assignment', path: '/trainer/plans' },
        ]
    },
    {
        label: 'SOCIAL', items: [
            { name: 'Chat', icon: 'chat_bubble', path: '/trainer/chat' },
        ]
    },
    {
        label: 'ACCOUNT', items: [
            { name: 'Profile', icon: 'person', path: '/trainer/profile' },
        ]
    },
];

const adminNav = [
    {
        label: 'MANAGEMENT', items: [
            { name: 'Dashboard', icon: 'dashboard', path: '/admin/home' },
            { name: 'Food', icon: 'restaurant_menu', path: '/admin/category/Food' },
            { name: 'Supplements', icon: 'medication', path: '/admin/category/Supplements' },
            { name: 'Clothes', icon: 'checkroom', path: '/admin/category/Clothes' },
        ]
    },
];

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuthStore();
    const [mobileOpen, setMobileOpen] = useState(false);

    const role = user?.role?.toLowerCase() || 'trainee';
    let navSections = traineeNav;
    if (role === 'trainer') navSections = trainerNav;
    if (role === 'admin') navSections = adminNav;

    const handleNav = (path) => {
        navigate(path);
        setMobileOpen(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname.startsWith(path);

    return (
        <>
            <button
                className={styles.mobileToggle}
                onClick={() => setMobileOpen(!mobileOpen)}
            >
                <span className="material-icons">{mobileOpen ? 'close' : 'menu'}</span>
            </button>

            {mobileOpen && (
                <div
                    className={`${styles.sidebarOverlay} ${styles.show}`}
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside className={`${styles.sidebar} ${mobileOpen ? styles.open : ''}`}>
                <div className={styles.logoSection}>
                    <img src="/assets/images/app_icon.png" alt="PowerPulse" className={styles.logoIcon} style={{ width: 52, height: 52, borderRadius: 8, objectFit: 'contain' }} />
                    <div>
                        <div className={styles.logoText}>PowerPulse</div>
                        <div className={styles.logoSub}>{role === 'admin' ? 'Admin Panel' : role === 'trainer' ? 'Trainer Portal' : 'Fitness Hub'}</div>
                    </div>
                </div>

                <nav className={styles.navSection}>
                    {navSections.map((section) => (
                        <div key={section.label}>
                            <div className={styles.navLabel}>{section.label}</div>
                            {section.items.map((item) => (
                                <button
                                    key={item.path}
                                    className={`${styles.navItem} ${isActive(item.path) ? styles.active : ''}`}
                                    onClick={() => handleNav(item.path)}
                                >
                                    <span className="material-icons">{item.icon}</span>
                                    {item.name}
                                </button>
                            ))}
                        </div>
                    ))}
                </nav>

                <div className={styles.userSection}>
                    <div className={styles.userAvatar}>
                        {(user?.fullName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.userInfo}>
                        <div className={styles.userName}>{user?.fullName || 'User'}</div>
                        <div className={styles.userRole}>{role}</div>
                    </div>
                    <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">
                        <span className="material-icons" style={{ fontSize: 18 }}>logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
