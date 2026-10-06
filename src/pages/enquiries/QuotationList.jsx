import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import Table from '../../components/Table';
import { formatCurrency } from '../../utils/numberToWords';
import { downloadQuotationPdf, getQuotationPdfBlobUrl } from '../../utils/sigmaQuotationPdf';
import { FileText, PlusCircle, Download, Eye, Trash2, ArrowLeft, X } from 'lucide-react';

const QuotationList = () => {
    const navigate = useNavigate();
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [previewUrl, setPreviewUrl] = useState(null);
    const [activeQuote, setActiveQuote] = useState(null);

    const fetchQuotations = async () => {
        try {
            const res = await api.get('/admin/quotations');
            setQuotations(res.data?.data || []);
        } catch (err) {
            console.error('Failed to fetch quotations', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuotations();
    }, []);

    const handleDelete = async (row) => {
        if (window.confirm(`Are you sure you want to delete quotation "${row.quotationNumber}"?`)) {
            try {
                await api.delete(`/admin/quotations/${row.id}`);
                fetchQuotations();
            } catch (err) {
                alert('Failed to delete quotation');
            }
        }
    };

    const handlePreview = (quote) => {
        setActiveQuote(quote);
        const url = getQuotationPdfBlobUrl(quote);
        setPreviewUrl(url);
    };

    const handleDownload = (quote) => {
        const cleanQtNumber = (quote?.quotationNumber || '').replace(/^SIGMA-QT-?/i, '') || `${Math.floor(1000 + Math.random() * 9000)}`;
        downloadQuotationPdf(quote, `Sigma-QT-${cleanQtNumber}.pdf`);
    };

    const filtered = quotations.filter(q => {
        const query = searchTerm.toLowerCase();
        return (
            (q.quotationNumber || '').toLowerCase().includes(query) ||
            (q.customer?.name || '').toLowerCase().includes(query) ||
            (q.projectTitle || '').toLowerCase().includes(query) ||
            (q.customer?.phone || '').toLowerCase().includes(query)
        );
    });

    const columns = [
        {
            header: 'Quotation No',
            render: (row) => (
                <div>
                    <strong style={{ color: '#1a4b9c', fontSize: '13.5px' }}>
                        {row.quotationNumber}
                    </strong>
                    <div style={{ fontSize: '11.5px', color: '#6b7280', marginTop: '2px' }}>
                        {row.date}
                    </div>
                </div>
            )
        },
        {
            header: 'Customer',
            render: (row) => (
                <div>
                    <div style={{ fontWeight: '600', color: '#111827', fontSize: '13.5px' }}>
                        {row.customer?.name || 'Customer'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                        {row.customer?.phone || row.customer?.email || '—'}
                    </div>
                </div>
            )
        },
        {
            header: 'Subject / Project',
            render: (row) => (
                <div style={{ maxWidth: '280px', fontSize: '13px', color: '#374151' }}>
                    <div style={{ fontWeight: '500' }}>{row.projectTitle}</div>
                    <div style={{ fontSize: '11.5px', color: '#9ca3af', marginTop: '2px' }}>
                        {row.items?.length || 0} line items
                    </div>
                </div>
            )
        },
        {
            header: 'Grand Total',
            render: (row) => (
                <div>
                    <strong style={{ fontSize: '14px', color: '#1a4b9c' }}>
                        NPR {formatCurrency(row.grandTotal)}
                    </strong>
                    <div style={{ fontSize: '11px', color: row.isVatApplicable ? '#16a34a' : '#6b7280' }}>
                        {row.isVatApplicable ? 'Incl. 13% VAT' : 'VAT Exempt'}
                    </div>
                </div>
            )
        },
        {
            header: 'Actions',
            render: (row) => (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                        onClick={() => handlePreview(row)}
                        style={{
                            padding: '6px 10px',
                            background: '#eff6ff',
                            color: '#1a4b9c',
                            border: '1px solid #bfdbfe',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                        title="Preview PDF"
                    >
                        <Eye size={13} /> Preview
                    </button>

                    <button
                        onClick={() => handleDownload(row)}
                        style={{
                            padding: '6px 12px',
                            background: '#1a4b9c',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                        title="Download PDF"
                    >
                        <Download size={13} /> PDF
                    </button>

                    <button
                        onClick={() => navigate(`/dashboard/quotations/${row.id}/edit`)}
                        style={{
                            padding: '6px 10px',
                            background: '#f3f4f6',
                            color: '#374151',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }}
                        title="Edit Quotation"
                    >
                        Edit
                    </button>

                    <button
                        onClick={() => handleDelete(row)}
                        style={{
                            padding: '6px 8px',
                            background: '#fff',
                            color: '#dc2626',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                        title="Delete"
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        onClick={() => navigate('/dashboard/enquiries')}
                        style={{
                            background: '#f3f4f6',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#374151'
                        }}
                    >
                        <ArrowLeft size={16} /> Enquiries
                    </button>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                            Saved Quotations History
                        </h1>
                        <p style={{ fontSize: '13px', color: '#6b7280', margin: '3px 0 0' }}>
                            Archive of all generated Sigma quotations. Re-download, preview, or revise anytime.
                        </p>
                    </div>
                </div>

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

            {/* Filter Bar */}
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <input 
                    type="text"
                    placeholder="Search by quote number, client name, or project..."
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
                    Total Quotations: <strong>{filtered.length}</strong>
                </span>
            </div>

            {/* Table */}
            <Table columns={columns} data={filtered} />

            {/* PDF Modal Preview */}
            {previewUrl && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div style={{
                        backgroundColor: '#fff',
                        width: '900px',
                        height: '90vh',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{
                            padding: '12px 20px',
                            background: '#1a4b9c',
                            color: '#fff',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <strong style={{ fontSize: '15px' }}>
                                Quotation: {activeQuote?.quotationNumber}
                            </strong>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => handleDownload(activeQuote)}
                                    style={{
                                        background: '#fff',
                                        color: '#1a4b9c',
                                        border: 'none',
                                        padding: '5px 12px',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    <Download size={14} /> Download PDF
                                </button>
                                <button
                                    onClick={() => setPreviewUrl(null)}
                                    style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <iframe 
                            src={previewUrl}
                            style={{ width: '100%', height: '100%', border: 'none' }}
                            title="Quotation Preview"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuotationList;
