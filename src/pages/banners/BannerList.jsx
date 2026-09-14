import React, { useEffect, useState } from 'react';
import SectionTabs from '../../components/SectionTabs';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Table from '../../components/Table';
import Loader from '../../components/Loader';
import { IMG } from '../../api/constants';
import { ExternalLink, Image as ImageIcon, Home, Info, Globe, ShoppingBag, Layers } from 'lucide-react';

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
                    {row.subtitle && (
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
