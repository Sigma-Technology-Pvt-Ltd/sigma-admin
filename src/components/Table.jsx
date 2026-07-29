import React, { useState, useEffect } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Table = ({ columns, data, onEdit, onDelete, editUrlPattern, itemsPerPage = 10 }) => {
    const [currentPage, setCurrentPage] = useState(1);

    // Reset to page 1 if data length changes drastically (e.g. searching/filtering)
    useEffect(() => {
        setCurrentPage(1);
    }, [data.length]);

    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                    <tr>
                        {columns.map((col, index) => (
                            <th key={index} style={{ padding: '16px 20px', color: '#6b7280', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {col.header}
                            </th>
                        ))}
                        <th style={{ padding: '16px 20px', color: '#6b7280', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedData.map((row, rowIndex) => (
                        <tr key={rowIndex} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background-color 0.2s', ':hover': { backgroundColor: '#f9fafb' } }}>
                            {columns.map((col, colIndex) => (
                                <td key={colIndex} style={{ padding: '16px 20px', color: '#4b5563', fontSize: '14px' }}>
                                    {col.render ? col.render(row) : row[col.accessor]}
                                </td>
                            ))}
                            <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                    {editUrlPattern ? (
                                        <Link 
                                            to={editUrlPattern(row)}
                                            style={{ padding: '6px', color: '#3b82f6', backgroundColor: '#eff6ff', borderRadius: '4px', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                                        >
                                            <Edit2 size={16} />
                                        </Link>
                                    ) : (
                                        <button 
                                            onClick={() => onEdit && onEdit(row)}
                                            style={{ padding: '6px', color: '#3b82f6', backgroundColor: '#eff6ff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => onDelete && onDelete(row)}
                                        style={{ padding: '6px', color: '#ef4444', backgroundColor: '#fef2f2', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan={columns.length + 1} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                                No records found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            
            {totalPages > 1 && (
                <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f3f4f6' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>
                        Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, data.length)} of {data.length} entries
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            style={{ padding: '8px 16px', border: '1px solid #e5e7eb', backgroundColor: currentPage === 1 ? '#f9fafb' : 'white', borderRadius: '8px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: currentPage === 1 ? '#9ca3af' : '#4b5563', fontSize: '14px', fontWeight: '500' }}
                        >
                            Previous
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px', color: '#4b5563', fontSize: '14px', fontWeight: '500' }}>
                            Page {currentPage} of {totalPages}
                        </div>
                        <button 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            style={{ padding: '8px 16px', border: '1px solid #e5e7eb', backgroundColor: currentPage === totalPages ? '#f9fafb' : 'white', borderRadius: '8px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', color: currentPage === totalPages ? '#9ca3af' : '#4b5563', fontSize: '14px', fontWeight: '500' }}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Table;
