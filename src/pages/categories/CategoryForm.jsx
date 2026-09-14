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
import { IMG } from '../../api/constants';

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
        status: 1,
        navigationStatus: 0,
        order: 0
    });
    
    const [existingImage, setExistingImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEdit);

    const [showSeo, setShowSeo] = useState(false);

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
                const current = res.data.data.find(c => Number(c.id) === Number(id));
                if (current) {
                    setFormData({
                        title: current.title || '',
                        seoTitle: current.seoTitle || '',
                        seoDescription: current.seoDescription || '',
                        parentCategory: current.parentCategory || '',
                        status: current.status !== undefined ? current.status : 1,
                        navigationStatus: current.navigationStatus || 0,
                        order: current.order || 0
                    });
                    if (current.seoTitle || current.seoDescription) {
                        setShowSeo(true);
                    }
                    setExistingImage(current.image || null);
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
        // If it's a root category, automatically enable as shop tile
        const isRoot = !formData.parentCategory;
        data.append('navigationStatus', isRoot ? 1 : 0);
        data.append('homeStatus', isRoot ? 1 : 0);
        data.append('order', formData.order || 0);
        data.append('parentCategory', formData.parentCategory ? formData.parentCategory : '');
        
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
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', alignItems: 'start' }}>
                    
                    {/* Left Column: Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <FormCard title="Category Information">
                            <FormInput 
                                label="Category Title" 
                                name="title" 
                                value={formData.title} 
                                onChange={handleChange} 
                                required 
                                placeholder="e.g. Parking Solutions" 
                            />
                            
                            <FormSelect 
                                label="Parent Category" 
                                name="parentCategory" 
                                value={formData.parentCategory || ''} 
                                onChange={handleChange}
                            >
                                <option value="">-- Main Parent Category (No Parent) --</option>
                                {categories.filter(c => !c.parentCategory).map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.title}
                                    </option>
                                ))}
                            </FormSelect>

                            <FormSelect label="Status" name="status" value={formData.status} onChange={handleChange}>
                                <option value={1}>Active</option>
                                <option value={0}>Inactive</option>
                            </FormSelect>
                        </FormCard>

                        {/* Collapsible SEO Settings */}
                        <FormCard>
                            <div 
                                onClick={() => setShowSeo(!showSeo)} 
                                style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center', 
                                    cursor: 'pointer',
                                    userSelect: 'none'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <strong style={{ fontSize: '15px', color: '#1f2937' }}>Search Engine Optimization (SEO)</strong>
                                    <span style={{ fontSize: '11px', color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: '12px', fontWeight: '500' }}>Optional</span>
                                </div>
                                <span style={{ fontSize: '13px', color: '#6b7280', transition: 'transform 0.2s', transform: showSeo ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                    ▼
                                </span>
                            </div>

                            {showSeo && (
                                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
                                    <FormInput label="SEO Title" name="seoTitle" value={formData.seoTitle} onChange={handleChange} placeholder="e.g. Best Parking Solutions in Nepal" />
                                    <FormTextarea label="SEO Description" name="seoDescription" value={formData.seoDescription} onChange={handleChange} rows="3" placeholder="Brief meta description for search engines..." />
                                </div>
                            )}
                        </FormCard>
                    </div>

                    {/* Right Column: Image */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <FormCard title="Category / Tile Image">
                            <div style={{ 
                                border: '2px dashed #e5e7eb', 
                                borderRadius: '12px', 
                                padding: '24px', 
                                textAlign: 'center', 
                                backgroundColor: '#f9fafb' 
                            }}>
                                {imageFile ? (
                                    <div style={{ marginBottom: '16px' }}>
                                        <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #d1d5db', background: '#fff', padding: '4px' }}>
                                            <img 
                                                src={URL.createObjectURL(imageFile)} 
                                                alt="New Category Preview" 
                                                style={{ width: '100%', maxHeight: '220px', objectFit: 'contain' }} 
                                            />
                                        </div>
                                        <p style={{ fontSize: '12px', color: '#16a34a', marginTop: '8px', fontWeight: '600' }}>✓ New image selected</p>
                                    </div>
                                ) : isEdit && existingImage ? (
                                    <div style={{ marginBottom: '16px' }}>
                                        <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #d1d5db', background: '#fff', padding: '4px' }}>
                                            <img 
                                                src={`${IMG.categories}/${existingImage}`} 
                                                alt="Current Category Image" 
                                                style={{ width: '100%', maxHeight: '220px', objectFit: 'contain' }} 
                                            />
                                        </div>
                                        <p style={{ fontSize: '12px', color: '#4b5563', marginTop: '8px', fontWeight: '500' }}>Current Category Image</p>
                                    </div>
                                ) : (
                                    <div style={{ padding: '20px', color: '#9ca3af', fontSize: '13px' }}>
                                        No image uploaded yet
                                    </div>
                                )}

                                <FormInput type="file" accept="image/*" onChange={handleFileChange} style={{ backgroundColor: 'white' }} />
                                {isEdit && !imageFile && (
                                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                                        Leave blank to keep the current image.
                                    </p>
                                )}
                            </div>
                        </FormCard>
                    </div>

                </form>
            </LoadingOverlay>
        </div>
    );
};

export default CategoryForm;
