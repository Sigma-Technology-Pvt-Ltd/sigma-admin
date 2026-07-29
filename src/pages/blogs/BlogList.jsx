import React, { useEffect, useState } from 'react';
import SectionTabs from '../../components/SectionTabs';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Table from '../../components/Table';

import Loader from '../../components/Loader';
import { IMG } from '../../api/constants';
const BlogList = () => {
    const [blogs, setBlogs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const [blogsRes, catsRes] = await Promise.all([
                api.get('/admin/blogs'),
                api.get('/admin/blog-categories')
            ]);
            setBlogs(blogsRes.data.data);
            setCategories(catsRes.data.data);
        } catch (error) {
            console.error('Failed to fetch blogs data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (row) => {
        if (window.confirm(`Are you sure you want to delete this blog?`)) {
            try {
                await api.delete(`/admin/blogs/${row.id}`);
                fetchData();
            } catch (error) {
                alert('Failed to delete blog');
            }
        }
    };

    const columns = [
        { header: 'ID', accessor: 'id' },
        { 
            header: 'Image', 
            accessor: 'image',
            render: (row) => row.image ? (
                <img src={`${IMG.blogs}/${row.image}`} alt={row.title} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
            ) : (
                <div style={{ width: '40px', height: '40px', backgroundColor: '#e5e7eb', borderRadius: '4px' }}></div>
            )
        },
        { header: 'Title', accessor: 'title' },
        { 
            header: 'Category', 
            accessor: 'categoryId',
            render: (row) => {
                const cat = categories.find(c => c.id === row.categoryId);
                return cat ? cat.title : row.categoryId;
            }
        },
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
            <SectionTabs createPath="/dashboard/blogs/create" listPath="/dashboard/blogs" entityName="Blog" />
            <Table 
                columns={columns} 
                data={blogs} 
                onEdit={(row) => navigate(`/dashboard/blogs/edit/${row.id}`)}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default BlogList;
