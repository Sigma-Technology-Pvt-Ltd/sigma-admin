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
const FaqForm = () => {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();

    const [faqTypes, setFaqTypes] = useState([]);
    const [formData, setFormData] = useState({
        typeId: '',
        question: '',
        answer: '',
        status: 1
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const typesRes = await api.get('/admin/faqs/types');
                setFaqTypes(typesRes.data.data);
                
                if (isEdit) {
                    const res = await api.get('/admin/faqs');
                    const current = res.data.data.find(f => Number(f.id) === Number(id));
                    if (current) {
                        setFormData({
                            typeId: current.typeId || '',
                            question: current.question || '',
                            answer: current.answer || '',
                            status: current.status
                        });
                    }
                } else if (typesRes.data.data.length > 0) {
                    setFormData(prev => ({ ...prev, typeId: typesRes.data.data[0].id }));
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (isEdit) {
                await api.put(`/admin/faqs/${id}`, formData);
            } else {
                await api.post('/admin/faqs', formData);
            }
            navigate('/dashboard/faqs');
        } catch (error) {
            console.error('Failed to save FAQ', error);
            alert('Failed to save FAQ');
        }
    };

    if (loading) return <Loader size="large" />;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ marginBottom: '-24px' }}>
                    <SectionTabs createPath="/dashboard/faqs/create" listPath="/dashboard/faqs" entityName="FAQ" />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <FormButton type="button" variant="secondary" onClick={() => navigate('/dashboard/faqs')}>Cancel</FormButton>
                    <FormButton type="submit" onClick={handleSubmit} disabled={loading}>{isEdit ? 'Update FAQ' : 'Save FAQ'}</FormButton>
                </div>
            </div>

            <LoadingOverlay loading={loading}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: '600px' }}>
                    <FormCard title="FAQ Information">
                        
                        <FormInput label="Question" name="question" value={formData.question} onChange={handleChange} required />
                        <FormTextarea label="Answer" name="answer" value={formData.answer} onChange={handleChange} rows="5" required />
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

export default FaqForm;
