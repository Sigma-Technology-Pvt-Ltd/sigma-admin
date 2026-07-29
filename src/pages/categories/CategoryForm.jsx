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
const CategoryForm = () => {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    
    const [formData, setFormData] = useState({
        title: '',
        seoTitle: '',
        seoDescription: '',
        parentCategory: '',
        status: 1
    });
    
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEdit);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get('/admin/categories');
                // Filter out the current category so it can't be its own parent
                const filtered = isEdit ? res.data.data.filter(c => c.id !== parseInt(id)) : res.data.data;
                setCategories(filtered);
            } catch (err) {
                console.error(err);
            }
        };

        const fetchCategory = async () => {
            try {
                const res = await api.get('/admin/categories');
                const current = res.data.data.find(c => c.id === parseInt(id));
                if (current) {
                    setFormData({
                        title: current.title,
                        seoTitle: current.seoTitle || '',
                        seoDescription: current.seoDescription || '',
                        parentCategory: current.parentCategory || '',
                        status: current.status
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
            fetchCategory();
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
        data.append('seoTitle', formData.seoTitle);
        data.append('seoDescription', formData.seoDescription);
        data.append('status', formData.status);
        if (formData.parentCategory) {
            data.append('parentCategory', formData.parentCategory);
        }
        
        if (imageFile) {
            data.append('image', imageFile);
        }

        try {
            if (isEdit) {
                await api.put(`/admin/categories/${id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/admin/categories', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            navigate('/dashboard/categories');
        } catch (error) {
            console.error('Save failed', error);
            alert('Failed to save category');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) return <Loader size="large" />;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ marginBottom: '-24px' }}>
                    <SectionTabs createPath="/dashboard/categories/new" listPath="/dashboard/categories" entityName="Category" />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <FormButton type="button" variant="secondary" onClick={() => navigate('/dashboard/categories')}>Cancel</FormButton>
                    <FormButton type="submit" onClick={handleSubmit} disabled={loading}>{isEdit ? 'Update Category' : 'Save Category'}</FormButton>
                </div>
            </div>

            <LoadingOverlay loading={loading}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: '600px' }}>
                    <FormCard title="Category Information">
                        
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

export default CategoryForm;
