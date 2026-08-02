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
const TestimonialForm = () => {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: '',
        companyName: '',
        position: '',
        message: '',
        status: 1
    });
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(isEdit);

    useEffect(() => {
        if (isEdit) {
            const fetchTestimonial = async () => {
                try {
                    const res = await api.get('/admin/testimonials');
                    const current = res.data.data.find(t => Number(t.id) === Number(id));
                    if (current) {
                        setFormData({
                            fullName: current.fullName || '',
                            companyName: current.companyName || '',
                            position: current.position || '',
                            message: current.message || '',
                            status: current.status
                        });
                    }
                } catch (error) {
                    console.error('Failed to fetch testimonial', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchTestimonial();
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
        data.append('fullName', formData.fullName);
        data.append('companyName', formData.companyName);
        data.append('position', formData.position);
        data.append('message', formData.message);
        data.append('status', formData.status);
        
        if (image) {
            data.append('image', image);
        }

        try {
            if (isEdit) {
                await api.put(`/admin/testimonials/${id}`, data);
            } else {
                await api.post('/admin/testimonials', data);
            }
            navigate('/dashboard/testimonials');
        } catch (error) {
            console.error('Failed to save testimonial', error);
            alert('Failed to save testimonial');
        }
    };

    if (loading) return <Loader size="large" />;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ marginBottom: '-24px' }}>
                    <SectionTabs createPath="/dashboard/testimonials/create" listPath="/dashboard/testimonials" entityName="Testimonial" />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <FormButton type="button" variant="secondary" onClick={() => navigate('/dashboard/testimonials')}>Cancel</FormButton>
                    <FormButton type="submit" onClick={handleSubmit} disabled={loading}>{isEdit ? 'Update Testimonial' : 'Save Testimonial'}</FormButton>
                </div>
            </div>

            <LoadingOverlay loading={loading}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: '600px' }}>
                    <FormCard title="Testimonial Information">
                        
                        <FormInput label="Name" name="name" value={formData.name} onChange={handleChange} required />
                        <FormInput label="Company/Role" name="company" value={formData.company} onChange={handleChange} />
                        <FormTextarea label="Message" name="message" value={formData.message} onChange={handleChange} rows="4" required />
                        
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '13px', color: '#4b5563' }}>Upload Photo</label>
                        <div style={{ border: '2px dashed #e5e7eb', borderRadius: '12px', padding: '16px', textAlign: 'center', backgroundColor: '#f9fafb', marginBottom: '16px' }}>
                            <FormInput type="file" accept="image/*" onChange={handleFileChange} style={{ backgroundColor: 'white' }} />
                        </div>
                        
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

export default TestimonialForm;
