import React, { useEffect, useState } from 'react';
import SectionTabs from '../../components/SectionTabs';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Table from '../../components/Table';
import Loader from '../../components/Loader';
import { IMG } from '../../api/constants';
import { ExternalLink, Image as ImageIcon, Home, Info, Globe, ShoppingBag, Layers, Check, Sparkles, Edit, Upload } from 'lucide-react';

const LIVE_DOMAIN = 'https://sigmatechnologies.com.np';

const getBannerMeta = (type, links) => {
    const t = (type || '').toLowerCase();
    
    if (t === 'left banner design') {
        return {
            page: 'Homepage',
            position: 'Hero Left (Parking System)',
            color: '#2563eb',
            bg: '#eff6ff',
            liveUrl: `${LIVE_DOMAIN}/`
        };
    }
    if (t === 'middle banner design') {
        return {
            page: 'Homepage',
            position: 'Hero Top-Right Box',
            color: '#2563eb',
            bg: '#eff6ff',
            liveUrl: `${LIVE_DOMAIN}/`
        };
    }
    if (t === 'bottom banner design') {
        return {
            page: 'Homepage',
            position: 'Hero Bottom Wide Banner',
            color: '#2563eb',
            bg: '#eff6ff',
            liveUrl: `${LIVE_DOMAIN}/`
        };
    }
    if (t === 'side offer banner') {
        return {
            page: 'Homepage',
            position: 'Middle Side Offer Banner',
            color: '#d97706',
            bg: '#fef3c7',
            liveUrl: `${LIVE_DOMAIN}/`
        };
    }
    if (t === 'middle offer banner') {
        return {
            page: 'Homepage',
            position: 'Middle Special Offer Banner',
            color: '#d97706',
            bg: '#fef3c7',
            liveUrl: `${LIVE_DOMAIN}/`
        };
    }
    if (t.includes('product')) {
        return {
            page: 'Products Page',
            position: 'Category Tile Banner',
            color: '#7c3aed',
            bg: '#f5f3ff',
            liveUrl: `${LIVE_DOMAIN}/products`
        };
    }
    if (t.includes('about')) {
        return {
            page: 'About Us',
            position: 'About Us Showcase Banner',
            color: '#059669',
            bg: '#ecfdf5',
            liveUrl: `${LIVE_DOMAIN}/about-us`
        };
    }
    if (t.includes('global') || t.includes('header')) {
        return {
            page: 'Global Header',
            position: 'Subpages Header Background',
            color: '#4b5563',
            bg: '#f3f4f6',
            liveUrl: `${LIVE_DOMAIN}/products`
        };
    }

    // Fallback based on links
    const targetUrl = links && links.startsWith('http') ? links : `${LIVE_DOMAIN}${links && links.startsWith('/') ? links : '/' + (links || '')}`;
    return {
        page: 'Homepage',
        position: type || 'General Banner',
        color: '#2563eb',
        bg: '#eff6ff',
        liveUrl: targetUrl
    };
};

const BannerList = () => {
    const [banners, setBanners] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState('all');
    const [aboutUpdating, setAboutUpdating] = useState(false);
    const [aboutMessage, setAboutMessage] = useState('');

    const handleSwitchAboutMode = async (targetBanner, newMode) => {
        if (!targetBanner) return;
        setAboutUpdating(true);
        try {
            let currentConfig = { mode: newMode, images: [] };
            if (targetBanner.subtitle && targetBanner.subtitle.trim().startsWith('{')) {
                try {
                    const parsed = JSON.parse(targetBanner.subtitle);
                    currentConfig = { ...parsed, mode: newMode };
                } catch (e) {}
            } else {
                currentConfig.mode = newMode;
            }

            const payload = new FormData();
            payload.append('title', targetBanner.title || 'About Us — Diamond Showcase');
            payload.append('type', targetBanner.type || 'About Us Banner');
            payload.append('links', targetBanner.links || '/about-us');
            payload.append('subtitle', JSON.stringify(currentConfig));
            payload.append('clusterConfig', JSON.stringify(currentConfig));
            payload.append('status', targetBanner.status !== undefined ? targetBanner.status : 1);

            await api.put(`/admin/banners/${targetBanner.id}`, payload);
            
            setBanners(prev => prev.map(b => b.id === targetBanner.id ? { ...b, subtitle: JSON.stringify(currentConfig) } : b));
            setAboutMessage(`Active display mode set to "${newMode === 'cluster' ? 'Multiple Images' : 'Single Graphic PNG'}"!`);
            setTimeout(() => setAboutMessage(''), 4000);
        } catch (err) {
            console.error('Failed to switch About Us mode', err);
            alert('Failed to switch About Us presentation mode');
        } finally {
            setAboutUpdating(false);
        }
    };

    const handleQuickUploadSingle = async (targetBanner, file) => {
        if (!file || !targetBanner) return;
        setAboutUpdating(true);
        try {
            const payload = new FormData();
            payload.append('title', targetBanner.title || 'About Us — Diamond Showcase');
            payload.append('type', targetBanner.type || 'About Us Banner');
            payload.append('links', targetBanner.links || '/about-us');
            payload.append('subtitle', targetBanner.subtitle || '');
            payload.append('status', targetBanner.status !== undefined ? targetBanner.status : 1);
            payload.append('image', file);

            const res = await api.put(`/admin/banners/${targetBanner.id}`, payload);
            if (res.data?.data) {
                setBanners(prev => prev.map(b => b.id === targetBanner.id ? { ...b, image: res.data.data.image } : b));
            }
            setAboutMessage('Single Graphic Banner updated successfully!');
            setTimeout(() => setAboutMessage(''), 4000);
        } catch (err) {
            console.error('Failed to upload image', err);
            alert('Failed to upload banner image');
        } finally {
            setAboutUpdating(false);
        }
    };

    const handleQuickUploadSlot = async (targetBanner, slotIndex, file) => {
        if (!file || !targetBanner) return;
        setAboutUpdating(true);
        try {
            let currentConfig = { mode: 'cluster', images: [] };
            if (targetBanner.subtitle && targetBanner.subtitle.trim().startsWith('{')) {
                try {
                    currentConfig = JSON.parse(targetBanner.subtitle);
                } catch (e) {}
            }
            if (!currentConfig.images) currentConfig.images = [];
            while (currentConfig.images.length <= slotIndex) {
                currentConfig.images.push({ label: `Slot ${currentConfig.images.length + 1}`, position: 'center', scale: 1.45, image: null });
            }

            const payload = new FormData();
            payload.append('title', targetBanner.title || 'About Us — Diamond Showcase');
            payload.append('type', targetBanner.type || 'About Us Banner');
            payload.append('links', targetBanner.links || '/about-us');
            payload.append('subtitle', JSON.stringify(currentConfig));
            payload.append('clusterConfig', JSON.stringify(currentConfig));
            payload.append('status', targetBanner.status !== undefined ? targetBanner.status : 1);
            payload.append(`cluster_${slotIndex}`, file);

            const res = await api.put(`/admin/banners/${targetBanner.id}`, payload);
            if (res.data?.data) {
                setBanners(prev => prev.map(b => b.id === targetBanner.id ? { ...b, subtitle: res.data.data.subtitle } : b));
            }
            setAboutMessage(`Slot ${slotIndex + 1} photo updated!`);
            setTimeout(() => setAboutMessage(''), 4000);
        } catch (err) {
            console.error('Failed to upload slot image', err);
            alert('Failed to upload slot image');
        } finally {
            setAboutUpdating(false);
        }
    };
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const [bannerRes, catRes] = await Promise.all([
                api.get('/admin/banners'),
                api.get('/admin/categories')
            ]);
            setBanners(bannerRes.data?.data || []);
            setCategories(catRes.data?.data || []);
        } catch (error) {
            console.error('Failed to fetch banners or categories', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // The exact 10 categories displayed as tiles on the /products Shop page
    const productTiles = categories
        .filter(c => !c.parentCategory && (c.homeStatus === 1 || c.navigationStatus === 1))
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(c => ({
            id: c.id,
            image: c.image,
            title: c.title,
            subtitle: null,
            slug: c.slug,
            type: 'Shop Page Category Banner',
            page: 'Shop Page',
            position: 'Category Banner Tile',
            status: c.status,
            links: `/product-category/${c.slug}/products`,
            isCategory: true
        }));

    const handleDelete = async (row) => {
        const isCat = row.isCategory;
        const confirmMsg = `Are you sure you want to delete ${isCat ? 'category tile' : 'banner'} "${row.title || 'Untitled'}"?`;
        if (window.confirm(confirmMsg)) {
            try {
                if (isCat) {
                    await api.delete(`/admin/categories/${row.id}`);
                } else {
                    await api.delete(`/admin/banners/${row.id}`);
                }
                fetchData();
            } catch (error) {
                alert(`Failed to delete ${isCat ? 'category tile' : 'banner'}`);
            }
        }
    };

    // Filter items based on selectedTab
    let displayList = [];
    if (selectedTab === 'all') {
        displayList = [...banners.map(b => ({ ...b, isCategory: false })), ...productTiles];
    } else if (selectedTab === 'home') {
        displayList = banners.filter(b => getBannerMeta(b.type, b.links).page === 'Homepage').map(b => ({ ...b, isCategory: false }));
    } else if (selectedTab === 'products') {
        displayList = productTiles;
    } else if (selectedTab === 'about') {
        displayList = banners.filter(b => getBannerMeta(b.type, b.links).page === 'About Us').map(b => ({ ...b, isCategory: false }));
    } else if (selectedTab === 'global') {
        displayList = banners.filter(b => ['Global Header', 'Custom Page'].includes(getBannerMeta(b.type, b.links).page)).map(b => ({ ...b, isCategory: false }));
    }

    const counts = {
        all: banners.length + productTiles.length,
        home: banners.filter(b => getBannerMeta(b.type, b.links).page === 'Homepage').length,
        products: productTiles.length,
        about: banners.filter(b => getBannerMeta(b.type, b.links).page === 'About Us').length,
        global: banners.filter(b => ['Global Header', 'Custom Page'].includes(getBannerMeta(b.type, b.links).page)).length,
    };

    const columns = [
        { 
            header: 'Banner Image', 
            accessor: 'image',
            render: (row) => {
                const imageSrc = row.image 
                    ? (row.isCategory ? `${IMG.categories}/${row.image}` : `${IMG.banners}/${row.image}`)
                    : null;

                return imageSrc ? (
                    <div style={{ position: 'relative', width: '100px', height: '54px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e5e7eb', background: '#f9fafb' }}>
                        <img 
                            src={imageSrc} 
                            alt={row.title || 'Banner'} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                    </div>
                ) : (
                    <div style={{ width: '100px', height: '54px', backgroundColor: '#f3f4f6', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                        <ImageIcon size={20} />
                    </div>
                );
            }
        },
        { 
            header: 'Title & Subtitle', 
            accessor: 'title',
            render: (row) => (
                <div>
                    <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>
                        {row.title || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Untitled Banner</span>}
                    </div>
                    {row.subtitle && !row.subtitle.trim().startsWith('{') && (
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                            {row.subtitle}
                        </div>
                    )}
                </div>
            )
        },
        { 
            header: 'Target Page & Position', 
            accessor: 'type',
            render: (row) => {
                if (row.isCategory) {
                    return (
                        <div>
                            <span style={{ 
                                display: 'inline-block',
                                backgroundColor: '#f5f3ff', 
                                color: '#7c3aed', 
                                padding: '3px 10px', 
                                borderRadius: '12px', 
                                fontSize: '11px', 
                                fontWeight: '700',
                                letterSpacing: '0.03em',
                                textTransform: 'uppercase'
                            }}>
                                Products Page
                            </span>
                            <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '4px', fontWeight: '500' }}>
                                Shop Category Tile Banner
                            </div>
                        </div>
                    );
                }

                const meta = getBannerMeta(row.type, row.links);
                return (
                    <div>
                        <span style={{ 
                            display: 'inline-block',
                            backgroundColor: meta.bg, 
                            color: meta.color, 
                            padding: '3px 10px', 
                            borderRadius: '12px', 
                            fontSize: '11px', 
                            fontWeight: '700',
                            letterSpacing: '0.03em',
                            textTransform: 'uppercase'
                        }}>
                            {meta.page}
                        </span>
                        <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '4px', fontWeight: '500' }}>
                            {meta.position}
                        </div>
                    </div>
                );
            }
        },
        { 
            header: 'Status', 
            accessor: 'status',
            render: (row) => row.status === 1 ? (
                <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                    ● Active
                </span>
            ) : (
                <span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                    ○ Inactive
                </span>
            )
        },
        {
            header: 'Live Site',
            accessor: 'links',
            render: (row) => {
                let liveLink = '';
                if (row.isCategory) {
                    liveLink = `${LIVE_DOMAIN}/product-category/${row.slug}/products`;
                } else {
                    const meta = getBannerMeta(row.type, row.links);
                    liveLink = row.links && row.links.startsWith('http') 
                        ? row.links 
                        : row.links && row.links.startsWith('/') 
                            ? `${LIVE_DOMAIN}${row.links}`
                            : meta.liveUrl;
                }

                return (
                    <a 
                        href={liveLink} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '6px', 
                            fontSize: '12px', 
                            fontWeight: '600', 
                            color: '#2563eb', 
                            backgroundColor: '#eff6ff', 
                            padding: '6px 12px', 
                            borderRadius: '8px', 
                            textDecoration: 'none',
                            border: '1px solid #bfdbfe',
                            transition: 'all 0.2s'
                        }}
                    >
                        <span>View Live</span>
                        <ExternalLink size={13} />
                    </a>
                );
            }
        }
    ];

    if (loading) return <Loader size="large" />;

    const tabStyles = (tabKey) => {
        const isActive = selectedTab === tabKey;
        return {
            padding: '9px 18px',
            fontSize: '14px',
            fontWeight: isActive ? '600' : '500',
            fontFamily: 'inherit',
            color: isActive ? '#ffffff' : '#4b5563',
            backgroundColor: isActive ? '#6d28d9' : '#ffffff',
            border: isActive ? '1px solid #6d28d9' : '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: isActive ? '0 4px 6px -1px rgba(109, 40, 217, 0.2)' : '0 1px 2px rgba(0,0,0,0.05)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
        };
    };

    return (
        <div>
            <SectionTabs createPath="/dashboard/banners/create" listPath="/dashboard/banners" entityName="Banner" />
            
            {/* Page Filter Tabs */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', margin: '20px 0 16px 0' }}>
                <button type="button" onClick={() => setSelectedTab('all')} style={tabStyles('all')}>
                    <Layers size={16} />
                    <span>All Banners</span>
                    <span style={{ 
                        fontSize: '12px', 
                        fontWeight: '600',
                        background: selectedTab === 'all' ? 'rgba(255, 255, 255, 0.25)' : '#f3f4f6', 
                        color: selectedTab === 'all' ? '#ffffff' : '#6b7280', 
                        padding: '2px 8px', 
                        borderRadius: '12px' 
                    }}>
                        {counts.all}
                    </span>
                </button>
                <button type="button" onClick={() => setSelectedTab('home')} style={tabStyles('home')}>
                    <Home size={16} />
                    <span>Homepage (Hero & Offers)</span>
                    <span style={{ 
                        fontSize: '12px', 
                        fontWeight: '600',
                        background: selectedTab === 'home' ? 'rgba(255, 255, 255, 0.25)' : '#f3f4f6', 
                        color: selectedTab === 'home' ? '#ffffff' : '#6b7280', 
                        padding: '2px 8px', 
                        borderRadius: '12px' 
                    }}>
                        {counts.home}
                    </span>
                </button>
                <button type="button" onClick={() => setSelectedTab('products')} style={tabStyles('products')}>
                    <ShoppingBag size={16} />
                    <span>Shop Page ({counts.products} Categories)</span>
                    <span style={{ 
                        fontSize: '12px', 
                        fontWeight: '600',
                        background: selectedTab === 'products' ? 'rgba(255, 255, 255, 0.25)' : '#f3f4f6', 
                        color: selectedTab === 'products' ? '#ffffff' : '#6b7280', 
                        padding: '2px 8px', 
                        borderRadius: '12px' 
                    }}>
                        {counts.products}
                    </span>
                </button>
                <button type="button" onClick={() => setSelectedTab('about')} style={tabStyles('about')}>
                    <Info size={16} />
                    <span>About Us</span>
                    <span style={{ 
                        fontSize: '12px', 
                        fontWeight: '600',
                        background: selectedTab === 'about' ? 'rgba(255, 255, 255, 0.25)' : '#f3f4f6', 
                        color: selectedTab === 'about' ? '#ffffff' : '#6b7280', 
                        padding: '2px 8px', 
                        borderRadius: '12px' 
                    }}>
                        {counts.about}
                    </span>
                </button>
                <button type="button" onClick={() => setSelectedTab('global')} style={tabStyles('global')}>
                    <Globe size={16} />
                    <span>Global / Other</span>
                    <span style={{ 
                        fontSize: '12px', 
                        fontWeight: '600',
                        background: selectedTab === 'global' ? 'rgba(255, 255, 255, 0.25)' : '#f3f4f6', 
                        color: selectedTab === 'global' ? '#ffffff' : '#6b7280', 
                        padding: '2px 8px', 
                        borderRadius: '12px' 
                    }}>
                        {counts.global}
                    </span>
                </button>
            </div>

            {selectedTab === 'about' && (() => {
                const aboutBanner = banners.find(b => getBannerMeta(b.type, b.links).page === 'About Us' || (b.type || '').toLowerCase().includes('about'));
                let currentMode = 'single';
                let clusterImages = [];
                if (aboutBanner?.subtitle && aboutBanner.subtitle.trim().startsWith('{')) {
                    try {
                        const parsed = JSON.parse(aboutBanner.subtitle);
                        if (parsed.mode) currentMode = parsed.mode;
                        if (Array.isArray(parsed.images)) clusterImages = parsed.images;
                    } catch (e) {}
                }

                const slotLabels = [
                    { title: 'Slot 1: Image 1', sub: 'First Showcase Image' },
                    { title: 'Slot 2: Image 2', sub: 'Second Showcase Image' },
                    { title: 'Slot 3: Image 3', sub: 'Third Showcase Image' },
                    { title: 'Slot 4: Image 4', sub: 'Fourth Showcase Image' },
                ];

                return (
                    <div style={{
                        margin: '16px 0 24px 0',
                        borderRadius: '16px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.06)',
                        overflow: 'hidden'
                    }}>
                        {/* Card Header */}
                        <div style={{
                            padding: '18px 24px',
                            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                            borderBottom: '1px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '12px'
                        }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                                        About Us Image Display
                                    </h3>
                                    <span style={{ 
                                        display: 'inline-flex', 
                                        alignItems: 'center', 
                                        gap: '4px',
                                        fontSize: '11px', 
                                        fontWeight: '700', 
                                        color: '#059669', 
                                        backgroundColor: '#ecfdf5', 
                                        padding: '3px 10px', 
                                        borderRadius: '20px',
                                        border: '1px solid #a7f3d0'
                                    }}>
                                        ● Live On Storefront
                                    </span>
                                </div>
                                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                                    Choose whether to show a Single Image or Multiple Images on the About Us section.
                                </p>
                            </div>

                            {aboutBanner && (
                                <button
                                    type="button"
                                    onClick={() => navigate(`/dashboard/banners/edit/${aboutBanner.id}`)}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#6366f1',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <Edit size={14} />
                                    <span>Open Full Banner Editor</span>
                                </button>
                            )}
                        </div>

                        {/* Success Notification Bar */}
                        {aboutMessage && (
                            <div style={{
                                padding: '10px 24px',
                                backgroundColor: '#f0fdf4',
                                borderBottom: '1px solid #bbf7d0',
                                color: '#16a34a',
                                fontSize: '13px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <Check size={16} />
                                <span>{aboutMessage}</span>
                            </div>
                        )}

                        {/* Interactive Mode Switcher Tabs */}
                        <div style={{ padding: '24px' }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                gap: '16px',
                                marginBottom: '24px'
                            }}>
                                {/* Option 1: Single Graphic PNG */}
                                <div 
                                    onClick={() => !aboutUpdating && handleSwitchAboutMode(aboutBanner, 'single')}
                                    style={{
                                        padding: '18px 20px',
                                        borderRadius: '12px',
                                        border: currentMode === 'single' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                                        backgroundColor: currentMode === 'single' ? '#eff6ff' : '#f8fafc',
                                        cursor: aboutUpdating ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s',
                                        position: 'relative'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '15px', color: currentMode === 'single' ? '#1d4ed8' : '#1e293b' }}>
                                            <span>🖼️ Single Image</span>
                                        </div>
                                        {currentMode === 'single' && (
                                            <span style={{ 
                                                fontSize: '11px', 
                                                fontWeight: '700', 
                                                color: '#2563eb', 
                                                backgroundColor: '#dbeafe', 
                                                padding: '3px 8px', 
                                                borderRadius: '12px' 
                                            }}>
                                                ✓ ACTIVE MODE
                                            </span>
                                        )}
                                    </div>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>
                                        Display a single image for the About Us section.
                                    </p>
                                </div>

                                {/* Option 2: Multiple Images */}
                                <div 
                                    onClick={() => !aboutUpdating && handleSwitchAboutMode(aboutBanner, 'cluster')}
                                    style={{
                                        padding: '18px 20px',
                                        borderRadius: '12px',
                                        border: currentMode === 'cluster' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                                        backgroundColor: currentMode === 'cluster' ? '#eff6ff' : '#f8fafc',
                                        cursor: aboutUpdating ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s',
                                        position: 'relative'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '15px', color: currentMode === 'cluster' ? '#1d4ed8' : '#1e293b' }}>
                                            <span>🗂️ Multiple Images</span>
                                        </div>
                                        {currentMode === 'cluster' && (
                                            <span style={{ 
                                                fontSize: '11px', 
                                                fontWeight: '700', 
                                                color: '#2563eb', 
                                                backgroundColor: '#dbeafe', 
                                                padding: '3px 8px', 
                                                borderRadius: '12px' 
                                            }}>
                                                ✓ ACTIVE MODE
                                            </span>
                                        )}
                                    </div>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>
                                        Display multiple separate images for the About Us section.
                                    </p>
                                </div>
                            </div>

                            {/* Active Mode Quick Actions */}
                            {currentMode === 'single' ? (
                                <div style={{
                                    padding: '20px',
                                    borderRadius: '12px',
                                    backgroundColor: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '24px',
                                    flexWrap: 'wrap'
                                }}>
                                    {aboutBanner?.image && (
                                        <div style={{
                                            width: '120px',
                                            height: '90px',
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            border: '1px solid #cbd5e1',
                                            background: '#fff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <img 
                                                src={`${IMG.banners}/${aboutBanner.image}`} 
                                                alt="Current Single Banner" 
                                                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                                            />
                                        </div>
                                    )}
                                    <div style={{ flex: 1, minWidth: '220px' }}>
                                        <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
                                            Current Banner Image
                                        </h4>
                                        <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#64748b' }}>
                                            Upload a new image to replace current banner:
                                        </p>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            disabled={aboutUpdating}
                                            onChange={(e) => e.target.files?.[0] && handleQuickUploadSingle(aboutBanner, e.target.files[0])}
                                            style={{ fontSize: '12px', maxWidth: '320px' }} 
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div style={{
                                    padding: '20px',
                                    borderRadius: '12px',
                                    backgroundColor: '#f8fafc',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <div>
                                            <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
                                                Manage Multiple Image Slots
                                            </h4>
                                            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                                                Upload individual images for this section. Click "Choose File" on any slot to replace that photo.
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                        gap: '14px'
                                    }}>
                                        {slotLabels.map((slot, idx) => {
                                            const existingSlot = clusterImages[idx] || {};
                                            const slotSrc = existingSlot.image 
                                                ? (existingSlot.image.startsWith('http') || existingSlot.image.startsWith('/')
                                                    ? existingSlot.image
                                                    : `${IMG.banners}/${existingSlot.image}`)
                                                : null;

                                            return (
                                                <div 
                                                    key={idx}
                                                    style={{
                                                        padding: '14px',
                                                        borderRadius: '10px',
                                                        backgroundColor: '#ffffff',
                                                        border: '1px solid #e2e8f0',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '10px'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div>
                                                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                                                                {slot.title}
                                                            </div>
                                                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                                                                {slot.sub}
                                                            </div>
                                                        </div>
                                                        {slotSrc && (
                                                            <div style={{
                                                                width: '32px',
                                                                height: '32px',
                                                                
                                                                overflow: 'hidden',
                                                                borderRadius: '4px',
                                                                border: '2px solid #2563eb',
                                                                flexShrink: 0
                                                            }}>
                                                                <img 
                                                                    src={slotSrc} 
                                                                    alt={slot.title} 
                                                                    style={{ width: '100%', height: '100%', objectFit: 'cover',  }} 
                                                                />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                                                            Replace Image:
                                                        </label>
                                                        <input 
                                                            type="file" 
                                                            accept="image/*" 
                                                            disabled={aboutUpdating}
                                                            onChange={(e) => e.target.files?.[0] && handleQuickUploadSlot(aboutBanner, idx, e.target.files[0])}
                                                            style={{ fontSize: '11px', width: '100%' }} 
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })()}

            {selectedTab === 'about' && displayList.length === 0 && (
                <div style={{
                    margin: '12px 0 20px 0',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '10px',
                            backgroundColor: '#059669',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 'bold',
                            fontSize: '20px'
                        }}>
                            ℹ️
                        </div>
                        <div>
                            <div style={{ fontWeight: '700', color: '#065f46', fontSize: '14px' }}>
                                Default Diamond Graphic Active on Live Site
                            </div>
                            <div style={{ color: '#047857', fontSize: '13px', marginTop: '2px' }}>
                                The website is currently displaying the default 4-photo diamond collage (<code>about.png</code>). To replace or update it with a custom banner, click below:
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/banners/create')}
                        style={{
                            padding: '8px 18px',
                            backgroundColor: '#059669',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        + Create About Us Banner
                    </button>
                </div>
            )}

            <Table 
                columns={columns} 
                data={displayList} 
                editUrlPattern={(row) => row.isCategory ? `/dashboard/categories/${row.id}/edit` : `/dashboard/banners/edit/${row.id}`}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default BannerList;
