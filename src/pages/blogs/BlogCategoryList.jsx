import React, { useEffect, useState } from 'react';
import SectionTabs from '../../components/SectionTabs';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Table from '../../components/Table';

import Loader from '../../components/Loader';
import { IMG } from '../../api/constants';
const BlogCategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchCategories = async () => {
        try {
            const res = await api.get('/admin/blog-categories');
            setCategories(res.data.data);
        } catch (error) {
            console.error('Failed to fetch blog categories', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleDelete = async (row) => {
        if (window.confirm(`Are you sure you want to delete this blog category?`)) {
            try {
                await api.delete(`/admin/blog-categories/${row.id}`);
                fetchCategories();
            } catch (error) {
                alert('Failed to delete blog category');
            }
        }
    };

    const columns = [
        { header: 'ID', accessor: 'id' },
        { 
            header: 'Image', 
            accessor: 'image',
            render: (row) => row.image ? (
                <img src={`${IMG.blogCategories}/${row.image}`} alt={row.title} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
            ) : (
                <div style={{ width: '40px', height: '40px', backgroundColor: '#e5e7eb', borderRadius: '4px' }}></div>
            )
        },
        { header: 'Title', accessor: 'title' },
        { 
            header: 'Status', 
            accessor: 'status',
            render: (row) => row.status === 1 ? (
                <span style={{ color: 'green', fontWeight: 'bold' }}>Active</span>
            ) : (
                <span style={{ color: 'red', fontWeight: 'bold' }}>Inactive</span>
            )
        }
    ];

    if (loading) return <Loader size="large" />;

    return (
        <div>
            <SectionTabs createPath="/dashboard/blog-categories/create" listPath="/dashboard/blog-categories" entityName="Blog Category" />
            <Table 
                columns={columns} 
                data={categories} 
                onEdit={(row) => navigate(`/dashboard/blog-categories/edit/${row.id}`)}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default BlogCategoryList;
