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
const BlogForm = () => {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        categoryId: '',
        summary: '',
        description: '',
        seoTitle: '',
        seoKeyword: '',
        seoDescription: '',
        status: 1
    });
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const catsRes = await api.get('/admin/blog-categories');
                setCategories(catsRes.data.data);
                
                if (isEdit) {
                    const res = await api.get('/admin/blogs');
                    const current = res.data.data.find(b => b.id === parseInt(id));
                    if (current) {
                        setFormData({
                            title: current.title || '',
                            categoryId: current.categoryId || '',
                            summary: current.summary || '',
                            description: current.description || '',
                            seoTitle: current.seoTitle || '',
                            seoKeyword: current.seoKeyword || '',
                            seoDescription: current.seoDescription || '',
                            status: current.status
                        });
                    }
                } else if (catsRes.data.data.length > 0) {
                    setFormData(prev => ({ ...prev, categoryId: catsRes.data.data[0].id }));
                }
            } catch (error) {
                console.error('Failed to fetch initial data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [id, isEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const data = new FormData();
        data.append('title', formData.title);
        data.append('categoryId', formData.categoryId);
        data.append('summary', formData.summary);
        data.append('description', formData.description);
        data.append('seoTitle', formData.seoTitle);
        data.append('seoKeyword', formData.seoKeyword);
        data.append('seoDescription', formData.seoDescription);
        data.append('status', formData.status);
        
        if (image) {
            data.append('image', image);
        }

        try {
            if (isEdit) {
                await api.put(`/admin/blogs/${id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/admin/blogs', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            navigate('/dashboard/blogs');
        } catch (error) {
            console.error('Failed to save blog', error);
            alert('Failed to save blog');
        }
    };

    const handlePreview = async () => {
        const data = new FormData();
        data.append('title', formData.title);
        data.append('categoryId', formData.categoryId);
        data.append('summary', formData.summary);
        data.append('description', formData.description);
        data.append('seoTitle', formData.seoTitle);
        data.append('seoKeyword', formData.seoKeyword);
        data.append('seoDescription', formData.seoDescription);
        data.append('status', formData.status);
        data.append('contentType', 'blog');
        if (image) data.append('image', image);
        try {
            const res = await api.post('/admin/preview', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            window.open(`${FRONTEND_URL}/preview/blog/${res.data.previewId}`, '_blank');
        } catch (err) {
            alert('Failed to generate preview');
        }
    };

    if (loading) return <Loader size="large" />;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ marginBottom: '-24px' }}>
                    <SectionTabs createPath="/dashboard/blogs/create" listPath="/dashboard/blogs" entityName="Blog" />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <FormButton type="button" variant="secondary" onClick={() => navigate('/dashboard/blogs')}>Cancel</FormButton>
                    <FormButton type="button" onClick={handlePreview} style={{ background: '#f3f4f6', color: '#1f2937' }}>Live Preview</FormButton>
                    <FormButton type="submit" onClick={handleSubmit} disabled={loading}>{isEdit ? 'Update Blog' : 'Save Blog'}</FormButton>
                </div>
            </div>

            <LoadingOverlay loading={loading}>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <FormCard title="General Information">
                        <FormInput label="Title" name="title" value={formData.title} onChange={handleChange} required />
                        <FormTextarea label="Summary" name="summary" value={formData.summary} onChange={handleChange} rows="2" />
                        <FormTextarea label="Content" name="description" value={formData.description} onChange={handleChange} rows="5" />
                    </FormCard>
                    
                    <FormCard title="SEO Info">
                        <FormInput label="SEO Title" name="seoTitle" value={formData.seoTitle} onChange={handleChange} />
                        <FormTextarea label="SEO Description" name="seoDescription" value={formData.seoDescription} onChange={handleChange} rows="2" />
                    </FormCard>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <FormCard title="Category & Status">
                        <FormSelect label="Category" name="categoryId" value={formData.categoryId} onChange={handleChange} required>
                            <option value="">-- Select Category --</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.title}</option>
                            ))}
                        </FormSelect>
                        <br/>
                        <FormSelect label="Status" name="status" value={formData.status} onChange={handleChange}>
                            <option value={1}>Active</option>
                            <option value={0}>Inactive</option>
                        </FormSelect>
                    </FormCard>

                    <FormCard title="Upload Image">
                        <div style={{ border: '2px dashed #e5e7eb', borderRadius: '12px', padding: '32px', textAlign: 'center', backgroundColor: '#f9fafb' }}>
                            <FormInput type="file" accept="image/*" onChange={handleFileChange} style={{ backgroundColor: 'white' }} />
                        </div>
                    </FormCard>
                </div>
            </form>
            </LoadingOverlay>
        </div>
    );
};

export default BlogForm;
