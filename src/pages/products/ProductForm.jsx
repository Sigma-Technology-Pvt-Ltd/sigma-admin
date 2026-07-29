import React, { useState, useEffect } from 'react';
import SectionTabs from '../../components/SectionTabs';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';

import Loader from '../../components/Loader';
import LoadingOverlay from '../../components/LoadingOverlay';

import FormCard from '../../components/ui/FormCard';
import FormInput from '../../components/ui/FormInput';
import FormSelect from '../../components/ui/FormSelect';
import FormTextarea from '../../components/ui/FormTextarea';
import FormButton from '../../components/ui/FormButton';
import { FRONTEND_URL } from '../../api/constants';
const ProductForm = () => {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    
    const [formData, setFormData] = useState({
        title: '',
        categoryId: '',
        summary: '',
        description: '',
        status: 1,
        seoTitle: '',
        seoDescription: ''
    });
    
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEdit);
    const [previewMode, setPreviewMode] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get('/admin/categories');
                setCategories(res.data.data);
            } catch (err) {
                console.error(err);
            }
        };

        const fetchProduct = async () => {
            try {
                const res = await api.get('/admin/products');
                const current = res.data.data.find(p => p.id === parseInt(id));
                if (current) {
                    setFormData({
                        title: current.title,
                        categoryId: current.categoryId || '',
                        summary: current.summary || '',
                        description: current.description || '',
                        status: current.status,
                        seoTitle: current.seoTitle || '',
                        seoDescription: current.seoDescription || ''
                    });
                }
            } catch (err) {
                console.error(err);
            } finally {
                setInitialLoading(false);
            }
        };

        fetchCategories();
        if (isEdit) {
            fetchProduct();
        }
    }, [id, isEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append('title', formData.title);
        data.append('categoryId', formData.categoryId);
        data.append('summary', formData.summary);
        data.append('description', formData.description);
        data.append('status', formData.status);
        data.append('seoTitle', formData.seoTitle);
        data.append('seoDescription', formData.seoDescription);
        
        if (imageFile) {
            data.append('image', imageFile);
        }

        try {
            if (isEdit) {
                await api.put(`/admin/products/${id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/admin/products', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            navigate('/dashboard/products');
        } catch (error) {
            console.error('Save failed', error);
            alert('Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    const handlePreview = async () => {
        setLoading(true);
        const data = new FormData();
        data.append('title', formData.title);
        data.append('categoryId', formData.categoryId);
        data.append('summary', formData.summary);
        data.append('description', formData.description);
        data.append('status', formData.status);
        data.append('seoTitle', formData.seoTitle);
        data.append('seoDescription', formData.seoDescription);
        if (imageFile) data.append('image', imageFile);

        try {
            const res = await api.post('/admin/preview', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const previewId = res.data.previewId;
            // Frontend runs on port 3001 (configured in sigma-frontend/.env)
            window.open(`${FRONTEND_URL}/preview/${previewId}`, '_blank');
        } catch (err) {
            console.error('Preview failed', err);
            alert('Failed to generate preview');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) return <Loader size="large" />;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ marginBottom: '-24px' }}>
                    <SectionTabs createPath="/dashboard/products/new" listPath="/dashboard/products" entityName="Product" />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <FormButton type="button" variant="secondary" onClick={() => navigate('/dashboard/products')}>Cancel</FormButton>
                    <FormButton type="button" onClick={handlePreview} style={{ background: '#f3f4f6', color: '#1f2937' }}>Live Preview</FormButton>
                    <FormButton type="submit" onClick={handleSubmit} disabled={loading}>{isEdit ? 'Update Product' : 'Save Product'}</FormButton>
                </div>
            </div>

            <LoadingOverlay loading={loading}>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>
                
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <FormCard title="General Information">
                        <FormInput label="Product Name" name="title" value={formData.title} onChange={handleChange} required />
                        <FormTextarea label="Summary" name="summary" value={formData.summary} onChange={handleChange} rows="2" />
                        <FormTextarea label="Description" name="description" value={formData.description} onChange={handleChange} rows="5" />
                    </FormCard>

                    <FormCard title="Product Status">
                        <FormSelect label="Status" name="status" value={formData.status} onChange={handleChange}>
                            <option value={1}>Active</option>
                            <option value={0}>Inactive</option>
                        </FormSelect>
                    </FormCard>
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <FormCard title="Product Category">
                        <FormSelect label="Category" name="categoryId" value={formData.categoryId} onChange={handleChange} required>
                            <option value="">-- Select Category --</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.title}</option>
                            ))}
                        </FormSelect>
                    </FormCard>

                    <FormCard title="Upload Image">
                        <div style={{ 
                            border: '2px dashed #e5e7eb', 
                            borderRadius: '12px', 
                            padding: '32px', 
                            textAlign: 'center',
                            backgroundColor: '#f9fafb'
                        }}>
                            <FormInput type="file" accept="image/*" onChange={handleFileChange} style={{ backgroundColor: 'white' }} />
                            {isEdit && !imageFile && <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>Leave blank to keep existing image</p>}
                        </div>
                    </FormCard>
                </div>
            </form>
            </LoadingOverlay>

        </div>
    );
};

export default ProductForm;
