import React, { useState } from 'react';
import { Outlet, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, Package, FileText, Image as ImageIcon, Grid, MessageSquare, HelpCircle, Briefcase, Download, Mail, Users, LogOut, Search, Bell, Trash2, Ticket, UserCheck } from 'lucide-react';
import api from '../api/axios';
import fullLogo from '../assets/sigma-logo-transparent.png';

const DashboardLayout = () => {
    const token = localStorage.getItem('adminToken');
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');

    // Redirect to login if not authenticated
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    const handleLogout = async () => {
        try {
            await api.post('/admin/logout');
        } catch (error) {
            console.error('Logout error', error);
        } finally {
            localStorage.removeItem('adminToken');
            navigate('/login');
        }
    };

    const sidebarLinks = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard', exact: true },
        { name: 'Products', icon: <Package size={20} />, path: '/dashboard/products', base: '/dashboard/products' },
        { name: 'Blogs', icon: <FileText size={20} />, path: '/dashboard/blogs', base: '/dashboard/blogs', exclude: '/dashboard/blog-categories' },
        { name: 'Blog Categories', icon: <Grid size={20} />, path: '/dashboard/blog-categories', base: '/dashboard/blog-categories' },
        { name: 'Banners', icon: <ImageIcon size={20} />, path: '/dashboard/banners', base: '/dashboard/banners' },
        { name: 'Categories', icon: <Grid size={20} />, path: '/dashboard/categories', base: '/dashboard/categories' },
        { name: 'Testimonials', icon: <MessageSquare size={20} />, path: '/dashboard/testimonials', base: '/dashboard/testimonials' },
        { name: 'FAQs', icon: <HelpCircle size={20} />, path: '/dashboard/faqs', base: '/dashboard/faqs' },
        { name: 'Careers', icon: <Briefcase size={20} />, path: '/dashboard/careers', base: '/dashboard/careers' },
        { name: 'Downloads', icon: <Download size={20} />, path: '/dashboard/downloads', base: '/dashboard/downloads' },
        { name: 'Contact Submissions', icon: <Mail size={20} />, path: '/dashboard/contacts', base: '/dashboard/contacts' },
        { name: 'Subscribers', icon: <Users size={20} />, path: '/dashboard/subscribers', base: '/dashboard/subscribers' },
        { name: 'Data Cleanup', icon: <Trash2 size={20} />, path: '/dashboard/cleanup', base: '/dashboard/cleanup' },
        { name: '— Ticketing ———————', icon: null, path: null, isSection: true },
        { name: 'Ticket Overview', icon: <Ticket size={20} />, path: '/dashboard/tickets', base: '/dashboard/tickets' },
        { name: 'Agent Management', icon: <UserCheck size={20} />, path: '/dashboard/agents', base: '/dashboard/agents' },
    ];

    const isLinkActive = (link) => {
        if (link.exact) {
            return location.pathname === link.path;
        }
        if (link.exclude && location.pathname.startsWith(link.exclude)) {
            return false;
        }
        if (link.base) {
            return location.pathname.startsWith(link.base);
        }
        return false;
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f7fe', fontFamily: 'sans-serif' }}>
            {/* Sidebar */}
            <aside style={{ width: '250px', backgroundColor: '#ffffff', color: '#4b5563', display: 'flex', flexDirection: 'column', borderRight: '1px solid #f3f4f6' }}>
                <div style={{ padding: '15px 24px', display: 'flex', justifyContent: 'flex-start', borderBottom: '1px solid #f3f4f6', height: '70px', boxSizing: 'border-box' }}>
                    <img src={fullLogo} alt="Sigma Logo" style={{ height: '40px', width: 'auto', display: 'block', objectFit: 'contain' }} />
                </div>
                
                <nav style={{ flex: 1, padding: '20px 0', overflowY: 'auto' }}>
                    {sidebarLinks.map((link) => {
                        if (link.isSection) {
                            return (
                                <div key={link.name} style={{ padding: '16px 20px 6px', fontSize: '10px', fontWeight: '700', color: '#d1d5db', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    Support
                                </div>
                            );
                        }

                        const active = isLinkActive(link);

                        return (
                            <Link
                                key={link.name}
                                to={link.path}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px 20px',
                                    textDecoration: 'none',
                                    color: active ? '#6d28d9' : '#6b7280',
                                    backgroundColor: active ? '#f3f0ff' : 'transparent',
                                    borderLeft: active ? '4px solid #6d28d9' : '4px solid transparent',
                                    fontWeight: active ? '600' : '500',
                                    transition: 'all 0.15s ease'
                                }}
                            >
                                {link.icon}
                                <span>{link.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Topbar */}
                <header style={{ height: '70px', backgroundColor: 'white', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
                    
                    {/* Search */}
                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f4f7fe', padding: '8px 16px', borderRadius: '24px', width: '300px' }}>
                        <Search size={18} color="#9ca3af" />
                        <input 
                            type="text" 
                            placeholder="Search products, categories..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ border: 'none', backgroundColor: 'transparent', outline: 'none', marginLeft: '8px', width: '100%', color: '#4b5563' }} 
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <Bell size={20} color="#6b7280" style={{ cursor: 'pointer' }} />
                        <div style={{ height: '32px', width: '1px', backgroundColor: '#e5e7eb' }}></div>
                        <button 
                            onClick={handleLogout}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
