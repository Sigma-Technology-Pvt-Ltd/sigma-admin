import React, { useState, useEffect } from 'react';
import SectionTabs from '../../components/SectionTabs';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import LoadingOverlay from '../../components/LoadingOverlay';
import FormCard from '../../components/ui/FormCard';
import FormInput from '../../components/ui/FormInput';
import FormSelect from '../../components/ui/FormSelect';
import FormButton from '../../components/ui/FormButton';
import { IMG } from '../../api/constants';
import { ExternalLink } from 'lucide-react';

const BANNER_POSITIONS = [
    { group: '🏠 Homepage Hero Section', options: [
        { value: 'Left Banner Design', label: 'Hero Left Banner (Main Tall Card)' },
        { value: 'Middle Banner Design', label: 'Hero Top-Right Box (Small Card)' },
        { value: 'Bottom Banner Design', label: 'Hero Bottom Banner (Wide Horizontal Card)' }
    ]},
    { group: '🔥 Homepage Special Offers', options: [
        { value: 'Side Offer Banner', label: 'Special Offer (Side Card)' },
        { value: 'Middle Offer Banner', label: 'Special Offer (Center Highlight Box)' }
    ]},
    { group: 'ℹ️ About Us & Inner Pages', options: [
        { value: 'About Us Banner', label: 'About Us — Visual Showcase Banner' },
        { value: 'Global Header Banner', label: 'Inner Pages — Top Header Background' }
    ]}
];

const BannerForm = () => {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        type: 'Left Banner Design',
        links: '',
        subtitle: '',
        status: 1
    });
    const [existingImage, setExistingImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEdit);

    // Data lists for link dropdown selection
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        let isMounted = true;

        const loadBannerData = async () => {
            if (!isEdit) {
                setInitialLoading(false);
                return;
            }

            try {
                let current = null;
                // Try fetching directly by ID first
                try {
                    const singleRes = await api.get(`/admin/banners/${id}`);
                    current = singleRes.data?.data;
                } catch (singleErr) {
                    // Fallback to searching all banners
                    const allRes = await api.get('/admin/banners');
                    const allList = allRes.data?.data || [];
                    current = allList.find(b => String(b.id) === String(id));
                }

                if (current && isMounted) {
                    setFormData({
                        title: current.title || '',
                        type: current.type || 'Left Banner Design',
                        links: current.links || '',
                        subtitle: current.subtitle || '',
                        status: current.status !== undefined ? current.status : 1
                    });
                    setExistingImage(current.image || null);
                }
            } catch (err) {
                console.error('Failed to load banner details', err);
            } finally {
                if (isMounted) setInitialLoading(false);
            }
        };

        const loadLookups = async () => {
            try {
                const [catRes, prodRes] = await Promise.all([
                    api.get('/admin/categories').catch(() => ({ data: { data: [] } })),
                    api.get('/admin/products').catch(() => ({ data: { data: [] } }))
                ]);
                if (isMounted) {
                    setCategories(catRes.data?.data || []);
                    setProducts(prodRes.data?.data || []);
                }
            } catch (err) {
                console.warn('Could not load categories or products for dropdown', err);
            }
        };

        loadBannerData();
        loadLookups();

        return () => {
            isMounted = false;
        };
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

    // When user selects category/product from dropdown, auto-fill URL
    const handleDestinationSelect = (e) => {
        const val = e.target.value;
        if (val && val !== 'custom') {
            setFormData(prev => ({ ...prev, links: val }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append('title', formData.title);
        data.append('type', formData.type);
        data.append('links', formData.links);
        data.append('subtitle', formData.subtitle);
        data.append('status', formData.status);
        
        if (imageFile) {
            data.append('image', imageFile);
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
        } finally {
            setLoading(false);
        }
    };

    // Check if current type is in predefined list, otherwise add dynamically
    const allPredefinedTypes = BANNER_POSITIONS.flatMap(g => g.options.map(o => o.value));
    const isCustomType = formData.type && !allPredefinedTypes.includes(formData.type);

    // Group categories cleanly for destination dropdown
    const mainCategories = categories.filter(c => !c.parentCategory || c.parentCategory === '' || c.parentCategory === '0' || c.parentCategory === null);
    const subCategories = categories.filter(c => c.parentCategory && c.parentCategory !== '' && c.parentCategory !== '0' && c.parentCategory !== null);
    const sortedProducts = [...products].sort((a, b) => (a.title || '').localeCompare(b.title || ''));

    // Check if current URL matches any known item
    const isMatchedUrl = [
        ...categories.map(c => `/product-category/${c.slug}/products`),
        ...products.map(p => `/product/${p.slug}`)
    ].includes(formData.links);

    const dropdownValue = isMatchedUrl ? formData.links : (formData.links ? 'custom' : '');

    if (initialLoading) return <Loader size="large" />;

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
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', alignItems: 'start' }}>
                    
                    {/* Left Column: Target Page, Title, Links, Status */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <FormCard title="Banner Details & Placement">
                            <FormSelect label="Banner Placement / Position" name="type" value={formData.type} onChange={handleChange} required>
                                {BANNER_POSITIONS.map(group => (
                                    <optgroup key={group.group} label={group.group}>
                                        {group.options.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </optgroup>
                                ))}
                                {isCustomType && (
                                    <optgroup label="Custom / Existing Placement">
                                        <option value={formData.type}>{formData.type}</option>
                                    </optgroup>
                                )}
                            </FormSelect>

                            <FormInput 
                                label="Banner Title / Headline" 
                                name="title" 
                                value={formData.title} 
                                onChange={handleChange} 
                                placeholder="e.g. Modern Residential Heating & Water Solutions" 
                                required 
                            />

                            {/* Button Text (CTA) */}
                            <div>
                                <FormInput 
                                    label="Button Text (Call to Action)" 
                                    name="subtitle" 
                                    value={formData.subtitle} 
                                    onChange={handleChange} 
                                    placeholder="Shop Now (default)" 
                                />
                                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px', lineHeight: '1.4' }}>
                                    Text displayed on the button (e.g. "Shop Now", "Explore Products", "Learn More"). Defaults to "Shop Now" if left blank.
                                </div>
                            </div>

                            <FormSelect label="Status" name="status" value={formData.status} onChange={handleChange}>
                                <option value={1}>Active</option>
                                <option value={0}>Inactive</option>
                            </FormSelect>
                        </FormCard>

                        {/* Destination & URL Picker */}
                        <FormCard title="Banner Click Destination">
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '13px', color: '#4b5563' }}>
                                    Select Destination (Auto-fills URL)
                                </label>
                                <select
                                    value={dropdownValue}
                                    onChange={handleDestinationSelect}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '8px',
                                        border: '1px solid #d1d5db',
                                        backgroundColor: '#f9fafb',
                                        fontSize: '14px',
                                        color: '#1f2937',
                                        outline: 'none',
                                        cursor: 'pointer',
                                        transition: 'border-color 0.2s'
                                    }}
                                >
                                    <option value="">-- Choose Category, Subcategory or Product --</option>
                                    
                                    {mainCategories.length > 0 && (
                                        <optgroup label="📁 Main Categories">
                                            {mainCategories.map(cat => (
                                                <option key={`main-${cat.id}`} value={`/product-category/${cat.slug}/products`}>
                                                    {cat.title}
                                                </option>
                                            ))}
                                        </optgroup>
                                    )}

                                    {subCategories.length > 0 && (
                                        <optgroup label="🏷️ Sub-Categories">
                                            {subCategories.map(cat => (
                                                <option key={`sub-${cat.id}`} value={`/product-category/${cat.slug}/products`}>
                                                    {cat.title}
                                                </option>
                                            ))}
                                        </optgroup>
                                    )}

                                    {sortedProducts.length > 0 && (
                                        <optgroup label={`📦 Specific Products (${sortedProducts.length} Items)`}>
                                            {sortedProducts.map(prod => (
                                                <option key={`prod-${prod.id}`} value={`/product/${prod.slug}`}>
                                                    {prod.title}
                                                </option>
                                            ))}
                                        </optgroup>
                                    )}

                                    <optgroup label="🔗 Other">
                                        <option value="custom">✏️ Custom URL / External Link</option>
                                    </optgroup>
                                </select>
                            </div>

                            {/* Direct URL Input */}
                            <div style={{ marginTop: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <label style={{ fontWeight: '500', fontSize: '13px', color: '#4b5563', margin: 0 }}>
                                        Redirect URL / Link
                                    </label>
                                    {formData.links && (
                                        <a 
                                            href={formData.links.startsWith('http') ? formData.links : `https://sigmatechnologies.com.np${formData.links.startsWith('/') ? formData.links : '/' + formData.links}`} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            style={{ 
                                                fontSize: '12px', 
                                                color: '#6d28d9', 
                                                display: 'inline-flex', 
                                                alignItems: 'center', 
                                                gap: '4px', 
                                                textDecoration: 'none', 
                                                fontWeight: '600' 
                                            }}
                                        >
                                            <span>Test Link</span>
                                            <ExternalLink size={12} />
                                        </a>
                                    )}
                                </div>
                                <FormInput 
                                    name="links" 
                                    value={formData.links} 
                                    onChange={handleChange} 
                                    placeholder="e.g. /product-category/water-filtration/products" 
                                />
                                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px', lineHeight: '1.4' }}>
                                    Selecting from the dropdown above auto-fills this URL. You can also edit it or enter a custom link manually.
                                </div>
                            </div>
                        </FormCard>
                    </div>

                    {/* Right Column: Banner Image & Live Preview */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <FormCard title="Banner Image">
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
                                                alt="New Banner Preview" 
                                                style={{ width: '100%', maxHeight: '200px', objectFit: 'contain' }} 
                                            />
                                        </div>
                                        <p style={{ fontSize: '12px', color: '#16a34a', marginTop: '8px', fontWeight: '600' }}>✓ New banner image selected</p>
                                    </div>
                                ) : isEdit && existingImage ? (
                                    <div style={{ marginBottom: '16px' }}>
                                        <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #d1d5db', background: '#fff', padding: '4px' }}>
                                            <img 
                                                src={`${IMG.banners}/${existingImage}`} 
                                                alt="Current Banner" 
                                                style={{ width: '100%', maxHeight: '200px', objectFit: 'contain' }} 
                                            />
                                        </div>
                                        <p style={{ fontSize: '12px', color: '#4b5563', marginTop: '8px', fontWeight: '500' }}>Current Live Banner Image</p>
                                    </div>
                                ) : null}

                                <FormInput type="file" accept="image/*" onChange={handleFileChange} style={{ backgroundColor: 'white' }} />
                                {isEdit && !imageFile && (
                                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                                        Leave blank to keep the current banner image.
                                    </p>
                                )}
                                <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px' }}>
                                    Formats: JPG, PNG, WebP. Optimized automatically via Sharp.
                                </p>
                            </div>
                        </FormCard>
                    </div>
                    
                </form>
            </LoadingOverlay>
        </div>
    );
};

export default BannerForm;
