import React, { useEffect, useState, useRef } from 'react';
import SectionTabs from '../../components/SectionTabs';
import { useOutletContext } from 'react-router-dom';
import { ArrowUp, ArrowDown, ChevronsUp, ChevronsDown, ArrowUpDown, Save, Check, RotateCcw, Filter, GripVertical, LayoutGrid, List } from 'lucide-react';
import api from '../../api/axios';
import Table from '../../components/Table';
import Loader from '../../components/Loader';
import { IMG } from '../../api/constants';

const ProductList = () => {
    const { searchQuery } = useOutletContext() || {};
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Category filter & Reorder mode state
    const [selectedCategoryId, setSelectedCategoryId] = useState('all');
    const [reorderMode, setReorderMode] = useState(false);
    const [reorderViewMode, setReorderViewMode] = useState('grid'); // Default: Grid View
    const [reorderList, setReorderList] = useState([]);
    const [savingOrder, setSavingOrder] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Drag and Drop refs (Zero re-renders during drag ensures butter-smooth browser drag)
    const dragItem = useRef(null);
    const dragOverItem = useRef(null);

    const fetchData = async () => {
        try {
            const [prodRes, catRes] = await Promise.all([
                api.get('/admin/products'),
                api.get('/admin/categories')
            ]);
            setProducts(prodRes.data.data);
            setCategories(catRes.data.data);
        } catch (error) {
            console.error('Failed to fetch products or categories', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (row) => {
        if (window.confirm(`Are you sure you want to delete "${row.title}"?`)) {
            try {
                await api.delete(`/admin/products/${row.id}`);
                fetchData();
            } catch (error) {
                alert('Failed to delete product');
            }
        }
    };

    // Filter products by search query and category
    const filteredProducts = products.filter((p) => {
        // Category filter
        if (selectedCategoryId !== 'all' && Number(p.categoryId) !== Number(selectedCategoryId)) {
            return false;
        }

        // Search filter
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase().trim();
        const cat = categories.find((c) => Number(c.id) === Number(p.categoryId));
        return (
            p.title?.toLowerCase().includes(query) ||
            p.id?.toString().includes(query) ||
            (cat && cat.title?.toLowerCase().includes(query))
        );
    });

    // Enter reorder mode: initialize reorder list for current category or all products
    const handleStartReorder = (catId = selectedCategoryId) => {
        const targetCatId = catId;

        const items = products
            .filter(p => targetCatId === 'all' ? true : Number(p.categoryId) === Number(targetCatId))
            .sort((a, b) => {
                const orderA = a.order !== undefined && a.order !== null ? a.order : 0;
                const orderB = b.order !== undefined && b.order !== null ? b.order : 0;
                if (orderA !== orderB) return orderA - orderB;
                return Number(a.id) - Number(b.id);
            })
            .map((p, idx) => ({
                ...p,
                order: p.order !== undefined && p.order !== null && p.order !== 0 ? p.order : (idx + 1)
            }));

        setReorderList(items);
        setReorderMode(true);
        setSaveSuccess(false);
    };

    const handleCategoryChangeInReorder = (newCatId) => {
        setSelectedCategoryId(newCatId);
        const items = products
            .filter(p => newCatId === 'all' ? true : Number(p.categoryId) === Number(newCatId))
            .sort((a, b) => {
                const orderA = a.order !== undefined && a.order !== null ? a.order : 0;
                const orderB = b.order !== undefined && b.order !== null ? b.order : 0;
                if (orderA !== orderB) return orderA - orderB;
                return Number(a.id) - Number(b.id);
            })
            .map((p, idx) => ({
                ...p,
                order: p.order !== undefined && p.order !== null && p.order !== 0 ? p.order : (idx + 1)
            }));
        setReorderList(items);
        setSaveSuccess(false);
    };

    // Move item up / down in reorder list
    const moveItem = (index, direction) => {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= reorderList.length) return;

        const updated = [...reorderList];
        const [moved] = updated.splice(index, 1);
        updated.splice(targetIndex, 0, moved);

        // Auto-reassign consecutive order numbers based on new position
        const reindexed = updated.map((item, idx) => ({
            ...item,
            order: idx + 1
        }));

        setReorderList(reindexed);
        setSaveSuccess(false);
    };

    // Move directly to top or bottom
    const moveToExtreme = (index, toTop = true) => {
        if (toTop && index === 0) return;
        if (!toTop && index === reorderList.length - 1) return;

        const updated = [...reorderList];
        const [moved] = updated.splice(index, 1);
        if (toTop) {
            updated.unshift(moved);
        } else {
            updated.push(moved);
        }

        const reindexed = updated.map((item, idx) => ({
            ...item,
            order: idx + 1
        }));

        setReorderList(reindexed);
        setSaveSuccess(false);
    };

    // Manual order change in input field
    const handleOrderInputChange = (id, newOrder) => {
        setReorderList(prev => prev.map(p => {
            if (p.id === id) {
                return { ...p, order: newOrder === '' ? '' : parseInt(newOrder) || 0 };
            }
            return p;
        }));
        setSaveSuccess(false);
    };

    // Auto sequence button (1, 2, 3...)
    const autoSequence = () => {
        setReorderList(prev => prev.map((p, idx) => ({
            ...p,
            order: idx + 1
        })));
        setSaveSuccess(false);
    };

    // ── Drag and Drop handlers (Ref-based for rock-solid stability) ──
    const handleDragStart = (e, index) => {
        dragItem.current = index;
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnter = (e, index) => {
        dragOverItem.current = index;
    };

    const handleDragEnd = () => {
        if (
            dragItem.current === null || 
            dragOverItem.current === null || 
            dragItem.current === dragOverItem.current
        ) {
            dragItem.current = null;
            dragOverItem.current = null;
            return;
        }

        const updated = [...reorderList];
        const [moved] = updated.splice(dragItem.current, 1);
        updated.splice(dragOverItem.current, 0, moved);

        const reindexed = updated.map((item, idx) => ({
            ...item,
            order: idx + 1
        }));

        setReorderList(reindexed);
        dragItem.current = null;
        dragOverItem.current = null;
        setSaveSuccess(false);
    };

    // Save reordered list to backend
    const handleSaveOrder = async () => {
        setSavingOrder(true);
        try {
            const items = reorderList.map((item, idx) => ({
                id: item.id,
                order: item.order !== '' && item.order !== undefined ? Number(item.order) : (idx + 1)
            }));

            await api.put('/admin/products/reorder', { items });
            setSaveSuccess(true);
            await fetchData();
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error('Failed to save product order', error);
            alert('Failed to save product order. Please try again.');
        } finally {
            setSavingOrder(false);
        }
    };

    const columns = [
        { 
            header: 'Order', 
            accessor: 'order',
            render: (row) => (
                <span style={{ 
                    display: 'inline-block',
                    padding: '3px 8px', 
                    backgroundColor: '#f1f5f9', 
                    color: '#334155', 
                    borderRadius: '6px', 
                    fontSize: '12px', 
                    fontWeight: '700',
                    border: '1px solid #e2e8f0'
                }}>
                    #{row.order ?? 0}
                </span>
            )
        },
        { header: 'ID', accessor: 'id' },
        { 
            header: 'Image', 
            accessor: 'image',
            render: (row) => row.image ? (
                <img src={`${IMG.products}/${row.image}`} alt={row.title} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
            ) : (
                <div style={{ width: '40px', height: '40px', backgroundColor: '#e5e7eb', borderRadius: '4px' }}></div>
            )
        },
        { header: 'Title', accessor: 'title' },
        { 
            header: 'Category', 
            accessor: 'categoryId',
            render: (row) => {
                const cat = categories.find(c => Number(c.id) === Number(row.categoryId));
                return cat ? cat.title : '-';
            }
        },
        { 
            header: 'Status', 
            accessor: 'status',
            render: (row) => row.status === 1 ? (
                <span style={{ padding: '4px 8px', backgroundColor: '#dcfce3', color: '#166534', borderRadius: '9999px', fontSize: '12px', fontWeight: 'bold' }}>Active</span>
            ) : (
                <span style={{ padding: '4px 8px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '9999px', fontSize: '12px', fontWeight: 'bold' }}>Inactive</span>
            )
        }
    ];

    const currentCatObj = categories.find(c => Number(c.id) === Number(selectedCategoryId));

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                <SectionTabs createPath="/dashboard/products/new" listPath="/dashboard/products" entityName="Product" />

                {/* Controls: Category Filter + Reorder Toggle Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '6px 12px' }}>
                        <Filter size={16} color="#6b7280" />
                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Category:</label>
                        <select
                            value={selectedCategoryId}
                            onChange={(e) => {
                                const newCat = e.target.value;
                                if (reorderMode) {
                                    handleCategoryChangeInReorder(newCat);
                                } else {
                                    setSelectedCategoryId(newCat);
                                }
                            }}
                            style={{ border: 'none', background: 'transparent', fontSize: '13px', fontWeight: '500', color: '#1f2937', outline: 'none', cursor: 'pointer' }}
                        >
                            <option value="all">All Categories ({products.length})</option>
                            {categories.map((c) => {
                                const count = products.filter(p => Number(p.categoryId) === Number(c.id)).length;
                                return (
                                    <option key={c.id} value={c.id}>
                                        {c.title} ({count})
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    {!reorderMode ? (
                        <button
                            type="button"
                            onClick={() => handleStartReorder()}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 16px',
                                backgroundColor: '#2563eb',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}
                        >
                            <ArrowUpDown size={15} />
                            Rearrange Products Order
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => {
                                setReorderMode(false);
                                fetchData();
                            }}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#f3f4f6',
                                color: '#374151',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            ✕ Exit Reorder Mode
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <Loader size="large" />
            ) : reorderMode ? (
                /* ── REORDER MODE VIEW ── */
                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    {/* Header Banner */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid #f3f4f6', marginBottom: '20px' }}>
                        <div>
                            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <ArrowUpDown size={20} color="#2563eb" />
                                Rearrange Order: {selectedCategoryId === 'all' ? `All Products (${reorderList.length})` : (currentCatObj ? `${currentCatObj.title} (${reorderList.length})` : 'Category')}
                            </h2>
                            <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0' }}>
                                Lower numbers appear first on the website. Use Move Up/Down buttons or enter order numbers directly, then click <strong>Save Arrangement</strong>.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {/* Grid / List Toggle */}
                            <div style={{ display: 'flex', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
                                <button
                                    type="button"
                                    onClick={() => setReorderViewMode('grid')}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '7px 12px',
                                        backgroundColor: reorderViewMode === 'grid' ? '#2563eb' : '#ffffff',
                                        color: reorderViewMode === 'grid' ? '#ffffff' : '#475569',
                                        border: 'none',
                                        fontSize: '12px',
                                        fontWeight: '700',
                                        cursor: 'pointer'
                                    }}
                                    title="Grid View (Storefront Cards)"
                                >
                                    <LayoutGrid size={15} />
                                    Grid
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setReorderViewMode('list')}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '7px 12px',
                                        backgroundColor: reorderViewMode === 'list' ? '#2563eb' : '#ffffff',
                                        color: reorderViewMode === 'list' ? '#ffffff' : '#475569',
                                        border: 'none',
                                        fontSize: '12px',
                                        fontWeight: '700',
                                        cursor: 'pointer'
                                    }}
                                    title="List View (Compact Rows)"
                                >
                                    <List size={15} />
                                    List
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={autoSequence}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 14px',
                                    backgroundColor: '#f8fafc',
                                    color: '#475569',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                                title="Renumber all items 1, 2, 3... from top to bottom"
                            >
                                <RotateCcw size={14} />
                                Auto-Number (1, 2, 3...)
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveOrder}
                                disabled={savingOrder || reorderList.length === 0}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 18px',
                                    backgroundColor: saveSuccess ? '#16a34a' : '#2563eb',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: '700',
                                    cursor: savingOrder || reorderList.length === 0 ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 2px 4px rgba(37,99,235,0.2)',
                                    transition: 'background-color 0.2s'
                                }}
                            >
                                {saveSuccess ? <Check size={16} /> : <Save size={16} />}
                                {savingOrder ? 'Saving...' : saveSuccess ? 'Saved to Website!' : 'Save Arrangement'}
                            </button>
                        </div>
                    </div>

                    {/* Product Reorder Grid or List */}
                    {reorderList.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px 20px', color: '#6b7280' }}>
                            <p style={{ fontSize: '15px', fontWeight: '500' }}>No products found in this category.</p>
                            <p style={{ fontSize: '13px', marginTop: '4px' }}>Please select another category above.</p>
                        </div>
                    ) : reorderViewMode === 'grid' ? (
                        /* ── GRID VIEW (CARDS) ── */
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                            gap: '16px'
                        }}>
                            {reorderList.map((item, index) => (
                                <div
                                    key={item.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragEnter={(e) => handleDragEnter(e, index)}
                                    onDragEnd={handleDragEnd}
                                    onDragOver={(e) => e.preventDefault()}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        cursor: 'grab',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                                        userSelect: 'none',
                                        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                                    }}
                                >
                                    {/* Card Top: Image + Badges */}
                                    <div style={{
                                        position: 'relative',
                                        width: '100%',
                                        height: '150px',
                                        backgroundColor: '#f8fafc',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderBottom: '1px solid #f1f5f9'
                                    }}>
                                        {/* Rank Badge */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '8px',
                                            left: '8px',
                                            backgroundColor: '#2563eb',
                                            color: '#ffffff',
                                            borderRadius: '6px',
                                            padding: '2px 8px',
                                            fontSize: '13px',
                                            fontWeight: '800',
                                            boxShadow: '0 2px 4px rgba(37,99,235,0.35)',
                                            zIndex: 2
                                        }}>
                                            #{index + 1}
                                        </div>

                                        {/* Drag Handle */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '8px',
                                            right: '8px',
                                            backgroundColor: 'rgba(255,255,255,0.95)',
                                            borderRadius: '6px',
                                            padding: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            color: '#64748b',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                                            zIndex: 2
                                        }} title="Drag card to reorder">
                                            <GripVertical size={16} />
                                        </div>

                                        {item.image ? (
                                            <img
                                                src={`${IMG.products}/${item.image}`}
                                                alt={item.title}
                                                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '12px' }}
                                            />
                                        ) : (
                                            <div style={{ color: '#94a3b8', fontSize: '12px' }}>No Image</div>
                                        )}
                                    </div>

                                    {/* Card Info */}
                                    <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                        <div>
                                            <div
                                                style={{
                                                    fontSize: '13px',
                                                    fontWeight: '700',
                                                    color: '#1e293b',
                                                    lineHeight: '1.35',
                                                    marginBottom: '6px',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    minHeight: '35px'
                                                }}
                                                title={item.title}
                                            >
                                                {item.title}
                                            </div>

                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                                                <span style={{ backgroundColor: '#e0e7ff', color: '#3730a3', padding: '1px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '600' }}>
                                                    {categories.find(c => Number(c.id) === Number(item.categoryId))?.title || 'Category'}
                                                </span>
                                                {item.status === 1 ? (
                                                    <span style={{ color: '#16a34a', backgroundColor: '#dcfce7', padding: '1px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '600' }}>Active</span>
                                                ) : (
                                                    <span style={{ color: '#dc2626', backgroundColor: '#fee2e2', padding: '1px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '600' }}>Inactive</span>
                                                )}
                                                {item.type && <span style={{ color: '#d97706', backgroundColor: '#fef3c7', padding: '1px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '600' }}>{item.type}</span>}
                                            </div>
                                        </div>

                                        {/* Card Bottom: Order input & Step controls */}
                                        <div style={{ paddingTop: '8px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>#</label>
                                                <input
                                                    type="number"
                                                    value={item.order}
                                                    onChange={(e) => handleOrderInputChange(item.id, e.target.value)}
                                                    style={{
                                                        width: '46px',
                                                        padding: '4px',
                                                        textAlign: 'center',
                                                        fontSize: '12px',
                                                        fontWeight: '700',
                                                        color: '#1e293b',
                                                        border: '1px solid #cbd5e1',
                                                        borderRadius: '4px',
                                                        backgroundColor: '#ffffff'
                                                    }}
                                                />
                                            </div>

                                            <div style={{ display: 'flex', gap: '3px' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => moveItem(index, -1)}
                                                    disabled={index === 0}
                                                    title="Move earlier"
                                                    style={{
                                                        padding: '4px 8px',
                                                        backgroundColor: index === 0 ? '#f1f5f9' : '#ffffff',
                                                        color: index === 0 ? '#cbd5e1' : '#1e293b',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '4px',
                                                        cursor: index === 0 ? 'not-allowed' : 'pointer'
                                                    }}
                                                >
                                                    <ArrowUp size={13} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => moveItem(index, 1)}
                                                    disabled={index === reorderList.length - 1}
                                                    title="Move later"
                                                    style={{
                                                        padding: '4px 8px',
                                                        backgroundColor: index === reorderList.length - 1 ? '#f1f5f9' : '#ffffff',
                                                        color: index === reorderList.length - 1 ? '#cbd5e1' : '#1e293b',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '4px',
                                                        cursor: index === reorderList.length - 1 ? 'not-allowed' : 'pointer'
                                                    }}
                                                >
                                                    <ArrowDown size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* ── LIST VIEW (COMPACT ROWS) ── */
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {reorderList.map((item, index) => (
                                <div
                                    key={item.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragEnter={(e) => handleDragEnter(e, index)}
                                    onDragEnd={handleDragEnd}
                                    onDragOver={(e) => e.preventDefault()}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '12px 16px',
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '10px',
                                        gap: '16px',
                                        cursor: 'grab',
                                        transition: 'background-color 0.15s ease',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                        userSelect: 'none'
                                    }}
                                >
                                    {/* Left: Drag Handle + Position Badge & Product Image + Info */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                                        <div 
                                            style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                color: '#64748b', 
                                                cursor: 'grab',
                                                padding: '4px'
                                            }} 
                                            title="Click and drag to reorder"
                                        >
                                            <GripVertical size={20} />
                                        </div>

                                        <div style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '8px',
                                            backgroundColor: '#2563eb',
                                            color: '#ffffff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '14px',
                                            fontWeight: '700',
                                            flexShrink: 0
                                        }}>
                                            #{index + 1}
                                        </div>

                                        {item.image ? (
                                            <img
                                                src={`${IMG.products}/${item.image}`}
                                                alt={item.title}
                                                style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e5e7eb', flexShrink: 0 }}
                                            />
                                        ) : (
                                            <div style={{ width: '48px', height: '48px', backgroundColor: '#e5e7eb', borderRadius: '6px', flexShrink: 0 }}></div>
                                        )}

                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {item.title}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', gap: '8px', marginTop: '2px' }}>
                                                <span>ID: {item.id}</span>
                                                <span style={{ backgroundColor: '#e0e7ff', color: '#3730a3', padding: '1px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>
                                                    {categories.find(c => Number(c.id) === Number(item.categoryId))?.title || 'Category'}
                                                </span>
                                                {item.status === 1 ? (
                                                    <span style={{ color: '#16a34a', fontWeight: '600' }}>● Active</span>
                                                ) : (
                                                    <span style={{ color: '#dc2626', fontWeight: '600' }}>● Inactive</span>
                                                )}
                                                {item.type && <span style={{ color: '#d97706', fontWeight: '600' }}>[{item.type}]</span>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Middle: Order Input Box */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                        <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>Order #:</label>
                                        <input
                                            type="number"
                                            value={item.order}
                                            onChange={(e) => handleOrderInputChange(item.id, e.target.value)}
                                            style={{
                                                width: '64px',
                                                padding: '6px 8px',
                                                textAlign: 'center',
                                                fontSize: '14px',
                                                fontWeight: '700',
                                                color: '#1f2937',
                                                border: '1px solid #cbd5e1',
                                                borderRadius: '6px',
                                                backgroundColor: '#ffffff'
                                            }}
                                        />
                                    </div>

                                    {/* Right: Up / Down / Top / Bottom Buttons */}
                                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                                        <button
                                            type="button"
                                            onClick={() => moveToExtreme(index, true)}
                                            disabled={index === 0}
                                            title="Move to First Position"
                                            style={{
                                                padding: '6px 8px',
                                                backgroundColor: index === 0 ? '#f3f4f6' : '#ffffff',
                                                color: index === 0 ? '#9ca3af' : '#2563eb',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '6px',
                                                cursor: index === 0 ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            <ChevronsUp size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => moveItem(index, -1)}
                                            disabled={index === 0}
                                            title="Move Up 1 Position"
                                            style={{
                                                padding: '6px 10px',
                                                backgroundColor: index === 0 ? '#f3f4f6' : '#ffffff',
                                                color: index === 0 ? '#9ca3af' : '#111827',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '6px',
                                                cursor: index === 0 ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            <ArrowUp size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => moveItem(index, 1)}
                                            disabled={index === reorderList.length - 1}
                                            title="Move Down 1 Position"
                                            style={{
                                                padding: '6px 10px',
                                                backgroundColor: index === reorderList.length - 1 ? '#f3f4f6' : '#ffffff',
                                                color: index === reorderList.length - 1 ? '#9ca3af' : '#111827',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '6px',
                                                cursor: index === reorderList.length - 1 ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            <ArrowDown size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => moveToExtreme(index, false)}
                                            disabled={index === reorderList.length - 1}
                                            title="Move to Last Position"
                                            style={{
                                                padding: '6px 8px',
                                                backgroundColor: index === reorderList.length - 1 ? '#f3f4f6' : '#ffffff',
                                                color: index === reorderList.length - 1 ? '#9ca3af' : '#2563eb',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '6px',
                                                cursor: index === reorderList.length - 1 ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            <ChevronsDown size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Bottom Save Bar */}
                    {reorderList.length > 0 && (
                        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button
                                type="button"
                                onClick={handleSaveOrder}
                                disabled={savingOrder}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '10px 24px',
                                    backgroundColor: saveSuccess ? '#16a34a' : '#2563eb',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '700',
                                    cursor: savingOrder ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
                                }}
                            >
                                {saveSuccess ? <Check size={18} /> : <Save size={18} />}
                                {savingOrder ? 'Saving...' : saveSuccess ? 'Saved to Website!' : 'Save Arrangement'}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                /* ── NORMAL TABLE VIEW ── */
                <Table 
                    columns={columns} 
                    data={filteredProducts} 
                    editUrlPattern={(row) => `/dashboard/products/${row.id}/edit`}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
};

export default ProductList;
