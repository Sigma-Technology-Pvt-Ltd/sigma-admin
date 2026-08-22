import React, { useState, useEffect, useCallback } from 'react';
import { Ticket, RefreshCw, ChevronRight, X, Clock, CheckCircle, AlertCircle, XCircle, Users, BarChart2 } from 'lucide-react';
import api from '../../api/axios';

const STATUS_CONFIG = {
    Open:         { color: '#2563eb', bg: '#eff6ff', icon: <AlertCircle size={14} /> },
    'In Progress':{ color: '#d97706', bg: '#fffbeb', icon: <Clock size={14} /> },
    Resolved:     { color: '#16a34a', bg: '#f0fdf4', icon: <CheckCircle size={14} /> },
    Closed:       { color: '#64748b', bg: '#f8fafc', icon: <XCircle size={14} /> },
};

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Open;
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', color: cfg.color, background: cfg.bg }}>
            {cfg.icon} {status}
        </span>
    );
};

const formatDate = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const TicketOverview = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [ticketDetail, setTicketDetail] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [search, setSearch] = useState('');

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/ticket-stats');
            setStats(res.data.data);
        } catch {
            setError('Failed to load ticket statistics.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchStats(); }, [fetchStats]);

    const openTicket = async (ticket) => {
        setSelectedTicket(ticket);
        setLoadingDetail(true);
        try {
            const res = await api.get(`/admin/tickets/${ticket.id}`);
            setTicketDetail(res.data.data);
        } catch {
            setTicketDetail(null);
        } finally {
            setLoadingDetail(false);
        }
    };

    const cardStyle = { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #f3f4f6' };

    const filteredTickets = stats?.recentTickets?.filter(t =>
        !search || [t.ticketNumber, t.customerName, t.customerEmail, t.productName].some(v => v?.toLowerCase().includes(search.toLowerCase()))
    ) || [];

    if (loading) return <div style={{ textAlign: 'center', padding: '80px', color: '#64748b' }}>Loading ticket overview...</div>;
    if (error) return <div style={{ textAlign: 'center', padding: '80px', color: '#dc2626' }}>{error}</div>;

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>Ticket Overview</h1>
                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>Read-only summary of all service requests</p>
                </div>
                <button onClick={fetchStats} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#64748b', fontWeight: '600', fontSize: '14px' }}>
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                    { label: 'Total', value: stats?.total || 0, color: '#6d28d9', bg: '#f3f0ff' },
                    { label: 'Open', value: stats?.counts?.Open || 0, color: '#2563eb', bg: '#eff6ff' },
                    { label: 'In Progress', value: stats?.counts?.['In Progress'] || 0, color: '#d97706', bg: '#fffbeb' },
                    { label: 'Resolved', value: stats?.counts?.Resolved || 0, color: '#16a34a', bg: '#f0fdf4' },
                    { label: 'Closed', value: stats?.counts?.Closed || 0, color: '#64748b', bg: '#f8fafc' },
                ].map(s => (
                    <div key={s.label} style={{ ...cardStyle, textAlign: 'center', padding: '20px' }}>
                        <div style={{ fontSize: '32px', fontWeight: '800', color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', fontWeight: '500' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Per-Agent Breakdown */}
            {stats?.agents?.length > 0 && (
                <div style={{ ...cardStyle, marginBottom: '24px' }}>
                    <h2 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={18} color="#6d28d9" /> Agent Breakdown
                    </h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                                {['Agent', 'Status', 'Assigned Tickets', 'Resolved'].map(h => (
                                    <th key={h} style={{ textAlign: 'left', padding: '10px 16px', color: '#64748b', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {stats.agents.map(a => (
                                <tr key={a.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                                    <td style={{ padding: '12px 16px', color: '#1e293b', fontWeight: '500' }}>{a.name}</td>
                                    <td style={{ padding: '12px 16px' }}>
                                        {a.isActive
                                            ? <span style={{ color: '#16a34a', fontWeight: '600', fontSize: '13px' }}>● Active</span>
                                            : <span style={{ color: '#dc2626', fontWeight: '600', fontSize: '13px' }}>● Suspended</span>}
                                    </td>
                                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{a.assignedCount}</td>
                                    <td style={{ padding: '12px 16px', color: '#16a34a', fontWeight: '600' }}>{a.resolvedCount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Ticket List */}
            <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BarChart2 size={18} color="#6d28d9" /> Recent Tickets
                    </h2>
                    <input
                        placeholder="Search tickets..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', width: '240px', outline: 'none', color: '#1e293b' }}
                    />
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                            {['Ticket #', 'Customer', 'Product', 'Issue', 'Status', 'Agent', 'Created', ''].map(h => (
                                <th key={h} style={{ textAlign: 'left', padding: '10px 14px', color: '#64748b', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTickets.length === 0 ? (
                            <tr><td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>No tickets found</td></tr>
                        ) : filteredTickets.map(t => (
                            <tr key={t.id} style={{ borderBottom: '1px solid #f9fafb', cursor: 'pointer' }} onClick={() => openTicket(t)}>
                                <td style={{ padding: '12px 14px', color: '#6d28d9', fontWeight: '700' }}>{t.ticketNumber}</td>
                                <td style={{ padding: '12px 14px', color: '#1e293b' }}>{t.customerName}</td>
                                <td style={{ padding: '12px 14px', color: '#64748b' }}>{t.productName || '—'}</td>
                                <td style={{ padding: '12px 14px', color: '#64748b' }}>{t.issueType}</td>
                                <td style={{ padding: '12px 14px' }}><StatusBadge status={t.status} /></td>
                                <td style={{ padding: '12px 14px', color: '#64748b' }}>{t.agent?.name || '—'}</td>
                                <td style={{ padding: '12px 14px', color: '#94a3b8', fontSize: '12px' }}>{formatDate(t.createdAt)}</td>
                                <td style={{ padding: '12px 14px' }}><ChevronRight size={16} color="#cbd5e1" /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Ticket Detail Side Panel */}
            {selectedTicket && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }} onClick={() => { setSelectedTicket(null); setTicketDetail(null); }}>
                    <div style={{ width: '540px', height: '100%', background: '#fff', boxShadow: '-4px 0 30px rgba(0,0,0,0.15)', overflowY: 'auto', padding: '32px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '20px', color: '#1e293b', fontWeight: '700' }}>{selectedTicket.ticketNumber}</h2>
                                <StatusBadge status={selectedTicket.status} />
                            </div>
                            <button onClick={() => { setSelectedTicket(null); setTicketDetail(null); }} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: '#64748b' }}><X size={18} /></button>
                        </div>

                        {loadingDetail ? (
                            <div style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>Loading...</div>
                        ) : ticketDetail && (
                            <>
                                {/* Customer Info */}
                                <section style={{ background: '#f8fafc', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
                                    <h3 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer</h3>
                                    <p style={{ margin: '0 0 6px', color: '#1e293b', fontWeight: '600' }}>{ticketDetail.customerName}</p>
                                    <p style={{ margin: '0 0 4px', color: '#64748b', fontSize: '14px' }}>📧 {ticketDetail.customerEmail}</p>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>📞 {ticketDetail.customerPhone}</p>
                                </section>

                                {/* Product & Issue */}
                                <section style={{ background: '#f8fafc', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
                                    <h3 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Issue</h3>
                                    {ticketDetail.productName && <p style={{ margin: '0 0 6px', color: '#1e293b', fontWeight: '500' }}>Product: {ticketDetail.productName}</p>}
                                    <p style={{ margin: '0 0 6px', color: '#64748b', fontSize: '14px' }}>Type: <strong>{ticketDetail.issueType}</strong></p>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>{ticketDetail.description}</p>
                                </section>

                                {/* Agent */}
                                {ticketDetail.agent && (
                                    <section style={{ background: '#f3f0ff', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
                                        <h3 style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: '700', color: '#6d28d9', textTransform: 'uppercase' }}>Assigned Agent</h3>
                                        <p style={{ margin: 0, color: '#1e293b', fontWeight: '600' }}>{ticketDetail.agent.name} <span style={{ color: '#94a3b8', fontWeight: 'normal' }}>({ticketDetail.agent.email})</span></p>
                                    </section>
                                )}

                                {/* Images */}
                                {ticketDetail.images?.length > 0 && (
                                    <section style={{ marginBottom: '20px' }}>
                                        <h3 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Attachments ({ticketDetail.images.length})</h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                            {ticketDetail.images.map(img => (
                                                <a key={img.id} href={`/images/ticket-media/${img.imageUrl}`} target="_blank" rel="noreferrer">
                                                    <img src={`/images/ticket-media/${img.imageUrl}`} alt="Ticket attachment" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                                                </a>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Remarks */}
                                {ticketDetail.remarks?.length > 0 && (
                                    <section style={{ marginBottom: '20px' }}>
                                        <h3 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Internal Remarks ({ticketDetail.remarks.length})</h3>
                                        {ticketDetail.remarks.map(r => (
                                            <div key={r.id} style={{ background: '#fafafa', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px', marginBottom: '8px' }}>
                                                <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: '600', color: '#6d28d9' }}>{r.agent?.name}</p>
                                                <p style={{ margin: '0 0 6px', color: '#1e293b', fontSize: '14px', lineHeight: '1.6' }}>{r.message}</p>
                                                <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px' }}>{formatDate(r.createdAt)}</p>
                                            </div>
                                        ))}
                                    </section>
                                )}

                                {/* Activity Timeline */}
                                {ticketDetail.activities?.length > 0 && (
                                    <section>
                                        <h3 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Activity Timeline</h3>
                                        <div style={{ position: 'relative', paddingLeft: '20px' }}>
                                            {ticketDetail.activities.map((act, i) => (
                                                <div key={act.id} style={{ position: 'relative', paddingBottom: i < ticketDetail.activities.length - 1 ? '16px' : 0 }}>
                                                    <div style={{ position: 'absolute', left: '-20px', top: '4px', width: '8px', height: '8px', borderRadius: '50%', background: '#6d28d9', border: '2px solid #e9d5ff' }} />
                                                    {i < ticketDetail.activities.length - 1 && (
                                                        <div style={{ position: 'absolute', left: '-17px', top: '12px', bottom: 0, width: '2px', background: '#e9d5ff' }} />
                                                    )}
                                                    <p style={{ margin: '0 0 2px', color: '#1e293b', fontSize: '13px' }}>{act.detail || act.action}</p>
                                                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '11px' }}>{formatDate(act.createdAt)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketOverview;
