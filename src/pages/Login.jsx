import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock } from 'lucide-react';
import Loader from '../components/Loader';
import LoadingOverlay from '../components/LoadingOverlay';
import fullLogo from '../assets/sigma-logo-transparent.png';
import { BACKEND_URL } from '../api/constants';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    
    // Focus states for inputs
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post(`${BACKEND_URL}/api/admin/login`, {
                email,
                password
            });

            if (response.data.result === 'success' && response.data.token) {
                localStorage.setItem('adminToken', response.data.token);
                navigate('/dashboard');
            } else {
                setError(response.data.message || 'Login failed');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            display: 'flex', 
            minHeight: '100vh', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
            position: 'relative',
            overflow: 'hidden',
            padding: '20px'
        }}>
            {/* Decorative background blobs */}
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)', filter: 'blur(40px)' }}></div>
            <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.5) 0%, rgba(255,255,255,0) 70%)', filter: 'blur(40px)' }}></div>

            <div style={{ 
                width: '100%', 
                maxWidth: '420px', 
                background: 'rgba(255, 255, 255, 0.75)', 
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                padding: '40px', 
                borderRadius: '24px', 
                boxShadow: '0 10px 40px rgba(31, 38, 135, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                margin: 'auto',
                position: 'relative',
                zIndex: 10
            }}>
                <LoadingOverlay loading={loading}>
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <img src={fullLogo} alt="Sigma Logo" style={{ width: '85%', maxWidth: '280px', height: 'auto', margin: '0 auto 20px', display: 'block' }} />
                    <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 4px 0' }}>Admin Panel</h1>
                    <p style={{ color: '#6b7280', margin: '0' }}>Sign in to manage your website</p>
                </div>

                {error && (
                    <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontSize: '14px', fontWeight: '500' }}>
                        {error}
                    </div>
                )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#4b5563', fontWeight: '500', fontSize: '14px' }}>Email Address</label>
                        <div style={{ 
                            position: 'relative', 
                            display: 'flex', 
                            alignItems: 'center',
                            border: emailFocused ? '2px solid #6d28d9' : '1px solid rgba(255, 255, 255, 0.8)',
                            borderRadius: '12px',
                            transition: 'all 0.2s',
                            background: 'rgba(255, 255, 255, 0.5)',
                            boxShadow: emailFocused ? '0 0 0 3px rgba(109, 40, 217, 0.1)' : 'inset 0 2px 4px rgba(0,0,0,0.02)'
                        }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', color: '#9ca3af' }} />
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => setEmailFocused(true)}
                                onBlur={() => setEmailFocused(false)}
                                required
                                style={{ 
                                    width: '100%', 
                                    padding: '12px 12px 12px 40px', 
                                    border: 'none', 
                                    outline: 'none',
                                    background: 'transparent',
                                    fontSize: '15px'
                                }}
                            />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#4b5563', fontWeight: '500', fontSize: '14px' }}>Password</label>
                        <div style={{ 
                            position: 'relative', 
                            display: 'flex', 
                            alignItems: 'center',
                            border: passwordFocused ? '2px solid #6d28d9' : '1px solid rgba(255, 255, 255, 0.8)',
                            borderRadius: '12px',
                            transition: 'all 0.2s',
                            background: 'rgba(255, 255, 255, 0.5)',
                            boxShadow: passwordFocused ? '0 0 0 3px rgba(109, 40, 217, 0.1)' : 'inset 0 2px 4px rgba(0,0,0,0.02)'
                        }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', color: '#9ca3af' }} />
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setPasswordFocused(true)}
                                onBlur={() => setPasswordFocused(false)}
                                required
                                style={{ 
                                    width: '100%', 
                                    padding: '12px 12px 12px 40px', 
                                    border: 'none',
                                    outline: 'none',
                                    background: 'transparent',
                                    fontSize: '15px'
                                }}
                            />
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        style={{ 
                            marginTop: '12px',
                            width: '100%', 
                            height: '52px',
                            background: loading ? 'rgba(109, 40, 217, 0.5)' : (isHovered ? 'linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%)' : 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)'), 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '12px', 
                            fontWeight: '600', 
                            fontSize: '16px',
                            letterSpacing: '0.5px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            transition: 'all 0.3s ease',
                            transform: (!loading && isHovered) ? 'translateY(-2px)' : 'none',
                            boxShadow: (!loading && isHovered) ? '0 10px 20px rgba(124, 58, 237, 0.3)' : '0 4px 10px rgba(124, 58, 237, 0.2)'
                        }}
                    >
                            Sign In
                        </button>
                    </form>
                </LoadingOverlay>
            </div>
        </div>
    );
};

export default Login;
