import React from 'react';

const FormCard = ({ title, children, style = {} }) => {
    return (
        <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '16px', 
            padding: '24px', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            border: '1px solid #f3f4f6',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            ...style
        }}>
            {title && (
                <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    color: '#1f2937', 
                    margin: 0,
                    paddingBottom: '16px',
                    borderBottom: '1px solid #f3f4f6'
                }}>
                    {title}
                </h3>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {children}
            </div>
        </div>
    );
};

export default FormCard;
