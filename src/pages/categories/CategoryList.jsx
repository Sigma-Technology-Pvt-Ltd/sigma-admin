import React, { useEffect, useState } from 'react';
import SectionTabs from '../../components/SectionTabs';
import { Link, useOutletContext } from 'react-router-dom';
import { Plus } from 'lucide-react';
import api from '../../api/axios';
import Table from '../../components/Table';

import Loader from '../../components/Loader';
import { IMG } from '../../api/constants';
const CategoryList = () => {
    const { searchQuery } = useOutletContext() || {};
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/admin/categories');
            setCategories(res.data.data);
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

    const filteredCategories = categories.filter((c) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase().trim();
        return (
            c.title?.toLowerCase().includes(query) ||
            c.id?.toString().includes(query)
        );
    });

    const columns = [
        { header: 'ID', accessor: 'id' },
        { 
            header: 'Image', 
            accessor: 'image',
            render: (row) => row.image ? (
                <img src={`${IMG.categories}/${row.image}`} alt={row.title} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
            ) : (
                <div style={{ width: '40px', height: '40px', backgroundColor: '#e5e7eb', borderRadius: '4px' }}></div>
            )
        },
        { header: 'Title', accessor: 'title' },
        { 
            header: 'Parent', 
            accessor: 'parentCategory',
            render: (row) => {
                const parent = categories.find(c => String(c.id) === String(row.parentCategory));
                return parent ? parent.title : '-';
            }
        },
        { 
            header: 'Status', 
            accessor: 'status',
            render: (row) => row.status === 1 ? (
                <span style={{ padding: '4px 8px', backgroundColor: '#dcfce3', color: '#166534', borderRadius: '9999px', fontSize: '12px', fontWeight: 'bold' }}>Active</span>
            ) : (
                <span style={{ padding: '4px 8px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '9999px', fontSize: '12px', fontWeight: 'bold' }}>Inactive</span>
            )
        }
    ];

    return (
        <div>
            <SectionTabs createPath="/dashboard/categories/new" listPath="/dashboard/categories" entityName="Category" />

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
