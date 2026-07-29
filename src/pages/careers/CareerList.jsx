import React, { useEffect, useState } from 'react';
import SectionTabs from '../../components/SectionTabs';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Table from '../../components/Table';

import Loader from '../../components/Loader';
import { IMG } from '../../api/constants';
const CareerList = () => {
    const [careers, setCareers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchCareers = async () => {
        try {
            const res = await api.get('/admin/careers');
            setCareers(res.data.data);
        } catch (error) {
            console.error('Failed to fetch careers data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCareers();
    }, []);

    const handleDelete = async (row) => {
        if (window.confirm(`Are you sure you want to delete this career?`)) {
            try {
                await api.delete(`/admin/careers/${row.id}`);
                fetchCareers();
            } catch (error) {
                alert('Failed to delete career');
            }
        }
    };

    const columns = [
        { header: 'ID', accessor: 'id' },
        { 
            header: 'Image', 
            accessor: 'image',
            render: (row) => row.image ? (
                <img src={`${IMG.careers}/${row.image}`} alt={row.title} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
            ) : (
                <div style={{ width: '40px', height: '40px', backgroundColor: '#e5e7eb', borderRadius: '4px' }}></div>
            )
        },
        { header: 'Title', accessor: 'title' },
        { header: 'Type', accessor: 'type' },
        { header: 'Vacancies', accessor: 'noOfVacancy' },
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
            <SectionTabs createPath="/dashboard/careers/create" listPath="/dashboard/careers" entityName="Career" />
            <Table 
                columns={columns} 
                data={careers} 
                onEdit={(row) => navigate(`/dashboard/careers/edit/${row.id}`)}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default CareerList;
