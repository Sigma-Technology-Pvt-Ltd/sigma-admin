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
import { FRONTEND_URL, getAdminFrontendUrl, getAdminBackendUrl } from '../../api/constants';
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
        seoDescription: '',
        price: '',
        salePrice: '',
        specification: ''
    });
    
    // EDIT mode: uploaded downloads fetched from server
    const [downloads, setDownloads] = useState([]);

    // CREATE mode: locally-staged files (not yet uploaded)
    const [stagedDownloads, setStagedDownloads] = useState([]); // [{ title, file }]
    const [stagedTitle, setStagedTitle] = useState('');
    const [stagedFile, setStagedFile] = useState(null);

    // EDIT mode: new file upload state
    const [downloadTitle, setDownloadTitle] = useState('');
    const [downloadFile, setDownloadFile] = useState(null);
    
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEdit);
    const [uploadWarnings, setUploadWarnings] = useState([]); // failed staged uploads after creation

    const [existingProduct, setExistingProduct] = useState(null);
    const [showSeo, setShowSeo] = useState(false);

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
                const current = res.data.data.find(p => Number(p.id) === Number(id));
                if (current) {
                    setExistingProduct(current);
                    if (current.seoTitle || current.seoDescription) {
                        setShowSeo(true);
                    }
                    setFormData({
                        title: current.title,
                        categoryId: current.categoryId || '',
                        summary: current.summary || '',
                        description: current.description || '',
                        status: current.status,
                        seoTitle: current.seoTitle || '',
                        seoDescription: current.seoDescription || '',
                        price: current.price || '',
                        salePrice: current.salePrice || '',
                        specification: current.specification || ''
                    });
                }
            } catch (err) {
                console.error(err);
            } finally {
                setInitialLoading(false);
            }
        };

        const fetchDownloads = async () => {
            try {
                const res = await api.get('/admin/downloads');
                setDownloads(res.data.data.filter(d => Number(d.productId) === Number(id)));
            } catch (err) {
                console.error(err);
            }
        };

        fetchCategories();
        if (isEdit) {
            fetchProduct();
            fetchDownloads();
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

    // ── CREATE MODE: stage a download locally ──────────────────────────────────
    const handleStageDownload = () => {
        if (!stagedFile) return alert('Please select a file');
        setStagedDownloads(prev => [...prev, { title: stagedTitle || stagedFile.name, file: stagedFile }]);
        setStagedTitle('');
        setStagedFile(null);
        document.getElementById('stagedFileInput').value = '';
    };

    const handleRemoveStaged = (index) => {
        setStagedDownloads(prev => prev.filter((_, i) => i !== index));
    };

    // ── EDIT MODE: immediately upload a download ───────────────────────────────
    const handleDownloadUpload = async () => {
        if (!downloadFile) return alert('Please select a file');
        setLoading(true);
        const data = new FormData();
        data.append('productId', id);
        data.append('title', downloadTitle || downloadFile.name);
        data.append('file', downloadFile);
        
        try {
            await api.post('/admin/downloads', data);
            const res = await api.get('/admin/downloads');
            setDownloads(res.data.data.filter(d => Number(d.productId) === Number(id)));
            setDownloadTitle('');
            setDownloadFile(null);
            document.getElementById('downloadFileInput').value = '';
        } catch (err) {
            console.error(err);
            alert('Upload failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDownload = async (downloadId) => {
        if (!window.confirm('Are you sure you want to delete this file?')) return;
        setLoading(true);
        try {
            await api.delete(`/admin/downloads/${downloadId}`);
            setDownloads(prev => prev.filter(d => d.id !== downloadId));
        } catch (err) {
            console.error(err);
            alert('Delete failed');
        } finally {
            setLoading(false);
        }
    };

    // ── SUBMIT ─────────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setUploadWarnings([]);

        const data = new FormData();
        data.append('title', formData.title);
        data.append('categoryId', formData.categoryId);
        data.append('summary', formData.summary);
        data.append('description', formData.description);
        data.append('status', formData.status);
        data.append('seoTitle', formData.seoTitle);
        data.append('seoDescription', formData.seoDescription);
        data.append('price', formData.price);
        data.append('salePrice', formData.salePrice);
        data.append('specification', formData.specification);
        
        if (imageFile) {
            data.append('image', imageFile);
        }

        try {
            if (isEdit) {
                await api.put(`/admin/products/${id}`, data);
                navigate('/dashboard/products');
            } else {
                // CREATE: save product, then upload any staged downloads
                const res = await api.post('/admin/products', data);
                const newProductId = res.data?.data?.id || res.data?.id;

                if (newProductId && stagedDownloads.length > 0) {
                    const failures = [];
                    for (const staged of stagedDownloads) {
                        const dlData = new FormData();
                        dlData.append('productId', newProductId);
                        dlData.append('title', staged.title);
                        dlData.append('file', staged.file);
                        try {
                            await api.post('/admin/downloads', dlData);
                        } catch (dlErr) {
                            console.error(`Download upload failed for "${staged.title}":`, dlErr);
                            failures.push(staged.title);
                        }
                    }
                    if (failures.length > 0) {
                        setUploadWarnings(failures);
                        setLoading(false);
                        // Don't navigate away — show warning so admin can retry in edit mode
                        alert(`Product saved! However, ${failures.length} download(s) failed to upload:\n• ${failures.join('\n• ')}\n\nYou can retry them by editing the product.`);
                    }
                }
                navigate('/dashboard/products');
            }
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
        data.append('price', formData.price);
        data.append('salePrice', formData.salePrice);
        data.append('specification', formData.specification);
        if (imageFile) {
            data.append('image', imageFile);
        } else if (existingProduct?.image) {
            data.append('existingImage', existingProduct.image);
        }
        if (isEdit && downloads.length > 0) {
            data.append('downloads', JSON.stringify(downloads));
        } else if (!isEdit && stagedDownloads.length > 0) {
            data.append('downloads', JSON.stringify(stagedDownloads.map(s => ({ title: s.title, original_filename: s.file.name }))));
        }

        try {
            const res = await api.post('/admin/preview', data);
            const previewId = res.data.previewId;
            const frontendUrl = getAdminFrontendUrl();
            window.open(`${frontendUrl}/preview/${previewId}`, '_blank');
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
                        <FormInput type="number" label="Price" name="price" value={formData.price} onChange={handleChange} />
                        <FormInput type="number" label="Sale Price (optional)" name="salePrice" value={formData.salePrice} onChange={handleChange} />
                        <FormTextarea label="Summary" name="summary" value={formData.summary} onChange={handleChange} rows="2" />
                        <FormTextarea label="Description" name="description" value={formData.description} onChange={handleChange} rows="5" />
                        <FormTextarea label="Specification" name="specification" value={formData.specification} onChange={handleChange} rows="5" />
                    </FormCard>

                    <FormCard title="Product Status">
                        <FormSelect label="Status" name="status" value={formData.status} onChange={handleChange}>
                            <option value={1}>Active</option>
                            <option value={0}>Inactive</option>
                        </FormSelect>
                    </FormCard>

                    {/* Collapsible SEO Meta Settings Card */}
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
                                <strong style={{ fontSize: '16px', color: '#1f2937' }}>Search Engine Optimization (SEO)</strong>
                                <span style={{ fontSize: '12px', color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: '12px', fontWeight: '500' }}>Optional</span>
                            </div>
                            <span style={{ fontSize: '14px', color: '#6b7280', transition: 'transform 0.2s', transform: showSeo ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                ▼
                            </span>
                        </div>

                        {showSeo && (
                            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
                                {/* Live Google Search Result Preview */}
                                <div style={{ 
                                    background: '#f9fafb', 
                                    border: '1px solid #e5e7eb', 
                                    borderRadius: '10px', 
                                    padding: '16px', 
                                    marginBottom: '20px' 
                                }}>
                                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280', fontWeight: '700', marginBottom: '8px' }}>
                                        Google Search Result Preview
                                    </div>
                                    <div style={{ fontSize: '18px', color: '#1a0dab', fontWeight: '500', textDecoration: 'underline', marginBottom: '2px', wordBreak: 'break-word' }}>
                                        {formData.seoTitle || formData.title || 'Product Title Placeholder'} | Sigma Technologies
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#006621', marginBottom: '4px' }}>
                                        https://sigmatechnologies.com.np › products › {(formData.title || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#545454', lineHeight: '1.4', wordBreak: 'break-word' }}>
                                        {formData.seoDescription || formData.summary || (formData.description ? formData.description.replace(/<[^>]*>?/gm, '').slice(0, 150) + '...' : 'Add a custom meta description to improve click-through rates from search engines.')}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Meta Title</label>
                                            <span style={{ fontSize: '12px', color: formData.seoTitle.length > 60 ? '#dc2626' : '#6b7280' }}>
                                                {formData.seoTitle.length}/60 chars
                                            </span>
                                        </div>
                                        <FormInput 
                                            name="seoTitle" 
                                            value={formData.seoTitle} 
                                            onChange={handleChange} 
                                            placeholder="Leave blank to use default Product Title" 
                                        />
                                    </div>

                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Meta Description</label>
                                            <span style={{ fontSize: '12px', color: formData.seoDescription.length > 160 ? '#dc2626' : '#6b7280' }}>
                                                {formData.seoDescription.length}/160 chars
                                            </span>
                                        </div>
                                        <FormTextarea 
                                            name="seoDescription" 
                                            value={formData.seoDescription} 
                                            onChange={handleChange} 
                                            rows="3" 
                                            placeholder="Leave blank to use default summary/description" 
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
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
                            padding: '24px', 
                            textAlign: 'center',
                            backgroundColor: '#f9fafb'
                        }}>
                            {imageFile ? (
                                <div style={{ marginBottom: '16px' }}>
                                    <img 
                                        src={URL.createObjectURL(imageFile)} 
                                        alt="New Upload Preview" 
                                        style={{ maxWidth: '140px', maxHeight: '140px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #d1d5db', padding: '4px', background: '#fff' }} 
                                    />
                                    <p style={{ fontSize: '12px', color: '#16a34a', marginTop: '6px', fontWeight: '600' }}>✓ New image selected</p>
                                </div>
                            ) : isEdit && existingProduct?.image ? (
                                <div style={{ marginBottom: '16px' }}>
                                    <img 
                                        src={`${getAdminBackendUrl()}/images/products/${existingProduct.image}`} 
                                        alt="Current Product Image" 
                                        style={{ maxWidth: '140px', maxHeight: '140px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #d1d5db', padding: '4px', background: '#fff' }} 
                                    />
                                    <p style={{ fontSize: '12px', color: '#4b5563', marginTop: '6px', fontWeight: '500' }}>Current Product Image</p>
                                </div>
                            ) : null}
                            <FormInput type="file" accept="image/*" onChange={handleFileChange} style={{ backgroundColor: 'white' }} />
                            {isEdit && !imageFile && <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>Leave blank to keep existing image</p>}
                        </div>
                    </FormCard>

                    {/* Downloads Section — shown in both CREATE and EDIT mode */}
                    <FormCard title="Product Downloads">
                        {isEdit ? (
                            /* ── EDIT MODE: live upload/delete ── */
                            <>
                                <div style={{ marginBottom: '16px' }}>
                                    <strong>Existing Downloads:</strong>
                                    {downloads.length === 0 ? <p style={{ color: '#6b7280', marginTop: '8px' }}>No files uploaded yet.</p> : (
                                        <ul style={{ listStyle: 'none', padding: 0, marginTop: '8px' }}>
                                            {downloads.map(d => (
                                                <li key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb', borderRadius: '6px', marginBottom: '6px' }}>
                                                    <a
                                                        href={`${getAdminBackendUrl()}/images/documents/${d.filename}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        style={{ fontSize: '14px', color: '#2563eb', textDecoration: 'none', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                        title="Click to open/view document file"
                                                    >
                                                        📄 {d.title || d.originalFilename || d.filename} ↗
                                                    </a>
                                                    <button type="button" onClick={() => handleDeleteDownload(d.id)} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Delete</button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <hr style={{ margin: '16px 0', borderColor: '#e5e7eb' }} />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <strong>Upload New File:</strong>
                                    <FormInput label="Title (optional)" value={downloadTitle} onChange={e => setDownloadTitle(e.target.value)} placeholder="Leave blank to use filename" />
                                    <input type="file" id="downloadFileInput" accept=".pdf,.doc,.docx,.jpg,.png" onChange={e => setDownloadFile(e.target.files[0])} style={{ padding: '8px', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                                    <FormButton type="button" onClick={handleDownloadUpload} disabled={!downloadFile} style={{ marginTop: '8px' }}>Upload File</FormButton>
                                </div>
                            </>
                        ) : (
                            /* ── CREATE MODE: stage files locally, uploaded on submit ── */
                            <>
                                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
                                    Add download files now — they'll be uploaded automatically when you save the product.
                                </p>

                                {/* Staged file list */}
                                {stagedDownloads.length > 0 && (
                                    <ul style={{ listStyle: 'none', padding: 0, marginBottom: '12px' }}>
                                        {stagedDownloads.map((s, i) => (
                                            <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: '#f0fdf4', borderRadius: '6px', marginBottom: '6px', border: '1px solid #bbf7d0' }}>
                                                <span style={{ fontSize: '13px' }}>📄 {s.title}</span>
                                                <button type="button" onClick={() => handleRemoveStaged(i)} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>✕ Remove</button>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <FormInput label="Title (optional)" value={stagedTitle} onChange={e => setStagedTitle(e.target.value)} placeholder="Leave blank to use filename" />
                                    <input type="file" id="stagedFileInput" accept=".pdf,.doc,.docx,.jpg,.png" onChange={e => setStagedFile(e.target.files[0])} style={{ padding: '8px', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                                    <FormButton type="button" onClick={handleStageDownload} disabled={!stagedFile} style={{ marginTop: '4px' }}>
                                        + Add to List
                                    </FormButton>
                                </div>
                            </>
                        )}
                    </FormCard>
                </div>
            </form>
            </LoadingOverlay>

        </div>
    );
};

export default ProductForm;
