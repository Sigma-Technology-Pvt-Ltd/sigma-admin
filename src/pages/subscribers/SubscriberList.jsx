import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import Table from '../../components/Table';

import Loader from '../../components/Loader';
const SubscriberList = () => {
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSubscribers = async () => {
        try {
            const res = await api.get('/admin/subscribers');
            setSubscribers(res.data.data);
        } catch (error) {
            console.error('Failed to fetch subscribers data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const columns = [
        { header: 'ID', accessor: 'id' },
        { header: 'Email', accessor: 'email' },
        { 
            header: 'Status', 
            accessor: 'status',
            render: (row) => row.status === 1 ? (
                <span style={{ color: 'green', fontWeight: 'bold' }}>Active</span>
            ) : (
                <span style={{ color: 'red', fontWeight: 'bold' }}>Inactive</span>
            )
        },
        { 
            header: 'Date Subscribed', 
            accessor: 'createdAt',
            render: (row) => new Date(row.createdAt).toLocaleDateString()
        }
    ];

    if (loading) return <Loader size="large" />;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Subscribers</h1>
            </div>
            <Table 
                columns={columns} 
                data={subscribers} 
            />
        </div>
    );
};

export default SubscriberList;
