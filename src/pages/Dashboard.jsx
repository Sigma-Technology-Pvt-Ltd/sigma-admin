import React, { useState, useEffect } from 'react';
import { Package, FileText, Mail, Users, ArrowRight } from 'lucide-react';
import { IMG } from '../api/constants';
import { Link, useLocation } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const location = useLocation();
    const justLoggedIn = location.state?.justLoggedIn;

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/dashboard-stats');
                setStats(res.data.data);
            } catch (err) {
                console.error("Failed to fetch stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const StatCard = ({ title, value, icon, bgColor, iconColor, linkTo }) => (
        <Link to={linkTo} style={{ textDecoration: 'none', display: 'block' }}>
            <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                padding: '24px',
                borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(255,255,255,0.5) inset',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                transition: 'transform 0.2s',
                cursor: 'pointer'
            }}>
            <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                backgroundColor: bgColor,
                color: iconColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {icon}
            </div>
            <div>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>{title}</p>
                <h3 style={{ margin: 0, color: '#111827', fontSize: '28px', fontWeight: 'bold' }}>{value}</h3>
            </div>
        </div>
        </Link>
    );

    if (loading) {
        if (justLoggedIn) {
            return (
                <div>
                    <div style={{ marginBottom: '32px' }}>
                        <div style={{ height: '32px', width: '250px', backgroundColor: '#e5e7eb', borderRadius: '8px', marginBottom: '8px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
                        <div style={{ height: '20px', width: '400px', backgroundColor: '#e5e7eb', borderRadius: '6px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} style={{ height: '108px', backgroundColor: '#e5e7eb', borderRadius: '16px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
                        ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div style={{ height: '300px', backgroundColor: '#e5e7eb', borderRadius: '16px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
                        <div style={{ height: '300px', backgroundColor: '#e5e7eb', borderRadius: '16px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
                    </div>
                </div>
            );
        }
        return <Loader size="large" />;
    }

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px 0' }}>Dashboard Overview</h1>
                <p style={{ color: '#6b7280', margin: 0, fontSize: '15px' }}>Welcome back. Here is what's happening with your content today.</p>
            </div>

            {/* Metric Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                <StatCard 
                    title="Total Products" 
                    value={stats?.totals?.products || 0} 
                    icon={<Package size={28} />} 
                    bgColor="rgba(238, 242, 255, 0.8)" 
                    iconColor="#4f46e5" 
                    linkTo="/dashboard/products"
                />
                <StatCard 
                    title="Total Blogs" 
                    value={stats?.totals?.blogs || 0} 
                    icon={<FileText size={28} />} 
                    bgColor="rgba(253, 244, 255, 0.8)" 
                    iconColor="#c026d3" 
                    linkTo="/dashboard/blogs"
                />
                <StatCard 
                    title="New Contacts" 
                    value={stats?.totals?.contacts || 0} 
                    icon={<Mail size={28} />} 
                    bgColor="rgba(255, 247, 237, 0.8)" 
                    iconColor="#ea580c" 
                    linkTo="/dashboard/contacts"
                />
                <StatCard 
                    title="Subscribers" 
                    value={stats?.totals?.subscribers || 0} 
                    icon={<Users size={28} />} 
                    bgColor="rgba(236, 253, 245, 0.8)" 
                    iconColor="#059669" 
                    linkTo="/dashboard/subscribers"
                />
            </div>

            {/* Recent Activity Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                
                {/* Latest Contacts */}
                <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>Recent Contact Submissions</h3>
                        <Link to="/dashboard/contacts" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: '#6d28d9', textDecoration: 'none', fontWeight: '500' }}>
                            View All <ArrowRight size={16} />
                        </Link>
                    </div>
                    <div>
                        {stats?.recent?.contacts?.length > 0 ? (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <tbody>
                                    {stats.recent.contacts.map((contact, idx) => (
                                        <tr key={contact.id} style={{ borderBottom: idx !== stats.recent.contacts.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                                            <td style={{ padding: '16px 24px' }}>
                                                <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>{contact.name}</p>
                                                <p style={{ margin: 0, color: '#6b7280', fontSize: '13px' }}>{contact.email}</p>
                                            </td>
                                            <td style={{ padding: '16px 24px', textAlign: 'right', color: '#9ca3af', fontSize: '12px' }}>
                                                {new Date(contact.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>No recent contacts found.</div>
                        )}
                    </div>
                </div>

                {/* Latest Products */}
                <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>Recently Added Products</h3>
                        <Link to="/dashboard/products" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: '#6d28d9', textDecoration: 'none', fontWeight: '500' }}>
                            View All <ArrowRight size={16} />
                        </Link>
                    </div>
                    <div>
                        {stats?.recent?.products?.length > 0 ? (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <tbody>
                                    {stats.recent.products.map((product, idx) => (
                                        <tr key={product.id} style={{ borderBottom: idx !== stats.recent.products.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                                            <td style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                {product.image ? (
                                                    <img src={`${IMG.products}/${product.image}`} alt={product.title} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#e5e7eb' }}></div>
                                                )}
                                                <div>
                                                    <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>{product.title}</p>
                                                    <span style={{ fontSize: '12px', fontWeight: '500', color: product.status === 1 ? '#059669' : '#dc2626', backgroundColor: product.status === 1 ? '#d1fae5' : '#fee2e2', padding: '2px 8px', borderRadius: '12px' }}>
                                                        {product.status === 1 ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 24px', textAlign: 'right', color: '#9ca3af', fontSize: '12px' }}>
                                                {new Date(product.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>No recent products found.</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
