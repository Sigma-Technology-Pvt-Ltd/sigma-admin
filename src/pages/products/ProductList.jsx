import React, { useEffect, useState } from 'react';
import SectionTabs from '../../components/SectionTabs';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import api from '../../api/axios';
import Table from '../../components/Table';

import Loader from '../../components/Loader';
import { IMG } from '../../api/constants';
const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [prodRes, catRes] = await Promise.all([
                api.get('/admin/products'),
                api.get('/admin/categories')
            ]);
            setProducts(prodRes.data.data);
            setCategories(catRes.data.data);
        } catch (error) {
            console.error('Failed to fetch products or categories', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (row) => {
        if (window.confirm(`Are you sure you want to delete "${row.title}"?`)) {
            try {
                await api.delete(`/admin/products/${row.id}`);
                fetchData();
            } catch (error) {
                alert('Failed to delete product');
            }
        }
    };

    const columns = [
        { header: 'ID', accessor: 'id' },
        { 
            header: 'Image', 
            accessor: 'image',
            render: (row) => row.image ? (
                <img src={`${IMG.products}/${row.image}`} alt={row.title} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
            ) : (
                <div style={{ width: '40px', height: '40px', backgroundColor: '#e5e7eb', borderRadius: '4px' }}></div>
            )
        },
        { header: 'Title', accessor: 'title' },
        { 
            header: 'Category', 
            accessor: 'categoryId',
            render: (row) => {
                const cat = categories.find(c => Number(c.id) === Number(row.categoryId));
                return cat ? cat.title : '-';
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
            <SectionTabs createPath="/dashboard/products/new" listPath="/dashboard/products" entityName="Product" />

            {loading ? (
                <Loader size="large" />
            ) : (
                <Table 
                    columns={columns} 
                    data={products} 
                    editUrlPattern={(row) => `/dashboard/products/${row.id}/edit`}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
};

export default ProductList;
