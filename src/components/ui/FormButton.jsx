import React from 'react';

const FormButton = ({ children, variant = 'primary', ...props }) => {
    const isPrimary = variant === 'primary';
    return (
        <button 
            {...props}
            style={{ 
                padding: '12px 24px', 
                background: isPrimary ? '#6d28d9' : '#e5e7eb',
                color: isPrimary ? 'white' : '#4b5563', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: props.disabled ? 'not-allowed' : 'pointer', 
                fontWeight: '600',
                fontSize: '14px',
                opacity: props.disabled ? 0.7 : 1,
                transition: 'all 0.2s',
                ...(props.style || {})
            }}
        >
            {children}
        </button>
    );
};

export default FormButton;
