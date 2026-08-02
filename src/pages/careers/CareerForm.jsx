import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';

import Loader from '../../components/Loader';
import LoadingOverlay from '../../components/LoadingOverlay';
import SectionTabs from '../../components/SectionTabs';

import FormCard from '../../components/ui/FormCard';
import FormInput from '../../components/ui/FormInput';
import FormSelect from '../../components/ui/FormSelect';
import FormTextarea from '../../components/ui/FormTextarea';
import FormButton from '../../components/ui/FormButton';
import { FRONTEND_URL, getAdminFrontendUrl } from '../../api/constants';
const CareerForm = () => {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        salary: '',
        deadline: '',
        education: '',
        experience: '',
        noOfVacancy: '',
        type: '',
        summary: '',
        description: '',
        status: 1
    });
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(isEdit);

    useEffect(() => {
        if (isEdit) {
            const fetchInitialData = async () => {
                try {
                    const res = await api.get('/admin/careers');
                    const current = res.data.data.find(c => Number(c.id) === Number(id));
                    if (current) {
                        setFormData({
                            title: current.title || '',
                            salary: current.salary || '',
                            deadline: current.deadline || '',
                            education: current.education || '',
                            experience: current.experience || '',
                            noOfVacancy: current.noOfVacancy || '',
                            type: current.type || '',
                            summary: current.summary || '',
                            description: current.description || '',
                            status: current.status
                        });
                    }
                } catch (error) {
                    console.error('Failed to fetch initial data', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchInitialData();
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
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });
        
        if (image) {
            data.append('image', image);
        }

        try {
            if (isEdit) {
                await api.put(`/admin/careers/${id}`, data);
            } else {
                await api.post('/admin/careers', data);
            }
            navigate('/dashboard/careers');
        } catch (error) {
            console.error('Failed to save career', error);
            alert('Failed to save career');
        }
    };

    const handlePreview = async () => {
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        data.append('contentType', 'career');
        if (image) data.append('image', image);
        try {
            const res = await api.post('/admin/preview', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const frontendUrl = getAdminFrontendUrl();
            window.open(`${frontendUrl}/preview/career/${res.data.previewId}`, '_blank');
        } catch (err) {
            alert('Failed to generate preview');
        }
    };

    if (loading) return <Loader size="large" />;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ marginBottom: '-24px' }}>
                    <SectionTabs createPath="/dashboard/careers/create" listPath="/dashboard/careers" entityName="Career" />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <FormButton type="button" variant="secondary" onClick={() => navigate('/dashboard/careers')}>Cancel</FormButton>
                    <FormButton type="button" onClick={handlePreview} style={{ background: '#f3f4f6', color: '#1f2937' }}>Live Preview</FormButton>
                    <FormButton type="submit" onClick={handleSubmit} disabled={loading}>{isEdit ? 'Update Career' : 'Save Career'}</FormButton>
                </div>
            </div>

            <LoadingOverlay loading={loading}>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <FormCard title="Job Details">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <FormInput label="Job Title" name="title" value={formData.title} onChange={handleChange} required />
                            <FormInput label="Job Type" name="type" value={formData.type} onChange={handleChange} placeholder="e.g. Full Time" />
                            <FormInput label="Salary" name="salary" value={formData.salary} onChange={handleChange} />
                            <FormInput label="Deadline" name="deadline" value={formData.deadline} onChange={handleChange} placeholder="e.g. 30 Nov 2026" />
                            <FormInput label="Education" name="education" value={formData.education} onChange={handleChange} />
                            <FormInput label="Experience" name="experience" value={formData.experience} onChange={handleChange} />
                        </div>
                        <FormInput label="No of Vacancies" name="noOfVacancy" value={formData.noOfVacancy} onChange={handleChange} />
                    </FormCard>

                    <FormCard title="Content">
                        <FormTextarea label="Summary" name="summary" value={formData.summary} onChange={handleChange} rows="2" />
                        <FormTextarea label="Description" name="description" value={formData.description} onChange={handleChange} rows="5" />
                    </FormCard>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <FormCard title="Upload Image">
                        <div style={{ border: '2px dashed #e5e7eb', borderRadius: '12px', padding: '32px', textAlign: 'center', backgroundColor: '#f9fafb' }}>
                            <FormInput type="file" accept="image/*" onChange={handleFileChange} style={{ backgroundColor: 'white' }} />
                        </div>
                    </FormCard>
                    
                    <FormCard title="Status">
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

export default CareerForm;
