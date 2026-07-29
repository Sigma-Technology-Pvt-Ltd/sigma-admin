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
const DownloadForm = () => {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        productId: '',
        status: 1
    });
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const productsRes = await api.get('/admin/products');
                setProducts(productsRes.data.data);
                
                if (isEdit) {
                    const res = await api.get('/admin/downloads');
                    const current = res.data.data.find(d => d.id === parseInt(id));
                    if (current) {
                        setFormData({
                            title: current.title || '',
                            productId: current.productId || '',
                            status: current.status
                        });
                    }
                } else if (productsRes.data.data.length > 0) {
                    setFormData(prev => ({ ...prev, productId: productsRes.data.data[0].id }));
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
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isEdit && !file) {
            alert('File is required for new downloads');
            return;
        }

        const data = new FormData();
        data.append('title', formData.title);
        data.append('productId', formData.productId);
        data.append('status', formData.status);
        
        if (file) {
            data.append('file', file);
        }

        try {
            if (isEdit) {
                await api.put(`/admin/downloads/${id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/admin/downloads', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            navigate('/dashboard/downloads');
        } catch (error) {
            console.error('Failed to save download', error);
            alert('Failed to save download');
        }
    };

    if (loading) return <Loader size="large" />;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ marginBottom: '-24px' }}>
                    <SectionTabs createPath="/dashboard/downloads/create" listPath="/dashboard/downloads" entityName="Download" />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <FormButton type="button" variant="secondary" onClick={() => navigate('/dashboard/downloads')}>Cancel</FormButton>
                    <FormButton type="submit" onClick={handleSubmit} disabled={loading}>{isEdit ? 'Update Download' : 'Save Download'}</FormButton>
                </div>
            </div>

            <LoadingOverlay loading={loading}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: '600px' }}>
                    <FormCard title="Download Information">
                        
                        <FormInput label="Title" name="title" value={formData.title} onChange={handleChange} required />
                        <FormInput label="Type (e.g. PDF, Document)" name="type" value={formData.type} onChange={handleChange} />
                        <FormTextarea label="Summary" name="summary" value={formData.summary} onChange={handleChange} rows="2" />
                        
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '13px', color: '#4b5563' }}>Upload File</label>
                        <div style={{ border: '2px dashed #e5e7eb', borderRadius: '12px', padding: '16px', textAlign: 'center', backgroundColor: '#f9fafb', marginBottom: '16px' }}>
                            <FormInput type="file" onChange={handleFileChange} style={{ backgroundColor: 'white' }} />
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

export default DownloadForm;
