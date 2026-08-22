import React, { useState, useEffect } from 'react';
import { UserPlus, Edit2, Trash2, ToggleLeft, ToggleRight, KeyRound, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import api from '../../api/axios';

const roleLabels = { agent: 'Agent', senior_agent: 'Senior Agent' };

const AgentList = () => {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editAgent, setEditAgent] = useState(null);
    const [resetModal, setResetModal] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'agent' });
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState('');

    const fetchAgents = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/agents');
            setAgents(res.data.data || []);
        } catch {
            setError('Failed to load agents.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAgents(); }, []);

    const flash = (msg) => { setFeedback(msg); setTimeout(() => setFeedback(''), 3000); };

    const handleToggle = async (agent) => {
        try {
            await api.patch(`/admin/agents/${agent.id}/toggle-status`);
            flash(`${agent.name} ${agent.isActive ? 'suspended' : 'activated'} successfully`);
            fetchAgents();
        } catch {
            flash('Failed to update agent status');
        }
    };

    const handleDelete = async (agent) => {
        if (!window.confirm(`Delete agent "${agent.name}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/admin/agents/${agent.id}`);
            flash(`Agent ${agent.name} deleted`);
            fetchAgents();
        } catch {
            flash('Failed to delete agent');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editAgent) {
                await api.put(`/admin/agents/${editAgent.id}`, { name: formData.name, email: formData.email, role: formData.role });
                flash('Agent updated successfully');
            } else {
                await api.post('/admin/agents', formData);
                flash('Agent created successfully');
            }
            setShowForm(false);
            setEditAgent(null);
            setFormData({ name: '', email: '', password: '', role: 'agent' });
            fetchAgents();
        } catch (err) {
            flash(err.response?.data?.message || 'Failed to save agent');
        } finally {
            setSubmitting(false);
        }
    };

    const handleResetPassword = async () => {
        if (!newPassword || newPassword.length < 8) { flash('Password must be at least 8 characters'); return; }
        try {
            await api.patch(`/admin/agents/${resetModal.id}/reset-password`, { newPassword });
            flash(`Password reset for ${resetModal.name}`);
            setResetModal(null);
            setNewPassword('');
        } catch {
            flash('Failed to reset password');
        }
    };

    const openEdit = (agent) => {
        setEditAgent(agent);
        setFormData({ name: agent.name, email: agent.email, password: '', role: agent.role });
        setShowForm(true);
    };

    const closeForm = () => { setShowForm(false); setEditAgent(null); setFormData({ name: '', email: '', password: '', role: 'agent' }); };

    const cardStyle = { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #f3f4f6' };
    const btnStyle = (bg, color) => ({ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: bg, color, border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' });
    const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#1e293b' };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>Agent Management</h1>
                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>Create and manage ClaimDesk agent accounts</p>
                </div>
                <button style={btnStyle('#6d28d9', '#fff')} onClick={() => { closeForm(); setShowForm(true); }}>
                    <UserPlus size={16} /> New Agent
                </button>
            </div>

            {/* Feedback */}
            {feedback && (
                <div style={{ background: '#f0fdf4', border: '1px solid #86efac', color: '#166534', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                    {feedback}
                </div>
            )}

            {/* Create/Edit Form */}
            {showForm && (
                <div style={{ ...cardStyle, marginBottom: '24px', borderLeft: '4px solid #6d28d9' }}>
                    <h2 style={{ margin: '0 0 20px', fontSize: '18px', color: '#1e293b' }}>{editAgent ? 'Edit Agent' : 'Create New Agent'}</h2>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Full Name *</label>
                                <input style={inputStyle} value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} required placeholder="Agent Name" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Email *</label>
                                <input style={inputStyle} type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} required placeholder="agent@company.com" />
                            </div>
                            {!editAgent && (
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Password *</label>
                                    <input style={inputStyle} type="password" value={formData.password} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))} required placeholder="Min 8 characters" minLength={8} />
                                </div>
                            )}
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Role</label>
                                <select style={inputStyle} value={formData.role} onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}>
                                    <option value="agent">Agent</option>
                                    <option value="senior_agent">Senior Agent</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button type="submit" style={btnStyle('#6d28d9', '#fff')} disabled={submitting}>
                                {submitting ? 'Saving...' : editAgent ? 'Update Agent' : 'Create Agent'}
                            </button>
                            <button type="button" style={btnStyle('#f1f5f9', '#64748b')} onClick={closeForm}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Reset Password Modal */}
            {resetModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#fff', borderRadius: '12px', padding: '32px', width: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: '#1e293b' }}>Reset Password</h3>
                        <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: '14px' }}>Set a new password for <strong>{resetModal.name}</strong></p>
                        <input style={{ ...inputStyle, marginBottom: '16px' }} type="password" placeholder="New password (min 8 chars)" value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength={8} />
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button style={btnStyle('#6d28d9', '#fff')} onClick={handleResetPassword}>Reset Password</button>
                            <button style={btnStyle('#f1f5f9', '#64748b')} onClick={() => { setResetModal(null); setNewPassword(''); }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Agent Table */}
            <div style={cardStyle}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>Loading agents...</div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '48px', color: '#dc2626' }}>{error}</div>
                ) : agents.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
                        <UserPlus size={48} color="#d1d5db" style={{ marginBottom: '12px' }} />
                        <p>No agents yet. Create the first one above.</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                                {['Name', 'Email', 'Role', 'Tickets', 'Status', 'Actions'].map(h => (
                                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: '#64748b', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {agents.map(agent => (
                                <tr key={agent.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                                    <td style={{ padding: '14px 16px', color: '#1e293b', fontWeight: '500' }}>{agent.name}</td>
                                    <td style={{ padding: '14px 16px', color: '#64748b' }}>{agent.email}</td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <span style={{ background: '#f3f0ff', color: '#6d28d9', padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '600' }}>
                                            {roleLabels[agent.role] || agent.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '14px 16px', color: '#64748b' }}>{agent._count?.tickets || 0} assigned</td>
                                    <td style={{ padding: '14px 16px' }}>
                                        {agent.isActive ? (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontWeight: '600', fontSize: '13px' }}>
                                                <CheckCircle size={14} /> Active
                                            </span>
                                        ) : (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontWeight: '600', fontSize: '13px' }}>
                                                <XCircle size={14} /> Suspended
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button title="Edit" onClick={() => openEdit(agent)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '6px', padding: '6px 8px', cursor: 'pointer', color: '#6d28d9' }}><Edit2 size={14} /></button>
                                            <button title={agent.isActive ? 'Suspend' : 'Activate'} onClick={() => handleToggle(agent)} style={{ background: agent.isActive ? '#fff7ed' : '#f0fdf4', border: 'none', borderRadius: '6px', padding: '6px 8px', cursor: 'pointer', color: agent.isActive ? '#ea580c' : '#16a34a' }}>
                                                {agent.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                                            </button>
                                            <button title="Reset Password" onClick={() => setResetModal(agent)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '6px', padding: '6px 8px', cursor: 'pointer', color: '#0ea5e9' }}><KeyRound size={14} /></button>
                                            <button title="Delete" onClick={() => handleDelete(agent)} style={{ background: '#fef2f2', border: 'none', borderRadius: '6px', padding: '6px 8px', cursor: 'pointer', color: '#dc2626' }}><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                <button style={{ ...btnStyle('#f1f5f9', '#64748b'), fontSize: '12px' }} onClick={fetchAgents}><RefreshCw size={13} /> Refresh</button>
            </div>
        </div>
    );
};

export default AgentList;
