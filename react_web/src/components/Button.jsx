import React from 'react';
import styles from './Button.module.css';

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, style }) => {
    return (
        <button
            className={`${styles.btn} ${styles[variant]} ${className}`}
            onClick={onClick}
            disabled={disabled}
            style={style}
        >
            {children}
        </button>
    );
};

export default Button;
