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
const BannerForm = () => {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();

    const bannerTypes = [
        "Left Banner Design", 
        "Middle Banner Design", 
        "Bottom Banner Design", 
        "Middle Offer Banner", 
        "Side Offer Banner"
    ];

    const [formData, setFormData] = useState({
        title: '',
        type: bannerTypes[0],
        links: '',
        subtitle: '',
        status: 1
    });
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(isEdit);

    useEffect(() => {
        if (isEdit) {
            const fetchBanner = async () => {
                try {
                    const res = await api.get('/admin/banners');
                    const current = res.data.data.find(b => Number(b.id) === Number(id));
                    if (current) {
                        setFormData({
                            title: current.title || '',
                            type: current.type || bannerTypes[0],
                            links: current.links || '',
                            subtitle: current.subtitle || '',
                            status: current.status
                        });
                    }
                } catch (error) {
                    console.error('Failed to fetch banner', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchBanner();
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
        data.append('type', formData.type);
        data.append('links', formData.links);
        data.append('subtitle', formData.subtitle);
        data.append('status', formData.status);
        
        if (image) {
            data.append('image', image);
        }

        try {
            if (isEdit) {
                await api.put(`/admin/banners/${id}`, data);
            } else {
                await api.post('/admin/banners', data);
            }
            navigate('/dashboard/banners');
        } catch (error) {
            console.error('Failed to save banner', error);
            alert('Failed to save banner');
        }
    };

    if (loading) return <Loader size="large" />;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ marginBottom: '-24px' }}>
                    <SectionTabs createPath="/dashboard/banners/create" listPath="/dashboard/banners" entityName="Banner" />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <FormButton type="button" variant="secondary" onClick={() => navigate('/dashboard/banners')}>Cancel</FormButton>
                    <FormButton type="submit" onClick={handleSubmit} disabled={loading}>{isEdit ? 'Update Banner' : 'Save Banner'}</FormButton>
                </div>
            </div>

            <LoadingOverlay loading={loading}>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
                
                <FormCard title="Banner Information">
                    <FormInput label="Title" name="title" value={formData.title} onChange={handleChange} required />
                    <FormTextarea label="Summary" name="summary" value={formData.summary} onChange={handleChange} rows="2" />
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
                
            </form>
            </LoadingOverlay>
        </div>
    );
};

export default BannerForm;
