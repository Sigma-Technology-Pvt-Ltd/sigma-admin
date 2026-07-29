import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Table from '../../components/Table';

import Loader from '../../components/Loader';
import { IMG } from '../../api/constants';
const DownloadList = () => {
    const [downloads, setDownloads] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const [downloadsRes, productsRes] = await Promise.all([
                api.get('/admin/downloads'),
                api.get('/admin/products')
            ]);
            setDownloads(downloadsRes.data.data);
            setProducts(productsRes.data.data);
        } catch (error) {
            console.error('Failed to fetch downloads data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (row) => {
        if (window.confirm(`Are you sure you want to delete this download?`)) {
            try {
                await api.delete(`/admin/downloads/${row.id}`);
                fetchData();
            } catch (error) {
                alert('Failed to delete download');
            }
        }
    };

    const columns = [
        { header: 'ID', accessor: 'id' },
        { header: 'Title', accessor: 'title' },
        { 
            header: 'Product', 
            accessor: 'productId',
            render: (row) => {
                const p = products.find(prod => Number(prod.id) === Number(row.productId));
                return p ? p.title : '-';
            }
        },
        { 
            header: 'File', 
            accessor: 'filename',
            render: (row) => (
                <a href={`${IMG.documents}/${row.filename}`} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', textDecoration: 'underline' }}>
                    View/Download
                </a>
            )
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
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => navigate('/dashboard/downloads/create')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#6d28d9', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>+ Upload New File</button>
            </div>
            <Table 
                columns={columns} 
                data={downloads} 
                onEdit={(row) => navigate(`/dashboard/downloads/edit/${row.id}`)}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default DownloadList;
