import React, { useState } from 'react';
import styles from './CachedImage.module.css';

const CachedImage = ({ imageUrl, width, height, borderRadius = 0, fit = 'cover', className = '' }) => {
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    let finalUrl = imageUrl;

    if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/') && imageUrl.startsWith('assets/')) {
        finalUrl = `/${imageUrl}`;
    }

    // Handling Google Drive links format or other specific URLs if needed
    if (finalUrl?.includes('drive.google.com')) {
        let id = null;
        if (finalUrl.includes('id=')) {
            // e.g. https://drive.google.com/uc?id=XYZ&export=download
            const params = new URLSearchParams(finalUrl.split('?')[1]);
            id = params.get('id');
        } else if (finalUrl.includes('/d/')) {
            // e.g. https://drive.google.com/file/d/XYZ/view
            id = finalUrl.split('/d/')[1].split('/')[0];
        }

        if (id) {
            finalUrl = `https://lh3.googleusercontent.com/d/${id}`;
        }
    }

    const handleLoad = () => setIsLoading(false);
    const handleError = () => {
        setIsLoading(false);
        setHasError(true);
    };

    return (
        <div
            className={`${styles.container} ${className}`}
            style={{ width, height, borderRadius: `${borderRadius}px` }}
        >
            {isLoading && (
                <div className={styles.placeholder}>
                    <div className={styles.spinner}></div>
                </div>
            )}

            {hasError ? (
                <div className={styles.errorContainer}>
                    <span className="material-icons" style={{ color: 'var(--color-primary)', fontSize: '24px' }}>
                        error_outline
                    </span>
                </div>
            ) : (
                <img
                    src={finalUrl}
                    alt="Cached Image"
                    className={`${styles.image} ${isLoading ? styles.hidden : ''}`}
                    style={{ objectFit: fit }}
                    onLoad={handleLoad}
                    onError={handleError}
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                />
            )}
        </div>
    );
};

export default CachedImage;
