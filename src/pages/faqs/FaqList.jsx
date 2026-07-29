import React, { useEffect, useState } from 'react';
import SectionTabs from '../../components/SectionTabs';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Table from '../../components/Table';

import Loader from '../../components/Loader';
const FaqList = () => {
    const [faqs, setFaqs] = useState([]);
    const [faqTypes, setFaqTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const [faqsRes, typesRes] = await Promise.all([
                api.get('/admin/faqs'),
                api.get('/admin/faqs/types')
            ]);
            setFaqs(faqsRes.data.data);
            setFaqTypes(typesRes.data.data);
        } catch (error) {
            console.error('Failed to fetch FAQs data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (row) => {
        if (window.confirm(`Are you sure you want to delete this FAQ?`)) {
            try {
                await api.delete(`/admin/faqs/${row.id}`);
                fetchData();
            } catch (error) {
                alert('Failed to delete FAQ');
            }
        }
    };

    const columns = [
        { header: 'ID', accessor: 'id' },
        { 
            header: 'Type', 
            accessor: 'typeId',
            render: (row) => {
                const type = faqTypes.find(t => t.id === row.typeId);
                return type ? type.title : row.typeId;
            }
        },
        { header: 'Question', accessor: 'question' },
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
            <SectionTabs createPath="/dashboard/faqs/create" listPath="/dashboard/faqs" entityName="FAQ" />
            <Table 
                columns={columns} 
                data={faqs} 
                onEdit={(row) => navigate(`/dashboard/faqs/edit/${row.id}`)}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default FaqList;
