// Central place for all environment-based URLs
// In production, set these in your .env file:
//   VITE_BACKEND_URL=https://api.yourdomain.com
//   VITE_FRONTEND_URL=https://yourdomain.com

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
export const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3001';

// Image base paths — served through FRONTEND domain (/images/* proxied to Supabase)
// In production: Vercel rewrites /images/* → Supabase (Supabase URL never exposed)
// In local dev: Vite proxy → backend → Supabase
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
