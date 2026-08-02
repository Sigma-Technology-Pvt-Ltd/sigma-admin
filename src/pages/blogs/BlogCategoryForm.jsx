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
const BlogCategoryForm = () => {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        seoTitle: '',
        seoKeyword: '',
        seoDescription: '',
        status: 1
    });
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(isEdit);

    useEffect(() => {
        if (isEdit) {
            const fetchCategory = async () => {
                try {
                    const res = await api.get('/admin/blog-categories');
                    const current = res.data.data.find(c => Number(c.id) === Number(id));
                    if (current) {
                        setFormData({
                            title: current.title || '',
                            description: current.description || '',
                            seoTitle: current.seoTitle || '',
                            seoKeyword: current.seoKeyword || '',
                            seoDescription: current.seoDescription || '',
                            status: current.status
                        });
                    }
                } catch (error) {
                    console.error('Failed to fetch blog category', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchCategory();
        }
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
                await api.put(`/admin/blog-categories/${id}`, data);
            } else {
                await api.post('/admin/blog-categories', data);
            }
            navigate('/dashboard/blog-categories');
        } catch (error) {
            console.error('Failed to save blog category', error);
            alert('Failed to save blog category');
        }
    };

    if (loading) return <Loader size="large" />;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ marginBottom: '-24px' }}>
                    <SectionTabs createPath="/dashboard/blog-categories/create" listPath="/dashboard/blog-categories" entityName="Blog Category" />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <FormButton type="button" variant="secondary" onClick={() => navigate('/dashboard/blog-categories')}>Cancel</FormButton>
                    <FormButton type="submit" onClick={handleSubmit} disabled={loading}>{isEdit ? 'Update Blog Category' : 'Save Blog Category'}</FormButton>
                </div>
            </div>

            <LoadingOverlay loading={loading}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: '600px' }}>
                    <FormCard title="Blog Category Information">
                        
                        <FormInput label="Title" name="title" value={formData.title} onChange={handleChange} required />
                        <FormTextarea label="Summary" name="summary" value={formData.summary} onChange={handleChange} rows="2" />
                        <FormSelect label="Status" name="status" value={formData.status} onChange={handleChange}>
                            <option value={1}>Active</option>
                            <option value={0}>Inactive</option>
                        </FormSelect>

                    </FormCard>
                </div>
            </form>
            </LoadingOverlay>
        </div>
    );
};

export default BlogCategoryForm;
