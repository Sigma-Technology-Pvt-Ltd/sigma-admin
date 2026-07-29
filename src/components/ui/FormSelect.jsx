import React, { useState } from 'react';

const FormSelect = ({ label, children, ...props }) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
        <div>
            {label && <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '13px', color: '#4b5563' }}>{label}</label>}
            <select 
                {...props}
                onFocus={(e) => { setIsFocused(true); if(props.onFocus) props.onFocus(e); }}
                onBlur={(e) => { setIsFocused(false); if(props.onBlur) props.onBlur(e); }}
                style={{ 
                    width: '100%', 
                    padding: '12px 16px', 
                    border: isFocused ? '1px solid #6d28d9' : '1px solid transparent', 
                    borderRadius: '8px', 
                    boxSizing: 'border-box',
                    backgroundColor: isFocused ? 'white' : '#f3f4f6',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxShadow: isFocused ? '0 0 0 3px rgba(109, 40, 217, 0.1)' : 'none',
                    color: '#1f2937',
                    fontSize: '14px',
                    cursor: 'pointer',
                    ...(props.style || {})
                }}
            >
                {children}
            </select>
        </div>
    );
};

export default FormSelect;
