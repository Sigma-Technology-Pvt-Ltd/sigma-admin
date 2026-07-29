import React from 'react';
import logo from '../assets/s-only.png';

const Loader = ({ size = 'medium', fullPage }) => {
    let dimensions;
    switch (size) {
        case 'small':
            dimensions = '30px';
            break;
        case 'xlarge':
            dimensions = '150px';
            break;
        case 'large':
            dimensions = '120px';
            break;
        case 'medium':
        default:
            dimensions = '50px';
            break;
    }

    const isFullPage = fullPage !== undefined ? fullPage : (size === 'large');

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            padding: '20px',
            minHeight: isFullPage ? '60vh' : 'auto',
            width: isFullPage ? '100%' : 'auto'
        }}>
            <style>
                {`
                    @keyframes pulseBreath {
                        0% { transform: scale(1); opacity: 0.85; }
                        50% { transform: scale(1.08); opacity: 1; }
                        100% { transform: scale(1); opacity: 0.85; }
                    }
                `}
            </style>
            <img 
                src={logo} 
                alt="Loading..." 
                style={{ 
                    width: dimensions, 
                    height: dimensions, 
                    objectFit: 'contain',
                    animation: 'pulseBreath 1.8s ease-in-out infinite' 
                }} 
            />
        </div>
    );
};

export default Loader;
