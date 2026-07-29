import React, { useEffect, useState } from 'react';
import SectionTabs from '../../components/SectionTabs';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Table from '../../components/Table';

import Loader from '../../components/Loader';
import { IMG } from '../../api/constants';
const TestimonialList = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchTestimonials = async () => {
        try {
            const res = await api.get('/admin/testimonials');
            setTestimonials(res.data.data);
        } catch (error) {
            console.error('Failed to fetch testimonials', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const handleDelete = async (row) => {
        if (window.confirm(`Are you sure you want to delete this testimonial?`)) {
            try {
                await api.delete(`/admin/testimonials/${row.id}`);
                fetchTestimonials();
            } catch (error) {
                alert('Failed to delete testimonial');
            }
        }
    };

    const columns = [
        { header: 'ID', accessor: 'id' },
        { 
            header: 'Image', 
            accessor: 'image',
            render: (row) => row.image ? (
                <img src={`${IMG.testimonials}/${row.image}`} alt={row.fullName} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '20px' }} />
            ) : (
                <div style={{ width: '40px', height: '40px', backgroundColor: '#e5e7eb', borderRadius: '20px' }}></div>
            )
        },
        { header: 'Name', accessor: 'fullName' },
        { header: 'Company', accessor: 'companyName' },
        { header: 'Position', accessor: 'position' },
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
            <SectionTabs createPath="/dashboard/testimonials/create" listPath="/dashboard/testimonials" entityName="Testimonial" />
            <Table 
                columns={columns} 
                data={testimonials} 
                onEdit={(row) => navigate(`/dashboard/testimonials/edit/${row.id}`)}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default TestimonialList;
