import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PlusCircle, List } from 'lucide-react';

const SectionTabs = ({ createPath, listPath, entityName }) => {
    const location = useLocation();
    
    // Check if current path matches or if it's an edit route (which should highlight 'Create/Edit')
    const isCreateActive = location.pathname === createPath || location.pathname.includes('/edit');
    const isListActive = location.pathname === listPath;
    
    return (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <Link 
                to={createPath} 
                style={{ 
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', 
                    textDecoration: 'none', fontWeight: '500', transition: 'all 0.2s', fontSize: '14px',
                    backgroundColor: isCreateActive ? '#6d28d9' : '#ffffff',
                    color: isCreateActive ? 'white' : '#4b5563',
                    border: isCreateActive ? '1px solid #6d28d9' : '1px solid #e5e7eb',
                    boxShadow: isCreateActive ? '0 4px 6px -1px rgba(109, 40, 217, 0.2)' : '0 1px 2px rgba(0,0,0,0.05)'
                }}
            >
                <PlusCircle size={18} />
                Create {entityName}
            </Link>
            <Link 
                to={listPath} 
                style={{ 
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', 
                    textDecoration: 'none', fontWeight: '500', transition: 'all 0.2s', fontSize: '14px',
                    backgroundColor: isListActive ? '#6d28d9' : '#ffffff',
                    color: isListActive ? 'white' : '#4b5563',
                    border: isListActive ? '1px solid #6d28d9' : '1px solid #e5e7eb',
                    boxShadow: isListActive ? '0 4px 6px -1px rgba(109, 40, 217, 0.2)' : '0 1px 2px rgba(0,0,0,0.05)'
                }}
            >
                <List size={18} />
                View {entityName}s
            </Link>
        </div>
    );
};

export default SectionTabs;
