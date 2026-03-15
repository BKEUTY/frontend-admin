import React, { useState, useEffect } from 'react';
import {
    Steps, Form, Input, Button, Select, Upload, notification,
    Table, InputNumber, Row, Col, Typography, Empty
} from 'antd';
import {
    PlusOutlined, DeleteOutlined,
    ArrowRightOutlined, CheckCircleOutlined,
    CloudUploadOutlined, ShoppingOutlined,
    SettingOutlined, TableOutlined,
    FileImageOutlined, LoadingOutlined, EyeOutlined, EditOutlined,
    StarFilled, ThunderboltFilled, ClockCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import adminApi from '../../../api/adminApi';
import { getImageUrl } from '../../../api/axiosClient';
import { useLanguage } from '../../../i18n/LanguageContext';
import product_placeholder from '../../../Assets/Images/Products/product_placeholder.svg';
import '../../../pages/Product/ProductDetail.css';
import { CButton, CInput } from '../../Common';
import './ProductCreate.css';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const ProductCreate = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [form] = Form.useForm();
    const [createdProductId, setCreatedProductId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isPreview, setIsPreview] = useState(false);

    const [optionTypes, setOptionTypes] = useState([
        { name: t('admin_product_color'), values: [] }
    ]);

    const [variants, setVariants] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [currentVariant, setCurrentVariant] = useState(null);

    const imageField = Form.useWatch('image', form);
    const previewImage = imageField?.file?.originFileObj ? URL.createObjectURL(imageField.file.originFileObj) : product_placeholder;

    const handleCreateProduct = async (values) => {
        setLoading(true);
        try {
            const payload = {
                name: values.name,
                description: values.description || '',
                productCategories: values.categories ? values.categories.map(Number) : [1],
                image: ''
            };

            const res = await adminApi.createProduct(payload);
            if (res.status === 201 || res.status === 200) {
                const newProduct = res.data;
                setCreatedProductId(newProduct.id);
                notification.success({
                    message: t('success'),
                    description: t('admin_msg_create_success'),
                    key: 'admin_msg_create_success'
                });
                setCurrentStep(1);
            }
        } catch (error) {
            notification.error({
                message: t('error'),
                description: t('admin_error_create'),
                key: 'admin_error_create'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUploadProductImage = async () => {
        if (!createdProductId || !imageField?.file) {
            setCurrentStep(2);
            return;
        }

        setLoading(true);
        try {
            const uploadRes = await adminApi.uploadProductImage(imageField.file.originFileObj, createdProductId);
            if (uploadRes.data && uploadRes.data.url) {
                const imageUrl = uploadRes.data.url;
                await adminApi.updateProduct({
                    id: createdProductId,
                    name: form.getFieldValue('name'),
                    image: imageUrl
                });

                notification.success({
                    message: t('success'),
                    description: t('admin_msg_upload_success'),
                    key: 'admin_msg_upload_success'
                });
                setCurrentStep(2);
            }
        } catch (error) {
            notification.error({
                message: t('error'),
                description: t('admin_error_upload_img'),
                key: 'admin_error_upload_img'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddOptionType = () => {
        setOptionTypes([...optionTypes, { name: '', values: [] }]);
    };

    const handleRemoveOptionType = (index) => {
        const newTypes = [...optionTypes];
        newTypes.splice(index, 1);
        setOptionTypes(newTypes);
    };

    const handleOptionNameChange = (index, val) => {
        const newTypes = [...optionTypes];
        newTypes[index].name = val;
        setOptionTypes(newTypes);
    };

    const handleOptionValuesChange = (index, val) => {
        const newTypes = [...optionTypes];
        newTypes[index].values = val;
        setOptionTypes(newTypes);
    };

    const handleSubmitOptions = async () => {
        if (!createdProductId) return;

        const validOptions = optionTypes.filter(o => o.name && o.name.trim() !== '' && o.values && o.values.length > 0);
        
        if (validOptions.length === 0) {
            notification.error({
                message: t('error'),
                description: t("admin_error_at_least_one_option"),
                key: 'admin_error_at_least_one_option'
            });
            return;
        }

        setLoading(true);
        try {
            const res = await adminApi.createOption({
                productId: createdProductId,
                productOptionValues: validOptions.map(opt => ({
                    optionName: opt.name,
                    optionValues: opt.values
                }))
            });

            if (res.data) {
                setVariants([]);
                const fetchedVariants = res.data;
                const suffixes = [];
                const generateCombinations = (opts, index = 0, currentCombo = []) => {
                    if (index === opts.length) {
                        suffixes.push(currentCombo.join(' - '));
                        return;
                    }
                    for (let val of opts[index].values) {
                        generateCombinations(opts, index + 1, [...currentCombo, val]);
                    }
                };
                generateCombinations(validOptions);

                const mappedVariants = fetchedVariants.map((v, idx) => {
                    const shortName = suffixes[idx] || v.productVariantName || '';
                    return {
                        ...v,
                        displayVariantName: shortName,
                        optionValues: suffixes[idx] ? suffixes[idx].split(' - ') : [],
                    };
                });
                setVariants(mappedVariants);
            }

            notification.success({
                message: t('success'),
                description: t('admin_msg_options_success'),
                key: 'admin_msg_options_success'
            });
            setCurrentStep(3);
        } catch (error) {
            notification.error({
                message: t('error'),
                description: t('admin_error_options_save'),
                key: 'admin_error_options_save'
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchVariants = async (pid) => {
        try {
            const res = await adminApi.getVariants(pid);
            let fetchedVariants = res.data || [];
            const validOptions = optionTypes.filter(o => o.name.trim() !== '' && o.values.length > 0);
            
            if (validOptions.length > 0) {
                const suffixes = [];
                const generateCombinations = (opts, index = 0, currentCombo = []) => {
                    if (index === opts.length) {
                        suffixes.push(currentCombo.join(' - '));
                        return;
                    }
                    for (let val of opts[index].values) {
                        generateCombinations(opts, index + 1, [...currentCombo, val]);
                    }
                };
                generateCombinations(validOptions);

                fetchedVariants = fetchedVariants.map((v, idx) => {
                    const shortName = suffixes[idx] || v.productVariantName || '';
                    return {
                        ...v,
                        displayVariantName: shortName,
                        optionValues: suffixes[idx] ? suffixes[idx].split(' - ') : [],
                    };
                });
            }
            setVariants(fetchedVariants);
        } catch (error) {}
    };

    useEffect(() => {
        if (variants.length > 0 && Object.keys(selectedOptions).length > 0) {
            const match = variants.find(v => {
                if (!v.optionValues || v.optionValues.length === 0) return false;
                return optionTypes.filter(opt => opt.name && opt.values.length > 0).every(opt => {
                    const selectedVal = selectedOptions[opt.name]?.toString().toLowerCase().trim();
                    if (!selectedVal) return true;
                    return v.optionValues.some(vOpt => vOpt?.toString().toLowerCase().trim() === selectedVal);
                });
            });
            setCurrentVariant(match || null);
        }
    }, [selectedOptions, variants, optionTypes]);

    const handleVariantChange = (id, field, value) => {
        setVariants(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
    };

    const handleVariantImageUpload = async (id, file) => {
        try {
            notification.open({
                message: t('loading'),
                description: t('loading'),
                key: 'skuUpload',
                icon: <LoadingOutlined style={{ color: '#1890ff' }} />,
                duration: 0
            });
            const res = await adminApi.uploadSkuImage(file, `variant-${id}`);
            const url = res.data.url;
            handleVariantChange(id, 'image', url);
            handleVariantChange(id, 'productImageUrl', url);
            notification.success({
                message: t('success'),
                description: t('success'),
                key: 'skuUpload'
            });
            return false;
        } catch (error) {
            notification.destroy('skuUpload');
            return false;
        }
    };

    const handleSaveVariants = async () => {
        setLoading(true);
        try {
            await Promise.all(variants.map(v =>
                adminApi.updateVariant({
                    id: v.id,
                    productVariantName: `${form.getFieldValue('name') || v.productName} - ${v.displayVariantName || v.productVariantName}`,
                    price: v.price || 0,
                    stockQuantity: v.stockQuantity || 0,
                    status: 'ACTIVE',
                    productImageUrl: v.image || v.productImageUrl
                })
            ));

            notification.success({
                message: t('success'),
                description: t('admin_msg_variants_success'),
                key: 'admin_msg_variants_success'
            });
            navigate(`/admin/products/${createdProductId}`);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="product-create-container" style={{ paddingBottom: 60 }}>
            <div className="product-header-section">
                <div className="admin-back-btn" onClick={() => navigate('/admin/products')}>
                    <ArrowRightOutlined style={{ transform: 'rotate(180deg)' }} />
                </div>
                <div className="product-header-info">
                    <h2>{t('admin_product_create')}</h2>
                    <p>{t('admin_create_desc')}</p>
                </div>
            </div>

            <div className="steps-wrapper" style={{ marginBottom: 40 }}>
                <Steps
                    current={currentStep}
                    className="modern-steps"
                    responsive={false}
                    direction="horizontal"
                    items={[
                        { title: t('admin_step_1') },
                        { title: t('admin_step_2') },
                        { title: t('admin_step_3') },
                        { title: t('admin_step_4') }
                    ]}
                />
            </div>

            <div className="product-detail-page admin-product-create-preview" style={{ padding: 0, background: 'transparent' }}>
                <div className="product-top-section" style={{ boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)', borderRadius: '8px' }}>
                    <div className="product-gallery">
                        <div className="thumbnail-list">
                            <div className="thumb-item active"><img src={previewImage} alt="thumb" /></div>
                            <div className="thumb-item"><img src={product_placeholder} alt="thumb" /></div>
                            <div className="thumb-item"><img src={product_placeholder} alt="thumb" /></div>
                        </div>
                        <div className="main-image" style={{ padding: 0, border: '1px solid #f9f9f9', background: '#fff', overflow: 'hidden', borderRadius: '8px' }}>
                            {currentStep === 1 ? (
                                <Form.Item name="image" style={{ margin: 0, width: '100%', height: '100%' }} form={form}>
                                    <Upload.Dragger maxCount={1} beforeUpload={() => false} showUploadList={false} className="admin-upload-dragger" style={{ minHeight: '100%', border: 'none', background: 'transparent' }}>
                                        {imageField ? (
                                            <img src={previewImage} alt="product" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        ) : (
                                            <div style={{ padding: '80px 20px', textAlign: 'center' }}>
                                                <CloudUploadOutlined style={{ color: 'var(--admin-primary)', fontSize: 48, marginBottom: 16 }} />
                                                <p style={{ fontSize: 16, fontWeight: 700, color: '#334155' }}>{t('admin_btn_upload')}</p>
                                                <p style={{ color: '#94a3b8' }}>JPG, PNG, WEBP</p>
                                            </div>
                                        )}
                                    </Upload.Dragger>
                                </Form.Item>
                            ) : (
                                <img src={previewImage} alt="product" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            )}
                        </div>
                    </div>

                    <div className="product-info-side">
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                            <div className="brand-label" style={{ marginBottom: 0 }}>BKEUTY</div>
                            <CButton
                                type={isPreview ? "primary" : "outline"}
                                icon={isPreview ? <EditOutlined /> : <EyeOutlined />}
                                onClick={() => setIsPreview(!isPreview)}
                                size="small"
                                style={{ borderRadius: '6px', fontSize: '0.85rem', height: 34, minWidth: 100 }}
                            >
                                {isPreview ? t('admin_btn_edit_mode') : t('admin_btn_preview')}
                            </CButton>
                        </div>

                        {isPreview ? (
                            <div className="preview-content-wrapper" style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                <h1 className="detail-title" style={{ fontSize: '1.75rem', marginBottom: 12, fontWeight: 700 }}>
                                    {form.getFieldValue('name') || t('admin_placeholder_product_name')}
                                </h1>

                                <div className="detail-price" style={{ margin: '20px 0', fontSize: '1.6rem', fontWeight: 700, color: 'var(--color_main_title)', display: 'flex', alignItems: 'baseline', gap: 10 }}>
                                    {(currentVariant ? currentVariant.price : 0).toLocaleString("vi-VN")}đ
                                    <span className="vat-tag" style={{ color: '#999', fontSize: '0.85rem', fontWeight: 400 }}>{t('vat_included')}</span>
                                </div>

                                <div className="product-options-section" style={{ borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
                                    {optionTypes.filter(opt => opt.name && opt.values.length > 0).map((opt, index) => (
                                        <div key={index} className="option-group" style={{ marginBottom: 15 }}>
                                            <span className="option-label" style={{ fontWeight: 600, color: '#475569' }}>{opt.name}:</span>
                                            <div className="size-options" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                                {opt.values.map((v, i) => (
                                                    <button
                                                        key={i}
                                                        className={`size-btn ${selectedOptions[opt.name]?.toString().toLowerCase().trim() === v?.toString().toLowerCase().trim() ? 'active' : ''}`}
                                                        onClick={() => setSelectedOptions(prev => ({ ...prev, [opt.name]: v }))}
                                                        style={{ 
                                                            padding: '8px 16px', 
                                                            borderRadius: '8px', 
                                                            border: '1px solid #e2e8f0', 
                                                            background: selectedOptions[opt.name] === v ? 'var(--color_main_title)' : '#fff',
                                                            color: selectedOptions[opt.name] === v ? '#fff' : '#475569',
                                                            cursor: 'pointer',
                                                            fontWeight: 600,
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        {v}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}

                                    {currentVariant && (
                                        <div className="selected-variant-info" style={{ marginTop: 10, marginBottom: 25, paddingTop: 15, borderTop: '1px solid #f1f5f9' }}>
                                            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>{t('variant_selected_label')}: </span>
                                            <strong style={{ fontSize: '1.05rem', color: 'var(--admin-primary)' }}>
                                                {currentVariant.optionValues ? currentVariant.optionValues.join(' - ') : currentVariant.displayVariantName}
                                            </strong>
                                        </div>
                                    )}

                                    <div className="stock-info" style={{ marginBottom: 20, color: '#475569', fontSize: '0.9rem' }}>
                                        {t('in_stock_label')} <strong style={{ color: '#1e293b' }}>{currentVariant ? currentVariant.stockQuantity : 0}</strong> {t('items_available')}
                                    </div>
                                </div>

                                <div className="actions" style={{ marginTop: 25 }}>
                                    <CButton 
                                        type="primary" 
                                        block 
                                        size="large"
                                        onClick={() => {
                                            notification.info({
                                                message: t('info'),
                                                description: t('admin_preview_mode_msg'),
                                                key: 'preview-mode-msg'
                                            });
                                        }}
                                    >
                                        {t('add_to_cart')}
                                    </CButton>
                                </div>
                            </div>
                        ) : (
                            <div className="edit-content-wrapper" style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                {currentStep === 0 && (
                                    <Form form={form} layout="vertical" onFinish={handleCreateProduct} requiredMark={false} style={{ width: '100%' }}>
                                        <Form.Item name="name" rules={[{ required: true, message: t('admin_error_name_required') }]} style={{ marginBottom: 16 }}>
                                            <Input className="preview-title-input" placeholder={t('admin_placeholder_product_name')} style={{ fontSize: '1.75rem', fontWeight: 700, padding: 0, border: 'none', background: 'transparent', boxShadow: 'none' }} />
                                        </Form.Item>

                                        <Row gutter={24} style={{ marginBottom: 20 }}>
                                            <Col span={24}>
                                                <div style={{ fontWeight: 600, marginBottom: 10, fontSize: '0.95rem' }}>{t('admin_label_category')}</div>
                                                <Form.Item name="categories" rules={[{ required: true, message: t('admin_error_category_required') }]} style={{ marginBottom: 0 }}>
                                                    <Select mode="multiple" className="admin-select-large" placeholder={t('admin_placeholder_categories')} style={{ width: '100%', border: '1px solid #ddd' }}>
                                                        <Option value="1">{t('skincare')}</Option>
                                                        <Option value="2">{t('makeup')}</Option>
                                                        <Option value="3">{t('body_care')}</Option>
                                                        <Option value="4">{t('hair_care')}</Option>
                                                        <Option value="5">{t('fragrance')}</Option>
                                                        <Option value="6">{t('gift_sets')}</Option>
                                                        <Option value="7">{t('cleanser')}</Option>
                                                        <Option value="8">{t('toner')}</Option>
                                                        <Option value="9">{t('serum')}</Option>
                                                        <Option value="10">{t('moisturizer')}</Option>
                                                        <Option value="11">{t('sunscreen')}</Option>
                                                        <Option value="12">{t('makeup_face')}</Option>
                                                        <Option value="13">{t('makeup_lips')}</Option>
                                                        <Option value="14">{t('makeup_eyes')}</Option>
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <div style={{ fontWeight: 600, marginBottom: 10, fontSize: '0.95rem' }}>{t('admin_label_desc')}</div>
                                        <Form.Item name="description" style={{ marginBottom: 30 }}>
                                            <TextArea className="admin-input-textarea" rows={4} placeholder={t('admin_placeholder_desc')} style={{ border: '1px solid #ddd', borderRadius: '4px', boxShadow: 'none' }} />
                                        </Form.Item>

                                        <div className="actions" style={{ marginTop: 'auto' }}>
                                             <CButton type="primary" htmlType="submit" loading={loading} block size="large" className="admin-btn">
                                                 {t('admin_btn_create_continue')} <ArrowRightOutlined style={{ marginLeft: 8 }} />
                                             </CButton>
                                         </div>
                                    </Form>
                                )}

                                {currentStep === 1 && (
                                    <div className="image-upload-step">
                                        <h3 style={{ marginBottom: 20, fontSize: '1.05rem', fontWeight: 600, color: '#333' }}>{t('admin_step_2')}</h3>
                                        <p style={{ color: '#64748b', marginBottom: 25 }}>{t('admin_label_image')}</p>

                                        <div className="actions" style={{ display: 'flex', gap: 15, width: '100%' }}>
                                            <CButton type="secondary" onClick={() => setCurrentStep(0)} style={{ flex: 1 }}>
                                                {t('back')}
                                            </CButton>
                                            <CButton type="primary" onClick={handleUploadProductImage} loading={loading} style={{ flex: 2 }} className="admin-btn">
                                                 {t('admin_btn_upload_continue')} <ArrowRightOutlined style={{ marginLeft: 8 }} />
                                             </CButton>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 2 && (
                                    <div className="product-options-section" style={{ marginTop: 10 }}>
                                        <h3 style={{ marginBottom: 20, fontSize: '1.05rem', fontWeight: 600, color: '#333' }}>{t('admin_step_3')}</h3>
                                        {optionTypes.map((opt, index) => (
                                            <div key={index} className="option-group">
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center', width: '100%' }}>
                                                    <Input
                                                        value={opt.name}
                                                        onChange={(e) => handleOptionNameChange(index, e.target.value)}
                                                        placeholder={t('admin_placeholder_option_name')}
                                                        className="preview-title-input"
                                                        style={{ width: '60%', fontWeight: 700, fontSize: '1rem', padding: 0 }}
                                                    />
                                                    {index > 0 && <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleRemoveOptionType(index)} />}
                                                </div>
                                                <Select
                                                    mode="tags"
                                                    className="admin-select-large"
                                                    placeholder={t('admin_placeholder_option_values_short')}
                                                    style={{ width: '100%' }}
                                                    value={opt.values}
                                                    onChange={(val) => handleOptionValuesChange(index, val)}
                                                    tokenSeparators={[',']}
                                                    open={false}
                                                />
                                            </div>
                                        ))}
                                        <CButton type="dashed" onClick={handleAddOptionType} icon={<PlusOutlined />} style={{ width: '100%', marginTop: 24, marginBottom: 8 }}>
                                            {t('admin_btn_add_option')}
                                        </CButton>

                                        <div className="actions" style={{ display: 'flex', gap: 15, width: '100%', marginTop: 48 }}>
                                            <CButton type="secondary" onClick={() => setCurrentStep(1)} style={{ flex: 1 }}>
                                                {t('back')}
                                            </CButton>
                                            <CButton type="primary" onClick={handleSubmitOptions} loading={loading} style={{ flex: 2 }} className="admin-btn">
                                                 {t('admin_btn_gen_variants')} <ArrowRightOutlined style={{ marginLeft: 8 }} />
                                             </CButton>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 3 && (
                                    <div className="product-variants-edit-section">
                                        <div className="product-variants-section" style={{ marginTop: 24, background: '#ffffff', borderRadius: '20px', padding: '20px', border: '1px solid #f1f5f9' }}>
                                            <h3 style={{ marginBottom: 20, fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>{t('admin_step_4')}</h3>
                                            <div className="custom-scrollbar" style={{ maxHeight: '460px', overflowY: 'auto', paddingRight: 8 }}>
                                                {variants.map(record => (
                                                    <div key={record.id} className="variant-row" style={{ display: 'flex', alignItems: 'center', gap: 16, border: '1px solid #f1f5f9', borderRadius: '12px', padding: '12px 16px', marginBottom: 12 }}>
                                                        <div className="variant-image-upload" style={{ width: 64, height: 64, borderRadius: 12, border: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                            <Upload showUploadList={false} beforeUpload={(file) => handleVariantImageUpload(record.id, file)}>
                                                                {(record.image || record.productImageUrl) ? (
                                                                    <img src={getImageUrl(record.image || record.productImageUrl)} alt="v" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                ) : (
                                                                    <div style={{ textAlign: 'center', color: '#cbd5e1' }}>
                                                                        <FileImageOutlined style={{ fontSize: 20 }} />
                                                                    </div>
                                                                )}
                                                            </Upload>
                                                        </div>
                                                        <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                                                            <div style={{ fontWeight: 600, color: '#333', fontSize: '0.9rem' }}>
                                                                {record.displayVariantName || record.productVariantName}
                                                            </div>
                                                            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                                                                <div style={{ flex: '1 1 120px' }}>
                                                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: 4 }}>{t('admin_label_price')}</div>
                                                                    <InputNumber
                                                                        placeholder={t('admin_placeholder_price')}
                                                                        value={record.price}
                                                                        min={0}
                                                                        style={{ width: '100%', borderRadius: '8px' }}
                                                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                                                        onChange={(val) => handleVariantChange(record.id, 'price', val)}
                                                                    />
                                                                </div>
                                                                <div style={{ flex: '1 1 100px' }}>
                                                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: 4 }}>{t('admin_label_stock')}</div>
                                                                    <InputNumber
                                                                        placeholder={t('admin_placeholder_stock')}
                                                                        value={record.stockQuantity}
                                                                        min={0}
                                                                        style={{ width: '100%', borderRadius: '8px' }}
                                                                        onChange={(val) => handleVariantChange(record.id, 'stockQuantity', val)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="actions" style={{ display: 'flex', gap: 15, width: '100%', paddingTop: 20, marginTop: 48 }}>
                                            <CButton type="secondary" onClick={() => setCurrentStep(2)} style={{ flex: 1 }}>
                                                {t('back')}
                                            </CButton>
                                            <CButton type="primary" onClick={handleSaveVariants} loading={loading} style={{ flex: 2 }} className="admin-btn">
                                                 <CheckCircleOutlined style={{ marginRight: 8 }} /> {t('admin_btn_save_finish')}
                                             </CButton>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCreate;
