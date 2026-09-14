import React, { useEffect, useState } from 'react';
import SectionTabs from '../../components/SectionTabs';
import { useOutletContext } from 'react-router-dom';
import api from '../../api/axios';
import Table from '../../components/Table';
import Loader from '../../components/Loader';
import { IMG } from '../../api/constants';
import { ExternalLink, Layers, LayoutGrid, Tag } from 'lucide-react';

const LIVE_DOMAIN = 'https://sigmatechnologies.com.np';

const CategoryList = () => {
    const { searchQuery } = useOutletContext() || {};
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'parents', 'subs'

    const fetchCategories = async () => {
        try {
            const res = await api.get('/admin/categories');
            setCategories(res.data.data || []);
        } catch (error) {
            console.error('Failed to fetch categories', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleDelete = async (row) => {
        if (window.confirm(`Are you sure you want to delete "${row.title}"?`)) {
            try {
                await api.delete(`/admin/categories/${row.id}`);
                fetchCategories();
            } catch (error) {
                alert('Failed to delete category');
            }
        }
    };

    // Categorization logic
    const isParentCategory = (c) => !c.parentCategory || c.parentCategory === '' || c.parentCategory === '0' || c.parentCategory === null;

    const parentCategories = categories.filter(isParentCategory);
    const subCategories = categories.filter((c) => !isParentCategory(c));

    const counts = {
        all: categories.length,
        parents: parentCategories.length,
        subs: subCategories.length
    };

    // Filter by tab, then by search query
    let tabFiltered = categories;
    if (activeTab === 'parents') tabFiltered = parentCategories;
    else if (activeTab === 'subs') tabFiltered = subCategories;

    const filteredCategories = tabFiltered.filter((c) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase().trim();
        return (
            c.title?.toLowerCase().includes(query) ||
            c.slug?.toLowerCase().includes(query) ||
            c.id?.toString().includes(query)
        );
    });

    const columns = [
        { 
            header: 'Tile Image', 
            accessor: 'image',
            render: (row) => row.image ? (
                <div style={{ width: '60px', height: '40px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e5e7eb', background: '#f9fafb' }}>
                    <img 
                        src={`${IMG.categories}/${row.image}`} 
                        alt={row.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                </div>
            ) : (
                <div style={{ width: '60px', height: '40px', backgroundColor: '#f3f4f6', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '10px' }}>
                    No Image
                </div>
            )
        },
        { 
            header: 'Category Title', 
            accessor: 'title',
            render: (row) => (
                <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>
                    {row.title}
                </div>
            )
        },
        { 
            header: 'Parent Category', 
            accessor: 'parentCategory',
            render: (row) => {
                if (isParentCategory(row)) {
                    return <span style={{ color: '#15803d', fontWeight: '600', fontSize: '12px' }}>Root Category</span>;
                }
                const parent = categories.find(c => String(c.id) === String(row.parentCategory));
                return <span style={{ color: '#4b5563', fontSize: '13px' }}>{parent ? parent.title : `ID #${row.parentCategory}`}</span>;
            }
        },
        { 
            header: 'Status', 
            accessor: 'status',
            render: (row) => row.status === 1 ? (
                <span style={{ padding: '4px 10px', backgroundColor: '#dcfce7', color: '#15803d', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                    ● Active
                </span>
            ) : (
                <span style={{ padding: '4px 10px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                    ○ Inactive
                </span>
            )
        },
        {
            header: 'Live Site',
            accessor: 'slug',
            render: (row) => (
                <a 
                    href={`${LIVE_DOMAIN}/product-category/${row.slug}/products`} 
                    target="_blank" 
                    rel="noreferrer" 
                    style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '4px', 
                        fontSize: '12px', 
                        fontWeight: '600', 
                        color: '#2563eb', 
                        backgroundColor: '#eff6ff', 
                        padding: '5px 10px', 
                        borderRadius: '6px', 
                        textDecoration: 'none',
                        border: '1px solid #bfdbfe'
                    }}
                >
                    <span>View ↗</span>
                    <ExternalLink size={12} />
                </a>
            )
        }
    ];

    const tabStyles = (tabKey) => {
        const isActive = activeTab === tabKey;
        return {
            padding: '9px 18px',
            fontSize: '14px',
            fontWeight: isActive ? '600' : '500',
            fontFamily: 'inherit',
            color: isActive ? '#ffffff' : '#4b5563',
            backgroundColor: isActive ? '#6d28d9' : '#ffffff',
            border: isActive ? '1px solid #6d28d9' : '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: isActive ? '0 4px 6px -1px rgba(109, 40, 217, 0.2)' : '0 1px 2px rgba(0,0,0,0.05)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
        };
    };

    return (
        <div>
            <SectionTabs createPath="/dashboard/categories/new" listPath="/dashboard/categories" entityName="Category" />

            {/* Category Type Filter Tabs */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', margin: '20px 0 16px 0' }}>
                <button 
                    type="button" 
                    onClick={() => setActiveTab('all')} 
                    style={tabStyles('all')}
                >
                    <Layers size={16} />
                    <span>All Categories</span>
                    <span style={{ 
                        fontSize: '12px', 
                        fontWeight: '600',
                        background: activeTab === 'all' ? 'rgba(255, 255, 255, 0.25)' : '#f3f4f6', 
                        color: activeTab === 'all' ? '#ffffff' : '#6b7280', 
                        padding: '2px 8px', 
                        borderRadius: '12px' 
                    }}>
                        {counts.all}
                    </span>
                </button>

                <button 
                    type="button" 
                    onClick={() => setActiveTab('parents')} 
                    style={tabStyles('parents')}
                >
                    <Layers size={16} />
                    <span>Main Parent Categories</span>
                    <span style={{ 
                        fontSize: '12px', 
                        fontWeight: '600',
                        background: activeTab === 'parents' ? 'rgba(255, 255, 255, 0.25)' : '#f3f4f6', 
                        color: activeTab === 'parents' ? '#ffffff' : '#6b7280', 
                        padding: '2px 8px', 
                        borderRadius: '12px' 
                    }}>
                        {counts.parents}
                    </span>
                </button>

                <button 
                    type="button" 
                    onClick={() => setActiveTab('subs')} 
                    style={tabStyles('subs')}
                >
                    <Tag size={16} />
                    <span>Sub-Categories</span>
                    <span style={{ 
                        fontSize: '12px', 
                        fontWeight: '600',
                        background: activeTab === 'subs' ? 'rgba(255, 255, 255, 0.25)' : '#f3f4f6', 
                        color: activeTab === 'subs' ? '#ffffff' : '#6b7280', 
                        padding: '2px 8px', 
                        borderRadius: '12px' 
                    }}>
                        {counts.subs}
                    </span>
                </button>
            </div>

            {loading ? (
                <Loader size="large" />
            ) : (
                <Table 
                    columns={columns} 
                    data={filteredCategories} 
                    editUrlPattern={(row) => `/dashboard/categories/${row.id}/edit`}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
};

export default CategoryList;
