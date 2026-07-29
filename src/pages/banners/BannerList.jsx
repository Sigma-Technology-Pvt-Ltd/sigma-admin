import React, { useEffect, useState } from 'react';
import SectionTabs from '../../components/SectionTabs';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Table from '../../components/Table';

import Loader from '../../components/Loader';
import { IMG } from '../../api/constants';
const BannerList = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchBanners = async () => {
        try {
            const res = await api.get('/admin/banners');
            setBanners(res.data.data);
        } catch (error) {
            console.error('Failed to fetch banners', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const handleDelete = async (row) => {
        if (window.confirm(`Are you sure you want to delete this banner?`)) {
            try {
                await api.delete(`/admin/banners/${row.id}`);
                fetchBanners();
            } catch (error) {
                alert('Failed to delete banner');
            }
        }
    };

    const columns = [
        { header: 'ID', accessor: 'id' },
        { 
            header: 'Image', 
            accessor: 'image',
            render: (row) => row.image ? (
                <img src={`${IMG.banners}/${row.image}`} alt={row.title} style={{ width: '80px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
            ) : (
                <div style={{ width: '80px', height: '40px', backgroundColor: '#e5e7eb', borderRadius: '4px' }}></div>
            )
        },
        { header: 'Title', accessor: 'title' },
        { header: 'Type', accessor: 'type' },
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
            <SectionTabs createPath="/dashboard/banners/create" listPath="/dashboard/banners" entityName="Banner" />
            <Table 
                columns={columns} 
                data={banners} 
                onEdit={(row) => navigate(`/dashboard/banners/edit/${row.id}`)}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default BannerList;
