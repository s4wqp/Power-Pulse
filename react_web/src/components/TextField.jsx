import React, { useState } from 'react';
import styles from './TextField.module.css';

const TextField = ({
    label,
    placeholder,
    value,
    onChange,
    type = 'text',
    error,
    icon,
    multiline = false,
    rows = 3,
    dark = false
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className={`${styles.container} ${dark ? styles.dark : ''}`}>
            {label && <label className={styles.label}>{label}</label>}
            <div className={`${styles.inputWrapper} ${error ? styles.hasError : ''}`}>
                {icon && <span className="material-icons" style={{ padding: '0 12px', color: dark ? 'rgba(255,255,255,0.5)' : 'var(--color-black)' }}>{icon}</span>}

                {multiline ? (
                    <textarea
                        className={styles.input}
                        placeholder={placeholder}
                        value={value}
                        onChange={onChange}
                        rows={rows}
                    />
                ) : (
                    <input
                        type={inputType}
                        className={styles.input}
                        placeholder={placeholder}
                        value={value}
                        onChange={onChange}
                    />
                )}

                {isPassword && (
                    <button
                        type="button"
                        className={styles.toggleBtn}
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        <span className="material-icons">
                            {showPassword ? 'visibility' : 'visibility_off'}
                        </span>
                    </button>
                )}
            </div>
            {error && <span className={styles.errorText}>{error}</span>}
        </div>
    );
};

export default TextField;
