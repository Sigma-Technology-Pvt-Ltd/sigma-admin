import React from 'react';
import Loader from './Loader';

const LoadingOverlay = ({ loading, children }) => {
    return (
        <div style={{ position: 'relative' }}>
            <div style={{
                transition: 'all 0.3s ease',
                filter: loading ? 'blur(4px)' : 'none',
                opacity: loading ? 0.7 : 1,
                pointerEvents: loading ? 'none' : 'auto'
            }}>
                {children}
            </div>
            {loading && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                }}>
                    <Loader size="xlarge" />
                </div>
            )}
        </div>
    );
};

export default LoadingOverlay;
