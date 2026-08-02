// Central place for all environment-based URLs
// Auto-detects localhost vs production environment dynamically

export const getAdminBackendUrl = () => {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return 'http://localhost:3000';
    }
    return import.meta.env.VITE_BACKEND_URL || 'https://sigma-backend-s4pg.onrender.com';
};

export const getAdminFrontendUrl = () => {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return 'http://localhost:3001';
    }
    const raw = import.meta.env.VITE_FRONTEND_URL || 'https://sigma-frontend-azure.vercel.app';
    return raw.endsWith('/') ? raw.slice(0, -1) : raw;
};

export const BACKEND_URL = getAdminBackendUrl();
export const FRONTEND_URL = getAdminFrontendUrl();

// Image base paths — served through FRONTEND domain (/images/* proxied to Supabase)
export const IMG = {
    products:       `/images/products`,
    blogs:          `/images/blogs`,
    banners:        `/images/banners`,
    careers:        `/images/careers`,
    categories:     `/images/categories`,
    blogCategories: `/images/blog_categories`,
    testimonials:   `/images/testimonials`,
    documents:      `/images/documents`,
};
