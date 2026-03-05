import React from 'react';
import Sidebar from './Sidebar';
import styles from './WebLayout.module.css';

const WebLayout = ({ children, title, subtitle }) => {
    return (
        <div className={styles.layout}>
            <Sidebar />
            <main className={styles.content}>
                <div className={styles.contentInner}>
                    {title && (
                        <div className={styles.pageHeader}>
                            <h1 className={styles.pageTitle}>{title}</h1>
                            {subtitle && <p className={styles.pageSubtitle}>{subtitle}</p>}
                        </div>
                    )}
                    {children}
                </div>
            </main>
        </div>
    );
};

export default WebLayout;
