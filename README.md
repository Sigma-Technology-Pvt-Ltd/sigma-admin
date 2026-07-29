# Sigma Admin Panel

React + Vite admin panel for managing Sigma Technologies website content.

## Tech Stack
- **Framework**: React 19 + Vite
- **Routing**: React Router DOM v7
- **HTTP**: Axios
- **Icons**: Lucide React
- **Deploy**: Vercel

---

## Local Development

### 1. Install dependencies
```bash
npm install
```

### 2. Setup environment
```bash
cp .env.example .env
# Fill in all values in .env
```

### 3. Run dev server
```bash
npm run dev
```

Admin panel runs on `http://localhost:5173`

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_BACKEND_URL` | Backend API URL (e.g. `https://api.yourdomain.com`) |
| `VITE_FRONTEND_URL` | Frontend website URL (for preview links) |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_BUCKET` | Supabase storage bucket name (e.g. `sigma-media`) |

---

## Vercel Deployment

### Steps
1. Push code to GitHub
2. Vercel → New Project → Import GitHub repo
3. Framework: **Vite** (auto-detected)
4. Add Environment Variables in Vercel dashboard:
   - `VITE_BACKEND_URL` = your Render backend URL
   - `VITE_FRONTEND_URL` = your frontend Vercel URL
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_BUCKET` = `sigma-media`
5. Deploy ✅

### Build Settings (auto-detected)
| Setting | Value |
|---------|-------|
| **Framework** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

---

## Features
- Products, Categories, Banners, Blogs, Careers, FAQs, Testimonials, Downloads
- Live Preview for Products, Blogs, Careers
- Contact Submissions & Subscribers view
- **Data Cleanup Tool** — search and delete test data by keyword or date
- All images served from Supabase CDN
