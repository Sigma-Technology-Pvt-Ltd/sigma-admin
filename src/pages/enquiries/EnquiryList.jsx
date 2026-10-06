import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import Table from '../../components/Table';
import { FileText, PlusCircle, Trash2, Mail, Phone, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';
import { getAdminBackendUrl } from '../../api/constants';

const EnquiryList = () => {
    const navigate = useNavigate();
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchEnquiries = async () => {
        try {
            const res = await api.get('/admin/enquiries');
            setEnquiries(res.data.data || []);
        } catch (error) {
            console.error('Failed to fetch product enquiries', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEnquiries();
    }, []);

    const handleDelete = async (row) => {
        if (window.confirm(`Are you sure you want to delete enquiry from "${row.name}"?`)) {
            try {
                await api.delete(`/admin/enquiries/${row.id}`);
                fetchEnquiries();
            } catch (err) {
                alert('Failed to delete enquiry');
            }
        }
    };

    const filtered = enquiries.filter(item => {
        const query = searchTerm.toLowerCase();
        return (
            (item.name || '').toLowerCase().includes(query) ||
            (item.email || '').toLowerCase().includes(query) ||
            (item.phoneNumber || '').toLowerCase().includes(query) ||
            (item.productTitle || '').toLowerCase().includes(query) ||
            (item.categoryTitle || '').toLowerCase().includes(query)
        );
    });

    const columns = [
        {
            header: 'Client / Lead',
            render: (row) => (
                <div>
                    <div style={{ fontWeight: '600', color: '#111827', fontSize: '14px' }}>
                        {row.name}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px', fontSize: '12px', color: '#4b5563' }}>
                        {row.phoneNumber && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Phone size={12} color="#1a4b9c" /> {row.phoneNumber}
                            </span>
                        )}
                        {row.email && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Mail size={12} color="#6b7280" /> {row.email}
                            </span>
                        )}
                    </div>
                </div>
            )
        },
        {
            header: 'Enquired Product',
            render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {row.productImage ? (
                        <img 
                            src={`${getAdminBackendUrl()}/images/products/${row.productImage}`} 
                            alt={row.productTitle}
                            style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '6px', border: '1px solid #e5e7eb', background: '#fff' }}
                        />
                    ) : (
                        <div style={{ width: '40px', height: '40px', background: '#f3f4f6', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                            <FileText size={18} />
                        </div>
                    )}
                    <div>
                        <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '13px' }}>
                            {row.productTitle}
                        </div>
                        <span style={{
                            display: 'inline-block',
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            fontSize: '11px',
                            fontWeight: '600',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            marginTop: '2px'
                        }}>
                            {row.categoryTitle}
                        </span>
                    </div>
                </div>
            )
        },
        {
            header: 'Enquiry Message / Remarks',
            render: (row) => (
                <div style={{ maxWidth: '280px', fontSize: '12.5px', color: '#4b5563', lineHeight: '1.4' }}>
                    {row.remarks ? (
                        <div style={{ background: '#f9fafb', padding: '6px 10px', borderRadius: '6px', border: '1px solid #f3f4f6' }}>
                            "{row.remarks}"
                        </div>
                    ) : (
                        <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>No specific remarks</span>
                    )}
                </div>
            )
        },
        {
            header: 'Received Date',
            render: (row) => (
                <span style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} />
                    {new Date(row.createdAt).toLocaleDateString('en-GB')}
                </span>
            )
        },
        {
            header: 'Action',
            render: (row) => (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                        onClick={() => navigate(`/dashboard/enquiries/${row.id}/quote`)}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '7px 14px',
                            backgroundColor: '#1a4b9c',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 1px 2px rgba(26, 75, 156, 0.2)',
                            transition: 'background-color 0.2s'
                        }}
                        title="Create Quotation from this lead"
                    >
                        <FileText size={14} /> Create Quotation
                    </button>
                    <button
                        onClick={() => handleDelete(row)}
                        style={{
                            padding: '7px 10px',
                            backgroundColor: '#fff',
                            color: '#dc2626',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                        title="Delete enquiry"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            )
        }
    ];

    if (loading) return <Loader size="large" />;

    return (
        <div>
            {/* Top Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                        Customer Enquiries
                    </h1>
                    <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px', margin: 0 }}>
                        Inbound product leads from website. Click "Create Quotation" to generate an official Sigma quotation PDF.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => navigate('/dashboard/quotations')}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '9px 16px',
                            background: '#f3f4f6',
                            color: '#1f2937',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontWeight: '600',
                            fontSize: '13px',
                            cursor: 'pointer'
                        }}
                    >
                        <CheckCircle2 size={16} color="#16a34a" /> View Saved Quotations
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/quotations/new')}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '9px 16px',
                            background: '#1a4b9c',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            fontSize: '13px',
                            cursor: 'pointer'
                        }}
                    >
                        <PlusCircle size={16} /> New Blank Quotation
                    </button>
                </div>
            </div>

            {/* Filter / Search Bar */}
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <input 
                    type="text"
                    placeholder="Search by client name, phone, product or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        fontSize: '13.5px',
                        width: '380px',
                        outline: 'none'
                    }}
                />
                <span style={{ fontSize: '13px', color: '#6b7280' }}>
                    Total Enquiries: <strong>{filtered.length}</strong>
                </span>
            </div>

            {/* Table */}
            <Table columns={columns} data={filtered} />
        </div>
    );
};

export default EnquiryList;
