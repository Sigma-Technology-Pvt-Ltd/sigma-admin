import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CategoryList from './pages/categories/CategoryList';
import CategoryForm from './pages/categories/CategoryForm';
import ProductList from './pages/products/ProductList';
import ProductForm from './pages/products/ProductForm';
import BannerList from './pages/banners/BannerList';
import BannerForm from './pages/banners/BannerForm';
import BlogCategoryList from './pages/blogs/BlogCategoryList';
import BlogCategoryForm from './pages/blogs/BlogCategoryForm';
import BlogList from './pages/blogs/BlogList';
import BlogForm from './pages/blogs/BlogForm';
import TestimonialList from './pages/testimonials/TestimonialList';
import TestimonialForm from './pages/testimonials/TestimonialForm';
import FaqList from './pages/faqs/FaqList';
import FaqForm from './pages/faqs/FaqForm';
import CareerList from './pages/careers/CareerList';
import CareerForm from './pages/careers/CareerForm';
import DownloadList from './pages/downloads/DownloadList';
import DownloadForm from './pages/downloads/DownloadForm';
import ContactList from './pages/contacts/ContactList';
import SubscriberList from './pages/subscribers/SubscriberList';
import CleanupPage from './pages/CleanupPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Dashboard Protected Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          
          <Route path="categories" element={<CategoryList />} />
          <Route path="categories/new" element={<CategoryForm />} />
          <Route path="categories/:id/edit" element={<CategoryForm />} />

          <Route path="products" element={<ProductList />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id/edit" element={<ProductForm />} />

          {/* Banners */}
          <Route path="banners" element={<BannerList />} />
          <Route path="banners/create" element={<BannerForm />} />
          <Route path="banners/edit/:id" element={<BannerForm />} />

          {/* Blogs & Categories */}
          <Route path="blogs" element={<BlogList />} />
          <Route path="blogs/create" element={<BlogForm />} />
          <Route path="blogs/edit/:id" element={<BlogForm />} />
          
          <Route path="blog-categories" element={<BlogCategoryList />} />
          <Route path="blog-categories/create" element={<BlogCategoryForm />} />
          <Route path="blog-categories/edit/:id" element={<BlogCategoryForm />} />

          {/* Testimonials */}
          <Route path="testimonials" element={<TestimonialList />} />
          <Route path="testimonials/create" element={<TestimonialForm />} />
          <Route path="testimonials/edit/:id" element={<TestimonialForm />} />

          {/* FAQs */}
          <Route path="faqs" element={<FaqList />} />
          <Route path="faqs/create" element={<FaqForm />} />
          <Route path="faqs/edit/:id" element={<FaqForm />} />

          {/* Careers */}
          <Route path="careers" element={<CareerList />} />
          <Route path="careers/create" element={<CareerForm />} />
          <Route path="careers/edit/:id" element={<CareerForm />} />

          {/* Downloads */}
          <Route path="downloads" element={<DownloadList />} />
          <Route path="downloads/create" element={<DownloadForm />} />
          <Route path="downloads/edit/:id" element={<DownloadForm />} />

          {/* Contacts & Subscribers */}
          <Route path="contacts" element={<ContactList />} />
          <Route path="subscribers" element={<SubscriberList />} />

          {/* Data Cleanup Tool */}
          <Route path="cleanup" element={<CleanupPage />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
