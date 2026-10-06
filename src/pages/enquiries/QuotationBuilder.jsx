import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import FormCard from '../../components/ui/FormCard';
import FormInput from '../../components/ui/FormInput';
import FormTextarea from '../../components/ui/FormTextarea';
import FormButton from '../../components/ui/FormButton';
import { DEFAULT_QUOTATION_TERMS, SIGMA_COMPANY_PROFILE, getInitialTerms } from '../../utils/quotationTerms';
import { numberToWords, formatCurrency } from '../../utils/numberToWords';
import { downloadQuotationPdf, getQuotationPdfBlobUrl } from '../../utils/sigmaQuotationPdf';
import { Plus, Trash2, Download, Eye, Save, ArrowLeft, Check, Sparkles, X, ChevronDown, ChevronUp, Lock, Upload } from 'lucide-react';

const QuotationBuilder = () => {
    const { id, quoteId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

    // Products & Categories for item picker
    const [categories, setCategories] = useState([]);
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
    const [allProducts, setAllProducts] = useState([]);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [categoryName, setCategoryName] = useState('');

    // Generate random unique quotation number: e.g. SIGMA-QT-8510
    const generateRandomQuoteNumber = () => `SIGMA-QT-${Math.floor(1000 + Math.random() * 9000)}`;

    // Quotation Form State
    const [quotationNumber, setQuotationNumber] = useState(generateRandomQuoteNumber);
    const [date, setDate] = useState(new Date().toLocaleDateString('en-GB'));
    const [validity, setValidity] = useState('30 Days');
    const [deliveryTime, setDeliveryTime] = useState('2-3 Working Weeks');
    const [projectTitle, setProjectTitle] = useState('Quotation for Sigma Engineering Solutions');

    const [enquiryId, setEnquiryId] = useState(id || null);
    const [customer, setCustomer] = useState({
        name: '',
        phone: '',
        email: '',
        company: '',
        address: 'Site Delivery / Ex-Works'
    });

    const [enquiryRemarks, setEnquiryRemarks] = useState('');
    const [remarks, setRemarks] = useState('');

    // If quotation originates from an enquiry or has an associated enquiryId, lock customer fields
    const isCustomerLocked = Boolean(id || enquiryId);

    // Line items
    const [items, setItems] = useState([
        { id: 1, description: '', qty: 1, unitPrice: 0, amount: 0 }
    ]);

    // VAT & Calculations
    const [isVatApplicable, setIsVatApplicable] = useState(true);

    // Authorized Signature (Base64 image)
    const [authorizedSignature, setAuthorizedSignature] = useState(() => {
        return localStorage.getItem('sigma_authorized_signature') || '';
    });

    // Terms & Conditions with nested selection & dynamic numbering
    const [terms, setTerms] = useState(getInitialTerms);
    const [expandedTerms, setExpandedTerms] = useState({ validity: true, pricing: true, payment: true });
    const [newClauseTitle, setNewClauseTitle] = useState('');
    const [newClauseText, setNewClauseText] = useState('');

    // Initial Data Fetch
    useEffect(() => {
        const init = async () => {
            try {
                // 1. Fetch next quotation number if not editing
                if (!quoteId) {
                    const nextRes = await api.get('/admin/quotations/next-number').catch(() => null);
                    if (nextRes?.data?.quotationNumber) {
                        setQuotationNumber(nextRes.data.quotationNumber);
                    }
                }

                // 2. Fetch categories and all products
                const [catRes, prodRes] = await Promise.all([
                    api.get('/admin/categories').catch(() => ({ data: { data: [] } })),
                    api.get('/admin/products').catch(() => ({ data: { data: [] } }))
                ]);
                const loadedCats = catRes.data?.data || [];
                const loadedProds = prodRes.data?.data || [];
                setCategories(loadedCats);
                setAllProducts(loadedProds);

                // 3. If editing saved quotation
                if (quoteId) {
                    const qRes = await api.get(`/admin/quotations/${quoteId}`);
                    const q = qRes.data?.data;
                    if (q) {
                        setQuotationNumber(q.quotationNumber);
                        setDate(q.date);
                        setValidity(q.validity);
                        setDeliveryTime(q.deliveryTime);
                        setProjectTitle(q.projectTitle);
                        setCustomer(q.customer || {});
                        setItems(q.items || []);
                        setIsVatApplicable(q.isVatApplicable !== false);
                        setRemarks(q.remarks || '');
                        if (q.enquiryId) {
                            setEnquiryId(q.enquiryId);
                        }
                        if (q.enquiryRemarks) {
                            setEnquiryRemarks(q.enquiryRemarks);
                        } else if (q.enquiryId) {
                            api.get(`/admin/enquiries/${q.enquiryId}`).then(enqRes => {
                                if (enqRes.data?.data?.remarks) {
                                    setEnquiryRemarks(enqRes.data.data.remarks);
                                }
                            }).catch(() => {});
                        }
                        if (q.authorizedSignature) {
                            setAuthorizedSignature(q.authorizedSignature);
                        }
                        if (q.terms && q.terms.length > 0) {
                            setTerms(q.terms.map(t => ({
                                ...t,
                                selected: t.selected !== false,
                                subclauses: Array.isArray(t.subclauses)
                                    ? t.subclauses.map(s => typeof s === 'object' ? { ...s, selected: s.selected !== false } : { text: s, selected: true })
                                    : []
                            })));
                        }
                    }
                }
                // 4. If creating quotation from an Enquiry
                else if (id) {
                    setEnquiryId(id);
                    const enqRes = await api.get(`/admin/enquiries/${id}`);
                    const enq = enqRes.data?.data;
                    if (enq) {
                        setCustomer({
                            name: enq.name || '',
                            phone: enq.phoneNumber || '',
                            email: enq.email || '',
                            company: '',
                            address: 'Site Delivery / Ex-Works'
                        });
                        setEnquiryRemarks(enq.remarks || '');
                        setRemarks(`RFQ No: ENQ-${enq.id} / Quotation Notes`);

                        if (enq.product) {
                            setProjectTitle(`Quotation for ${enq.product.title}`);
                            const price = Number(enq.product.price || enq.product.salePrice || 0);
                            setItems([
                                {
                                    id: 1,
                                    description: `${enq.product.title} ${enq.product.summary ? `— ${enq.product.summary}` : ''}`.trim(),
                                    qty: 1,
                                    unitPrice: price,
                                    amount: price
                                }
                            ]);
                        }

                        if (enq.category) {
                            setCategoryName(enq.category.title);
                            setSelectedCategoryFilter(String(enq.category.id));
                        }

                        if (enq.relatedProducts && enq.relatedProducts.length > 0) {
                            setRelatedProducts(enq.relatedProducts);
                        }
                    }
                }
            } catch (err) {
                console.error('Failed to initialize quotation builder', err);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [id, quoteId]);

    // Line items manipulation
    const handleItemChange = (index, field, value) => {
        setItems(prev => {
            const updated = [...prev];
            const current = { ...updated[index], [field]: value };
            
            const q = field === 'qty' ? Number(value) : Number(current.qty || 0);
            const p = field === 'unitPrice' ? Number(value) : Number(current.unitPrice || 0);
            current.amount = q * p;

            updated[index] = current;
            return updated;
        });
    };

    const handleSelectProduct = (index, productId) => {
        const prod = allProducts.find(p => String(p.id) === String(productId));
        if (prod) {
            const price = Number(prod.price || prod.salePrice || 0);
            setItems(prev => {
                const updated = [...prev];
                const current = { ...updated[index] };
                current.description = prod.title;
                current.unitPrice = price;
                current.amount = Number(current.qty || 1) * price;
                updated[index] = current;
                return updated;
            });
        }
    };

    const handleAddQuickProduct = (prod) => {
        const price = Number(prod.price || prod.salePrice || 0);
        setItems(prev => [
            ...prev,
            {
                id: Date.now(),
                description: prod.title,
                qty: 1,
                unitPrice: price,
                amount: price
            }
        ]);
    };

    const handleAddItem = () => {
        setItems(prev => [
            ...prev,
            { id: Date.now(), description: '', qty: 1, unitPrice: 0, amount: 0 }
        ]);
    };

    const handleRemoveItem = (index) => {
        if (items.length <= 1) {
            setItems([{ id: Date.now(), description: '', qty: 1, unitPrice: 0, amount: 0 }]);
            return;
        }
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    // Calculations
    const subtotal = items.reduce((sum, it) => sum + Number(it.amount || 0), 0);
    const vatAmount = isVatApplicable ? subtotal * 0.13 : 0;
    const grandTotal = subtotal + vatAmount;
    const words = numberToWords(grandTotal);

    // Nested Terms Toggles
    const handleToggleMasterTerm = (index) => {
        setTerms(prev => {
            const updated = [...prev];
            const current = { ...updated[index] };
            const newSelected = !current.selected;
            current.selected = newSelected;
            if (Array.isArray(current.subclauses)) {
                current.subclauses = current.subclauses.map(sub => ({
                    ...sub,
                    selected: newSelected
                }));
            }
            updated[index] = current;
            return updated;
        });
    };

    const handleToggleSubclause = (termIndex, subIndex) => {
        setTerms(prev => {
            const updated = [...prev];
            const term = { ...updated[termIndex] };
            const subclauses = [...term.subclauses];
            const sub = { ...subclauses[subIndex] };
            sub.selected = !sub.selected;
            subclauses[subIndex] = sub;
            term.subclauses = subclauses;

            // If at least one subclause is selected, master is selected; otherwise unselected
            term.selected = subclauses.some(s => s.selected);

            updated[termIndex] = term;
            return updated;
        });
    };

    const toggleExpandTerm = (termId) => {
        setExpandedTerms(prev => ({
            ...prev,
            [termId]: !prev[termId]
        }));
    };

    const handleAddCustomClause = (e) => {
        e.preventDefault();
        if (!newClauseTitle.trim()) return;
        const newId = `custom-${Date.now()}`;
        setTerms(prev => [
            ...prev,
            {
                id: newId,
                title: newClauseTitle.trim(),
                text: newClauseText.trim() || 'As per mutual agreement between client and Sigma Technologies.',
                selected: true,
                subclauses: newClauseText.trim() ? [
                    {
                        id: `${newId}-a`,
                        text: newClauseText.trim(),
                        selected: true
                    }
                ] : []
            }
        ]);
        setExpandedTerms(prev => ({ ...prev, [newId]: true }));
        setNewClauseTitle('');
        setNewClauseText('');
    };

    // Filter only active terms and active subclauses for PDF / Save
    const activeTerms = terms
        .filter(t => t.selected !== false)
        .map(t => ({
            ...t,
            subclauses: Array.isArray(t.subclauses)
                ? t.subclauses.filter(s => (typeof s === 'object' ? s.selected !== false : true))
                : []
        }))
        .filter(t => (t.subclauses && t.subclauses.length > 0) || (t.text && t.text.trim()));

    // Signature Upload Handlers
    const handleSignatureUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            alert('Signature image size should be less than 2MB');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result;
            setAuthorizedSignature(base64);
            try {
                localStorage.setItem('sigma_authorized_signature', base64);
            } catch (err) {}
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveSignature = () => {
        setAuthorizedSignature('');
        try {
            localStorage.removeItem('sigma_authorized_signature');
        } catch (err) {}
    };

    const getQuotationPayload = () => ({
        id: quoteId || undefined,
        enquiryId: enquiryId || id || null,
        enquiryRemarks: enquiryRemarks || '',
        quotationNumber,
        date,
        validity,
        deliveryTime,
        projectTitle,
        customer,
        items,
        subtotal,
        isVatApplicable,
        vatAmount,
        grandTotal,
        amountInWords: words,
        terms: activeTerms,
        remarks,
        authorizedSignature,
        company: SIGMA_COMPANY_PROFILE
    });

    // Handle Actions
    const handleDownload = () => {
        const payload = getQuotationPayload();
        const cleanQtNumber = (quotationNumber || '').replace(/^SIGMA-QT-?/i, '') || `${Math.floor(1000 + Math.random() * 9000)}`;
        const fileName = `Sigma-QT-${cleanQtNumber}.pdf`;
        downloadQuotationPdf(payload, fileName);
    };

    const handlePreview = () => {
        const payload = getQuotationPayload();
        const url = getQuotationPdfBlobUrl(payload);
        setPreviewUrl(url);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = getQuotationPayload();
            await api.post('/admin/quotations', payload);
            alert(`Quotation ${quotationNumber} saved successfully!`);
            navigate('/dashboard/quotations');
        } catch (err) {
            console.error('Failed to save quotation', err);
            alert('Failed to save quotation. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Loader size="large" />;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>
            
            {/* Header / Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        onClick={() => navigate('/dashboard/enquiries')}
                        style={{
                            background: '#f3f4f6',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#374151'
                        }}
                    >
                        <ArrowLeft size={16} /> Back
                    </button>
                    <div>
                        <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                            Quotation Builder
                        </h1>
                        <p style={{ fontSize: '13px', color: '#6b7280', margin: '2px 0 0' }}>
                            Reference: <strong style={{ color: '#1a4b9c' }}>{quotationNumber}</strong>
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={handlePreview}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '9px 16px',
                            backgroundColor: '#fff',
                            color: '#1a4b9c',
                            border: '1px solid #1a4b9c',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        <Eye size={16} /> Preview PDF
                    </button>

                    <button
                        onClick={handleDownload}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '9px 18px',
                            backgroundColor: '#1a4b9c',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(26, 75, 156, 0.25)'
                        }}
                    >
                        <Download size={16} /> Download Quotation PDF
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '9px 18px',
                            backgroundColor: '#16a34a',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        <Save size={16} /> {saving ? 'Saving...' : 'Save Quotation'}
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: '24px', alignItems: 'start' }}>
                
                {/* ── Left Column: Items, Pricing, Terms ────────────────────────── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* Project Subject & Metadata */}
                    <FormCard title="1. Quotation Details & Subject">
                        <FormInput 
                            label="Subject / Project Title" 
                            value={projectTitle} 
                            onChange={(e) => setProjectTitle(e.target.value)} 
                            placeholder="e.g. Quotation for Multi-Level Car Parking Solutions" 
                            required 
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '14px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#4b5563', marginBottom: '8px' }}>
                                    Quotation Number
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type="text" 
                                        value={quotationNumber} 
                                        readOnly 
                                        disabled
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px 12px 36px',
                                            borderRadius: '8px',
                                            border: '1px solid transparent',
                                            backgroundColor: '#f3f4f6',
                                            color: '#1f2937',
                                            fontSize: '14px',
                                            fontWeight: '700',
                                            letterSpacing: '0.5px',
                                            boxSizing: 'border-box',
                                            cursor: 'not-allowed'
                                        }}
                                    />
                                    <Lock size={14} color="#6b7280" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                </div>
                            </div>
                            <FormInput 
                                label="Quotation Date" 
                                value={date} 
                                onChange={(e) => setDate(e.target.value)} 
                                placeholder="DD/MM/YYYY" 
                            />
                            <FormInput 
                                label="Validity Period" 
                                value={validity} 
                                onChange={(e) => setValidity(e.target.value)} 
                                placeholder="30 Days" 
                            />
                        </div>
                    </FormCard>

                    {/* Category Selector & Quick-Add Products */}
                    <div style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '14px 16px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Sparkles size={16} color="#1a4b9c" />
                                <strong style={{ fontSize: '13px', color: '#1e293b' }}>
                                    Browse Products by Category
                                </strong>
                            </div>
                            <select
                                value={selectedCategoryFilter}
                                onChange={(e) => {
                                    const catId = e.target.value;
                                    setSelectedCategoryFilter(catId);
                                    if (catId) {
                                        const cat = categories.find(c => String(c.id) === String(catId));
                                        setCategoryName(cat ? cat.title : '');
                                        const matching = allProducts.filter(p => String(p.categoryId) === String(catId));
                                        setRelatedProducts(matching);
                                    } else {
                                        setRelatedProducts([]);
                                        setCategoryName('');
                                    }
                                }}
                                style={{
                                    padding: '7px 12px',
                                    borderRadius: '6px',
                                    border: '1px solid #cbd5e1',
                                    fontSize: '12.5px',
                                    color: '#1e293b',
                                    backgroundColor: '#fff',
                                    cursor: 'pointer',
                                    minWidth: '220px'
                                }}
                            >
                                <option value="">-- Filter Products by Category --</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.title}</option>
                                ))}
                            </select>
                        </div>

                        {/* Chips of products in selected category */}
                        {relatedProducts.length > 0 ? (
                            <div>
                                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>
                                    Click any product to add it as a line-item in the quotation:
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '140px', overflowY: 'auto' }}>
                                    {relatedProducts.map(rp => (
                                        <button
                                            key={rp.id}
                                            type="button"
                                            onClick={() => handleAddQuickProduct(rp)}
                                            style={{
                                                background: '#fff',
                                                border: '1px solid #bfdbfe',
                                                borderRadius: '6px',
                                                padding: '6px 10px',
                                                fontSize: '12px',
                                                color: '#1a4b9c',
                                                fontWeight: '500',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px',
                                                transition: 'background-color 0.15s'
                                            }}
                                            title={`Add "${rp.title}" to quotation`}
                                        >
                                            <Plus size={12} /> {rp.title} {rp.price ? `(NPR ${formatCurrency(rp.price)})` : ''}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                                Select a category above (e.g. Parking Solutions, Heating) to quickly browse and add equipment with pre-filled prices.
                            </p>
                        )}
                    </div>

                    {/* Items & Scope Table */}
                    <FormCard title="2. Quotation Items & Scope of Supply">
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                                        <th style={{ padding: '10px 8px', width: '35px', textAlign: 'center' }}>SN</th>
                                        <th style={{ padding: '10px 8px' }}>Product / Service Description</th>
                                        <th style={{ padding: '10px 8px', width: '75px', textAlign: 'center' }}>Qty</th>
                                        <th style={{ padding: '10px 8px', width: '140px', textAlign: 'right' }}>Unit Price (NPR)</th>
                                        <th style={{ padding: '10px 8px', width: '140px', textAlign: 'right' }}>Amount (NPR)</th>
                                        <th style={{ padding: '10px 8px', width: '40px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, idx) => (
                                        <tr key={item.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold', color: '#64748b' }}>
                                                {idx + 1}
                                            </td>
                                            <td style={{ padding: '8px' }}>
                                                {item.description ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                                <Check size={12} strokeWidth={3} /> Selected Item
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    handleItemChange(idx, 'description', '');
                                                                    handleItemChange(idx, 'productId', '');
                                                                }}
                                                                style={{
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    color: '#1a4b9c',
                                                                    fontSize: '11px',
                                                                    fontWeight: '600',
                                                                    cursor: 'pointer',
                                                                    textDecoration: 'underline',
                                                                    padding: '0 2px'
                                                                }}
                                                            >
                                                                Change / Pick from Catalog
                                                            </button>
                                                        </div>
                                                        <textarea
                                                            rows="2"
                                                            value={item.description}
                                                            onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                                                            placeholder="Product name, model, and specifications..."
                                                            style={{
                                                                width: '100%',
                                                                padding: '6px 8px',
                                                                borderRadius: '6px',
                                                                border: '1px solid #d1d5db',
                                                                fontSize: '12.5px',
                                                                color: '#1e293b',
                                                                resize: 'vertical',
                                                                boxSizing: 'border-box'
                                                            }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <select
                                                            value={item.productId || ''}
                                                            onChange={(e) => {
                                                                if (e.target.value === '__custom__') {
                                                                    handleItemChange(idx, 'description', 'Custom Item / Service');
                                                                } else if (e.target.value) {
                                                                    handleSelectProduct(idx, e.target.value);
                                                                }
                                                            }}
                                                            style={{
                                                                width: '100%',
                                                                padding: '8px 10px',
                                                                borderRadius: '6px',
                                                                border: '1px solid #cbd5e1',
                                                                fontSize: '12.5px',
                                                                color: '#1e293b',
                                                                background: '#fff',
                                                                boxSizing: 'border-box'
                                                            }}
                                                        >
                                                            <option value="">-- Select Product / Service from Catalog --</option>
                                                            {allProducts.map(p => (
                                                                <option key={p.id} value={p.id}>
                                                                    {p.title} {p.price || p.salePrice ? `(NPR ${formatCurrency(p.price || p.salePrice)})` : ''}
                                                                </option>
                                                            ))}
                                                            <option value="__custom__">✍ Type Custom Item / Service...</option>
                                                        </select>
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ padding: '8px' }}>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.qty}
                                                    onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '6px 4px',
                                                        textAlign: 'center',
                                                        borderRadius: '6px',
                                                        border: '1px solid #d1d5db',
                                                        boxSizing: 'border-box'
                                                    }}
                                                />
                                            </td>
                                            <td style={{ padding: '8px' }}>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={item.unitPrice}
                                                    onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '6px 8px',
                                                        textAlign: 'right',
                                                        borderRadius: '6px',
                                                        border: '1px solid #d1d5db',
                                                        boxSizing: 'border-box'
                                                    }}
                                                />
                                            </td>
                                            <td style={{ padding: '8px', textAlign: 'right', fontWeight: '600', color: '#1e293b' }}>
                                                {formatCurrency(item.amount)}
                                            </td>
                                            <td style={{ padding: '8px', textAlign: 'center' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem(idx)}
                                                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                                                    title="Remove item"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <button
                                type="button"
                                onClick={handleAddItem}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '7px 14px',
                                    background: '#f1f5f9',
                                    color: '#1e293b',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                <Plus size={14} /> Add Line Item
                            </button>

                            {/* Live Subtotal */}
                            <div style={{ fontSize: '14px', color: '#475569' }}>
                                Sub Total: <strong style={{ color: '#0f172a', fontSize: '15px' }}>NPR {formatCurrency(subtotal)}</strong>
                            </div>
                        </div>
                    </FormCard>

                    {/* Commercial Terms & Conditions */}
                    <FormCard title="3. Commercial Terms & Conditions">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <span style={{ fontSize: '13px', color: '#64748b' }}>
                                Select standard commercial terms and conditions included in this quotation.
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    const allOpen = Object.keys(expandedTerms).length === terms.length;
                                    if (allOpen) {
                                        setExpandedTerms({});
                                    } else {
                                        const allMap = {};
                                        terms.forEach(t => { allMap[t.id] = true; });
                                        setExpandedTerms(allMap);
                                    }
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#1a4b9c',
                                    fontSize: '11.5px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    whiteSpace: 'nowrap',
                                    marginLeft: '12px'
                                }}
                            >
                                {Object.keys(expandedTerms).length === terms.length ? 'Collapse All' : 'Expand All Subclauses'}
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {terms.map((term, termIdx) => {
                                const isExpanded = expandedTerms[term.id] ?? false;
                                const subclauses = term.subclauses || [];
                                const activeSubsCount = subclauses.filter(s => s.selected).length;

                                return (
                                    <div
                                        key={term.id || termIdx}
                                        style={{
                                            borderRadius: '8px',
                                            border: term.selected ? '1.5px solid #1a4b9c' : '1px solid #e2e8f0',
                                            backgroundColor: term.selected ? '#f8fafc' : '#ffffff',
                                            overflow: 'hidden',
                                            transition: 'border-color 0.15s'
                                        }}
                                    >
                                        {/* Master Clause Header */}
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '10px 14px',
                                                background: term.selected ? '#f1f5f9' : '#fff',
                                                borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none'
                                            }}
                                        >
                                            <div 
                                                onClick={() => handleToggleMasterTerm(termIdx)}
                                                style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1 }}
                                            >
                                                <div style={{
                                                    width: '18px',
                                                    height: '18px',
                                                    borderRadius: '4px',
                                                    border: term.selected ? 'none' : '2px solid #cbd5e1',
                                                    backgroundColor: term.selected ? '#1a4b9c' : '#fff',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0
                                                }}>
                                                    {term.selected && <Check size={12} color="#fff" strokeWidth={3} />}
                                                </div>
                                                <div>
                                                    <span style={{ fontWeight: '700', fontSize: '13px', color: term.selected ? '#1a4b9c' : '#334155' }}>
                                                        {term.title}
                                                    </span>
                                                    {subclauses.length > 0 && (
                                                        <span style={{
                                                            marginLeft: '8px',
                                                            fontSize: '11px',
                                                            padding: '1px 6px',
                                                            borderRadius: '10px',
                                                            background: term.selected ? '#dbeafe' : '#f1f5f9',
                                                            color: term.selected ? '#1d4ed8' : '#64748b',
                                                            fontWeight: '600'
                                                        }}>
                                                            {activeSubsCount} / {subclauses.length} active
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Expand / Collapse Button */}
                                            {subclauses.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => toggleExpandTerm(term.id)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: '#64748b',
                                                        cursor: 'pointer',
                                                        padding: '4px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        fontSize: '11.5px'
                                                    }}
                                                    title={isExpanded ? 'Collapse subclauses' : 'Expand subclauses'}
                                                >
                                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                </button>
                                            )}
                                        </div>

                                        {/* Nested Subclauses List */}
                                        {isExpanded && subclauses.length > 0 && (
                                            <div style={{ padding: '8px 14px 12px 36px', display: 'flex', flexDirection: 'column', gap: '8px', background: '#fff' }}>
                                                {subclauses.map((sub, subIdx) => {
                                                    const letters = ['a.', 'b.', 'c.', 'd.', 'e.', 'f.', 'g.'];
                                                    const letter = letters[subIdx] || '•';

                                                    return (
                                                        <div
                                                            key={sub.id || subIdx}
                                                            onClick={() => handleToggleSubclause(termIdx, subIdx)}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'flex-start',
                                                                gap: '8px',
                                                                cursor: 'pointer',
                                                                padding: '6px 8px',
                                                                borderRadius: '6px',
                                                                backgroundColor: sub.selected ? '#f8fafc' : 'transparent',
                                                                border: sub.selected ? '1px solid #e2e8f0' : '1px solid transparent'
                                                            }}
                                                        >
                                                            <div style={{
                                                                width: '15px',
                                                                height: '15px',
                                                                borderRadius: '3px',
                                                                border: sub.selected ? 'none' : '1.5px solid #94a3b8',
                                                                backgroundColor: sub.selected ? '#2563eb' : '#fff',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                marginTop: '2px',
                                                                flexShrink: 0
                                                            }}>
                                                                {sub.selected && <Check size={10} color="#fff" strokeWidth={3} />}
                                                            </div>
                                                            <div style={{ flex: 1, fontSize: '12px', lineHeight: '1.45', color: sub.selected ? '#1e293b' : '#94a3b8' }}>
                                                                <strong style={{ color: sub.selected ? '#1a4b9c' : '#94a3b8', marginRight: '4px' }}>
                                                                    {letter}
                                                                </strong>
                                                                {sub.text}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Fallback text if no subclauses */}
                                        {isExpanded && subclauses.length === 0 && (
                                            <div style={{ padding: '8px 14px 12px 36px', fontSize: '12px', color: '#475569' }}>
                                                {term.text}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Add Custom Clause */}
                        <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px dashed #e2e8f0' }}>
                            <strong style={{ fontSize: '13px', color: '#1e293b' }}>+ Add Custom Clause:</strong>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '10px', marginTop: '8px' }}>
                                <input
                                    type="text"
                                    placeholder="Clause title (e.g. Extended AMC Support)"
                                    value={newClauseTitle}
                                    onChange={(e) => setNewClauseTitle(e.target.value)}
                                    style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12.5px' }}
                                />
                                <input
                                    type="text"
                                    placeholder="Clause text details..."
                                    value={newClauseText}
                                    onChange={(e) => setNewClauseText(e.target.value)}
                                    style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12.5px' }}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddCustomClause}
                                    style={{ padding: '7px 14px', background: '#1a4b9c', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    Add Clause
                                </button>
                            </div>
                        </div>
                    </FormCard>

                </div>

                {/* ── Right Column: Customer Info, Calculations, Notes ──────────── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* Customer Information Card */}
                    <FormCard 
                        title={
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                <span>Customer & Client Details</span>
                                {isCustomerLocked && (
                                    <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '12px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        <Lock size={10} /> Locked from Lead
                                    </span>
                                )}
                            </div>
                        }
                    >
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                                Customer Name / Organization {isCustomerLocked && <span style={{ color: '#94a3b8', fontSize: '11px' }}>(Locked)</span>}
                            </label>
                            <input 
                                type="text" 
                                value={customer.name} 
                                onChange={(e) => setCustomer(prev => ({ ...prev, name: e.target.value }))} 
                                placeholder="e.g. Bottlers Nepal Limited" 
                                readOnly={isCustomerLocked}
                                disabled={isCustomerLocked}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    backgroundColor: isCustomerLocked ? '#f8fafc' : '#fff',
                                    color: isCustomerLocked ? '#475569' : '#1e293b',
                                    fontSize: '13.5px',
                                    boxSizing: 'border-box',
                                    cursor: isCustomerLocked ? 'not-allowed' : 'text'
                                }}
                                required 
                            />
                        </div>

                        <div style={{ marginTop: '12px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                                Phone Number {isCustomerLocked && <span style={{ color: '#94a3b8', fontSize: '11px' }}>(Locked)</span>}
                            </label>
                            <input 
                                type="text" 
                                value={customer.phone} 
                                onChange={(e) => setCustomer(prev => ({ ...prev, phone: e.target.value }))} 
                                placeholder="e.g. +977-9820151533" 
                                readOnly={isCustomerLocked}
                                disabled={isCustomerLocked}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    backgroundColor: isCustomerLocked ? '#f8fafc' : '#fff',
                                    color: isCustomerLocked ? '#475569' : '#1e293b',
                                    fontSize: '13.5px',
                                    boxSizing: 'border-box',
                                    cursor: isCustomerLocked ? 'not-allowed' : 'text'
                                }}
                            />
                        </div>

                        <div style={{ marginTop: '12px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                                Email Address {isCustomerLocked && <span style={{ color: '#94a3b8', fontSize: '11px' }}>(Locked)</span>}
                            </label>
                            <input 
                                type="text" 
                                value={customer.email} 
                                onChange={(e) => setCustomer(prev => ({ ...prev, email: e.target.value }))} 
                                placeholder="e.g. client@company.com.np" 
                                readOnly={isCustomerLocked}
                                disabled={isCustomerLocked}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    backgroundColor: isCustomerLocked ? '#f8fafc' : '#fff',
                                    color: isCustomerLocked ? '#475569' : '#1e293b',
                                    fontSize: '13.5px',
                                    boxSizing: 'border-box',
                                    cursor: isCustomerLocked ? 'not-allowed' : 'text'
                                }}
                            />
                        </div>

                        <div style={{ marginTop: '12px' }}>
                            <FormInput 
                                label="Site / Delivery Location" 
                                value={customer.address} 
                                onChange={(e) => setCustomer(prev => ({ ...prev, address: e.target.value }))} 
                                placeholder="e.g. Site Delivery / Ex-Works" 
                            />
                        </div>

                        {/* Customer's Original Enquiry Request / Message (Locked) */}
                        {enquiryRemarks && (
                            <div style={{
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                padding: '12px',
                                marginTop: '14px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                                    <Lock size={11} /> Client's Original Enquiry Message (Locked):
                                </div>
                                <div style={{ fontSize: '12.5px', color: '#1e293b', fontStyle: 'italic', marginTop: '4px', lineHeight: '1.4' }}>
                                    "{enquiryRemarks}"
                                </div>
                            </div>
                        )}
                    </FormCard>

                    {/* Calculations Summary Card */}
                    <FormCard title="Financial Summary">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', color: '#475569' }}>
                                <span>Sub Total:</span>
                                <strong>NPR {formatCurrency(subtotal)}</strong>
                            </div>

                            {/* VAT Toggle */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '10px 12px',
                                background: '#f8fafc',
                                borderRadius: '6px',
                                border: '1px solid #e2e8f0'
                            }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#1e293b', fontWeight: '500' }}>
                                    <input 
                                        type="checkbox"
                                        checked={isVatApplicable}
                                        onChange={(e) => setIsVatApplicable(e.target.checked)}
                                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                    />
                                    Apply 13% VAT
                                </label>
                                <span style={{ fontWeight: '600', color: isVatApplicable ? '#1e293b' : '#94a3b8' }}>
                                    NPR {formatCurrency(vatAmount)}
                                </span>
                            </div>

                            {/* Grand Total Highlight */}
                            <div style={{
                                backgroundColor: '#1a4b9c',
                                color: '#ffffff',
                                padding: '14px',
                                borderRadius: '8px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: '4px'
                            }}>
                                <div>
                                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.9 }}>
                                        Grand Total (NPR)
                                    </div>
                                    <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                                        NPR {formatCurrency(grandTotal)}
                                    </div>
                                </div>
                            </div>

                            {/* Live Amount in Words */}
                            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 12px' }}>
                                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>
                                    Amount in Words:
                                </div>
                                <div style={{ fontSize: '12px', color: '#1e293b', fontStyle: 'italic', marginTop: '2px' }}>
                                    {words}
                                </div>
                            </div>
                        </div>
                    </FormCard>

                    {/* Delivery Timeline & Remarks Card */}
                    <FormCard title="Delivery & Notes">
                        <FormInput 
                            label="Estimated Delivery Timeline" 
                            value={deliveryTime} 
                            onChange={(e) => setDeliveryTime(e.target.value)} 
                            placeholder="e.g. 2-3 Working Weeks" 
                        />
                        <FormTextarea 
                            label="Special Notes & Remarks" 
                            value={remarks} 
                            onChange={(e) => setRemarks(e.target.value)} 
                            rows="3" 
                            placeholder="e.g. Scope includes 1-year warranty and commissioning at site." 
                        />
                    </FormCard>

                    {/* Authorized Signature & Stamp Card */}
                    <FormCard title="Authorized Signature & Stamp">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                                Digital signature or official company stamp (PNG / JPG).
                            </p>

                            {authorizedSignature ? (
                                <div style={{
                                    border: '1px solid #bbf7d0',
                                    background: '#f0fdf4',
                                    borderRadius: '8px',
                                    padding: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '12px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '90px',
                                            height: '45px',
                                            background: '#ffffff',
                                            border: '1px solid #86efac',
                                            borderRadius: '6px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: 'hidden',
                                            padding: '4px'
                                        }}>
                                            <img 
                                                src={authorizedSignature} 
                                                alt="Authorized Signature" 
                                                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                            />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#166534', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Check size={13} strokeWidth={3} /> Signature Attached
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleRemoveSignature}
                                        style={{
                                            background: '#fee2e2',
                                            color: '#b91c1c',
                                            border: '1px solid #fca5a5',
                                            borderRadius: '6px',
                                            padding: '6px 10px',
                                            fontSize: '11.5px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                    >
                                        <Trash2 size={13} /> Remove
                                    </button>
                                </div>
                            ) : (
                                <div style={{
                                    border: '2px dashed #cbd5e1',
                                    borderRadius: '8px',
                                    padding: '18px 12px',
                                    textAlign: 'center',
                                    background: '#f8fafc',
                                    position: 'relative'
                                }}>
                                    <input 
                                        type="file"
                                        accept="image/png, image/jpeg, image/jpg"
                                        onChange={handleSignatureUpload}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            opacity: 0,
                                            cursor: 'pointer'
                                        }}
                                    />
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                        <div style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '50%',
                                            background: '#e0e7ff',
                                            color: '#1a4b9c',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Upload size={18} />
                                        </div>
                                        <span style={{ fontSize: '12.5px', fontWeight: '600', color: '#1e293b' }}>
                                            Upload Signature Image
                                        </span>
                                        <span style={{ fontSize: '11px', color: '#64748b' }}>
                                            PNG or JPG (Transparent PNG recommended)
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </FormCard>

                </div>

            </div>

            {/* ── Live PDF Modal Preview ────────────────────────────────────────── */}
            {previewUrl && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div style={{
                        backgroundColor: '#fff',
                        width: '900px',
                        height: '90vh',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                    }}>
                        <div style={{
                            padding: '12px 20px',
                            background: '#1a4b9c',
                            color: '#fff',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <strong style={{ fontSize: '15px' }}>
                                Quotation Preview: {quotationNumber}
                            </strong>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={handleDownload}
                                    style={{
                                        background: '#fff',
                                        color: '#1a4b9c',
                                        border: 'none',
                                        padding: '5px 12px',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    <Download size={14} /> Download PDF
                                </button>
                                <button
                                    onClick={() => setPreviewUrl(null)}
                                    style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <iframe 
                            src={previewUrl}
                            style={{ width: '100%', height: '100%', border: 'none' }}
                            title="Quotation PDF Preview"
                        />
                    </div>
                </div>
            )}

        </div>
    );
};

export default QuotationBuilder;
