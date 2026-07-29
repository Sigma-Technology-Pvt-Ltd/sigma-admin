import React, { useState } from 'react';
import api from '../api/axios';

const SECTIONS = [
    { key: 'products', label: 'Products', icon: '📦' },
    { key: 'blogs', label: 'Blogs', icon: '📝' },
    { key: 'careers', label: 'Careers', icon: '💼' },
    { key: 'categories', label: 'Categories', icon: '🗂️' },
    { key: 'blogCategories', label: 'Blog Categories', icon: '📂' },
    { key: 'banners', label: 'Banners', icon: '🖼️' },
    { key: 'testimonials', label: 'Testimonials', icon: '💬' },
    { key: 'faqs', label: 'FAQs', icon: '❓' },
];

const CleanupPage = () => {
    const [keyword, setKeyword] = useState('');
    const [afterDate, setAfterDate] = useState('');
    const [results, setResults] = useState(null);
    const [selected, setSelected] = useState({});
    const [searching, setSearching] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const totalFound = results
        ? Object.values(results).reduce((sum, arr) => sum + arr.length, 0)
        : 0;

    const totalSelected = Object.values(selected).reduce((sum, ids) => sum + ids.length, 0);

    const handleSearch = async () => {
        if (!keyword.trim() && !afterDate) {
            setErrorMsg('Please enter a keyword or select a date.');
            return;
        }
        setErrorMsg('');
        setSuccessMsg('');
        setSearching(true);
        setResults(null);
        setSelected({});
        try {
            const res = await api.post('/admin/cleanup/search', {
                keyword: keyword.trim() || undefined,
                afterDate: afterDate || undefined,
            });
            setResults(res.data.data);
        } catch (err) {
            setErrorMsg('Search failed. Please try again.');
        } finally {
            setSearching(false);
        }
    };

    const toggleItem = (type, id) => {
        setSelected(prev => {
            const current = prev[type] || [];
            const isSelected = current.includes(id);
            return {
                ...prev,
                [type]: isSelected ? current.filter(i => i !== id) : [...current, id],
            };
        });
    };

    const toggleAll = (type, ids) => {
        setSelected(prev => {
            const current = prev[type] || [];
            const allSelected = ids.every(id => current.includes(id));
            return { ...prev, [type]: allSelected ? [] : [...ids] };
        });
    };

    const selectAll = () => {
        const allSelected = {};
        SECTIONS.forEach(s => {
            if (results?.[s.key]?.length) {
                allSelected[s.key] = results[s.key].map(r => r.id);
            }
        });
        setSelected(allSelected);
    };

    const deselectAll = () => setSelected({});

    const handleDelete = async () => {
        if (totalSelected === 0) {
            setErrorMsg('Please select at least one record to delete.');
            return;
        }
        if (!window.confirm(`⚠️ You are about to permanently delete ${totalSelected} records. This CANNOT be undone. Are you sure?`)) {
            return;
        }
        setDeleting(true);
        setErrorMsg('');
        try {
            const res = await api.post('/admin/cleanup/delete', { selections: selected });
            setSuccessMsg(`✅ Successfully deleted ${Object.values(res.data.deleted || {}).reduce((a, b) => a + b, 0)} records!`);
            setResults(null);
            setSelected({});
            setKeyword('');
            setAfterDate('');
        } catch (err) {
            setErrorMsg('Delete failed. Please try again.');
        } finally {
            setDeleting(false);
        }
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1f2937', margin: '0 0 8px' }}>🧹 Data Cleanup Tool</h1>
                <p style={{ color: '#6b7280', margin: 0 }}>Search and delete test or unwanted data across all sections. Preview records before deleting.</p>
            </div>

            {/* Search Filters */}
            <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '28px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937', marginBottom: '20px' }}>🔍 Filter Records</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontWeight: '600', fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
                            Keyword in Title/Name
                        </label>
                        <input
                            type="text"
                            value={keyword}
                            onChange={e => setKeyword(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            placeholder='e.g. "test", "demo", "sample"'
                            style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontWeight: '600', fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
                            Created After Date
                        </label>
                        <input
                            type="date"
                            value={afterDate}
                            onChange={e => setAfterDate(e.target.value)}
                            style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                        />
                    </div>
                </div>
                <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                    <button
                        onClick={handleSearch}
                        disabled={searching}
                        style={{ padding: '10px 28px', backgroundColor: '#6d28d9', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', opacity: searching ? 0.7 : 1 }}
                    >
                        {searching ? '🔍 Searching...' : '🔍 Search Records'}
                    </button>
                    <button
                        onClick={() => { setKeyword(''); setAfterDate(''); setResults(null); setSelected({}); setErrorMsg(''); setSuccessMsg(''); }}
                        style={{ padding: '10px 20px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
                    >
                        Reset
                    </button>
                </div>
                {errorMsg && <p style={{ marginTop: '12px', color: '#dc2626', fontWeight: '600', fontSize: '14px' }}>{errorMsg}</p>}
                {successMsg && <p style={{ marginTop: '12px', color: '#16a34a', fontWeight: '700', fontSize: '14px' }}>{successMsg}</p>}
            </div>

            {/* Results */}
            {results && (
                <div>
                    {/* Summary Bar */}
                    <div style={{ backgroundColor: totalFound > 0 ? '#fef3c7' : '#f0fdf4', border: `1px solid ${totalFound > 0 ? '#fbbf24' : '#86efac'}`, borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                            <span style={{ fontWeight: '700', color: '#1f2937' }}>Found {totalFound} records</span>
                            {totalSelected > 0 && <span style={{ marginLeft: '16px', color: '#dc2626', fontWeight: '700' }}>{totalSelected} selected for deletion</span>}
                        </div>
                        {totalFound > 0 && (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={selectAll} style={{ padding: '6px 14px', backgroundColor: '#6d28d9', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Select All</button>
                                <button onClick={deselectAll} style={{ padding: '6px 14px', backgroundColor: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Deselect All</button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting || totalSelected === 0}
                                    style={{ padding: '6px 20px', backgroundColor: totalSelected === 0 ? '#fca5a5' : '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: totalSelected === 0 ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '700', opacity: deleting ? 0.7 : 1 }}
                                >
                                    {deleting ? 'Deleting...' : `🗑️ Delete ${totalSelected} Selected`}
                                </button>
                            </div>
                        )}
                    </div>

                    {totalFound === 0 && (
                        <div style={{ textAlign: 'center', padding: '48px', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
                            <p style={{ color: '#6b7280', fontWeight: '600' }}>No matching records found. Database looks clean!</p>
                        </div>
                    )}

                    {/* Section Tables */}
                    {SECTIONS.map(section => {
                        const rows = results[section.key] || [];
                        if (!rows.length) return null;
                        const sectionSelectedIds = selected[section.key] || [];
                        const allSectionSelected = rows.every(r => sectionSelectedIds.includes(r.id));

                        return (
                            <div key={section.key} style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', marginBottom: '16px', overflow: 'hidden' }}>
                                {/* Section Header */}
                                <div style={{ padding: '14px 20px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#1f2937' }}>
                                        {section.icon} {section.label} <span style={{ color: '#6d28d9', backgroundColor: '#f3f0ff', padding: '2px 8px', borderRadius: '12px', fontSize: '13px' }}>{rows.length}</span>
                                    </h3>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6b7280', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={allSectionSelected}
                                            onChange={() => toggleAll(section.key, rows.map(r => r.id))}
                                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                        />
                                        Select All in {section.label}
                                    </label>
                                </div>

                                {/* Table */}
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f3f4f6' }}>
                                            <th style={{ padding: '10px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6b7280', width: '40px' }}></th>
                                            <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6b7280', width: '60px' }}>ID</th>
                                            <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6b7280' }}>Title / Name</th>
                                            <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6b7280', width: '140px' }}>Created Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((row, idx) => {
                                            const isRowSelected = sectionSelectedIds.includes(row.id);
                                            return (
                                                <tr
                                                    key={row.id}
                                                    onClick={() => toggleItem(section.key, row.id)}
                                                    style={{ backgroundColor: isRowSelected ? '#fef3c7' : idx % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', transition: 'background 0.15s' }}
                                                >
                                                    <td style={{ padding: '12px 20px' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={isRowSelected}
                                                            onChange={() => toggleItem(section.key, row.id)}
                                                            onClick={e => e.stopPropagation()}
                                                            style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#dc2626' }}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '12px', fontSize: '14px', color: '#9ca3af', fontFamily: 'monospace' }}>#{row.id}</td>
                                                    <td style={{ padding: '12px', fontSize: '14px', color: '#1f2937', fontWeight: isRowSelected ? '600' : '400' }}>{row.displayTitle || '(no title)'}</td>
                                                    <td style={{ padding: '12px', fontSize: '13px', color: '#6b7280' }}>{formatDate(row.createdAt)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })}

                    {/* Bottom Delete Button */}
                    {totalSelected > 0 && (
                        <div style={{ position: 'sticky', bottom: '20px', backgroundColor: '#dc2626', borderRadius: '12px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 8px 30px rgba(220,38,38,0.4)' }}>
                            <span style={{ color: '#fff', fontWeight: '700', fontSize: '16px' }}>⚠️ {totalSelected} records selected for permanent deletion</span>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                style={{ padding: '10px 28px', backgroundColor: '#fff', color: '#dc2626', border: 'none', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', fontSize: '15px' }}
                            >
                                {deleting ? 'Deleting...' : '🗑️ Confirm Delete'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CleanupPage;
