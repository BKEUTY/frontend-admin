import React, { useState, useEffect } from 'react';
import { Steps, Form, Select, Upload, notification, InputNumber, Row, Col, Space } from 'antd';
import {
    PlusOutlined, DeleteOutlined, CheckCircleOutlined,
    CloudUploadOutlined, FileImageOutlined, LoadingOutlined, EyeOutlined, EditOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import adminApi from '../../../api/adminApi';
import { getImageUrl } from '../../../api/axiosClient';
import { useLanguage } from '../../../i18n/LanguageContext';
import { CButton, CInput } from '../../Common';
import { generateSlug } from '../../../utils/helpers';
import './ProductCreate.css';

import dummy1 from '../../../Assets/Images/Products/product_dummy_1.jpg';
import dummy2 from '../../../Assets/Images/Products/product_dummy_2.jpg';
import dummy3 from '../../../Assets/Images/Products/product_dummy_3.jpg';
import dummy4 from '../../../Assets/Images/Products/product_dummy_4.jpg';
import dummy5 from '../../../Assets/Images/Products/product_dummy_5.svg';

const dummyImages = [dummy1, dummy2, dummy3, dummy4, dummy5];
const getRandomImage = () => dummyImages[Math.floor(Math.random() * dummyImages.length)];

const { Option } = Select;

const ProductCreate = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [form] = Form.useForm();
    const [createdProductId, setCreatedProductId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isPreview, setIsPreview] = useState(false);
    const [categories, setCategories] = useState([]);
    const [optionTypes, setOptionTypes] = useState([{ name: '', values: [] }]);
    const [variants, setVariants] = useState([]);
    
    const [fallbackImg] = useState(getRandomImage());

    const formName = Form.useWatch('name', form);
    const formDescription = Form.useWatch('description', form);
    const formCategories = Form.useWatch('categories', form);
    const imageField = Form.useWatch('image', form);
    const previewImage = imageField?.file?.originFileObj ? URL.createObjectURL(imageField.file.originFileObj) : fallbackImg;

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await adminApi.getAllCategories();
                if (res.data && Array.isArray(res.data)) {
                    setCategories(res.data);
                } else if (res.data && Array.isArray(res.data.content)) {
                    setCategories(res.data.content);
                } else {
                    setCategories([]);
                }
            } catch (error) {
                notification.error({ message: t('error'), description: t('api_error_fetch_categories') });
                setCategories([]);
            }
        };
        fetchCategories();
    }, [t]);

    const handleCreateProduct = async (values) => {
        setLoading(true);
        try {
            const payload = {
                name: values.name,
                description: values.description || '',
                productCategories: values.categories ? values.categories.map(Number) : [],
                image: ''
            };
            const res = await adminApi.createProduct(payload);
            if (res.status === 201 || res.status === 200) {
                const newProduct = res.data;
                setCreatedProductId(newProduct.id || newProduct.productId);
                notification.success({ message: t('success'), description: t('admin_msg_create_success') });
                setCurrentStep(1);
            }
        } catch (error) {
            notification.error({ message: t('error'), description: t('admin_error_create') });
        } finally {
            setLoading(false);
        }
    };

    const handleUploadProductImage = async () => {
        const pid = createdProductId;
        if (!pid || !imageField?.file) {
            setCurrentStep(2);
            return;
        }
        setLoading(true);
        try {
            const uploadRes = await adminApi.uploadProductImage(imageField.file.originFileObj, pid);
            if (uploadRes.data && uploadRes.data.url) {
                const imageUrl = uploadRes.data.url;
                await adminApi.updateProduct({
                    id: pid,
                    name: form.getFieldValue('name'),
                    image: imageUrl,
                    description: form.getFieldValue('description')
                });
                notification.success({ message: t('success'), description: t('admin_msg_upload_success') });
                setCurrentStep(2);
            }
        } catch (error) {
            notification.error({ message: t('error'), description: t('admin_error_upload_img') });
        } finally {
            setLoading(false);
        }
    };

    const handleAddOptionType = () => setOptionTypes([...optionTypes, { name: '', values: [] }]);
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
            notification.warning({
                message: t('info'),
                description: t('admin_error_at_least_one_option')
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

                const mappedVariants = fetchedVariants.map((v, idx) => ({
                    ...v,
                    displayVariantName: suffixes[idx] || v.productVariantName || '',
                    optionValues: suffixes[idx] ? suffixes[idx].split(' - ') : [],
                    price: 0,
                    stockQuantity: 0,
                    image: ''
                }));
                setVariants(mappedVariants);
            }
            notification.success({ message: t('success'), description: t('admin_msg_options_success') });
            setCurrentStep(3);
        } catch (error) {
            notification.error({ message: t('error'), description: t('admin_error_options_save') });
        } finally {
            setLoading(false);
        }
    };

    const handleVariantChange = (id, field, value) => {
        setVariants(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
    };

    const handleVariantImageUpload = async (id, file) => {
        try {
            notification.open({
                message: t('loading'),
                description: t('loading'),
                key: 'skuUpload',
                icon: <LoadingOutlined className="pc-loading-icon" />,
                duration: 0
            });
            const res = await adminApi.uploadSkuImage(file, `variant-${id}`);
            handleVariantChange(id, 'image', res.data.url);
            handleVariantChange(id, 'productImageUrl', res.data.url);
            notification.success({ message: t('success'), description: t('success'), key: 'skuUpload' });
            return false;
        } catch (error) {
            notification.destroy('skuUpload');
            notification.error({ message: t('error'), description: t('admin_error_upload_img') });
            return false;
        }
    };

    const handleSaveVariants = async () => {
        if (!createdProductId) return;
        
        setLoading(true);
        try {
            const productName = form.getFieldValue('name');
            let newProductSlug = generateSlug(productName);
            let redirectVariantId = null;

            if (variants.length > 0) {
                await Promise.all(variants.map(v =>
                    adminApi.updateVariant({
                        id: v.id,
                        productVariantName: v.displayVariantName ? `${productName} - ${v.displayVariantName}` : v.productVariantName,
                        price: v.price || 0,
                        stockQuantity: v.stockQuantity || 0,
                        status: 'ACTIVE',
                        productImageUrl: v.image || v.productImageUrl,
                        description: form.getFieldValue('description')
                    })
                ));
                const firstVariant = variants[0];
                const variantCombinedName = firstVariant.displayVariantName ? `${productName} - ${firstVariant.displayVariantName}` : productName;
                newProductSlug = generateSlug(variantCombinedName);
                redirectVariantId = firstVariant.id;
            }

            notification.success({ message: t('success'), description: t('admin_msg_variants_success') });
            navigate(`/admin/products/${newProductSlug}`, {
                state: {
                    productId: createdProductId,
                    variantId: redirectVariantId
                }
            });
            
        } catch (error) {
            notification.error({ message: t('error'), description: t('admin_error_options_save') });
        } finally {
            setLoading(false);
        }
    };

    const minPrice = variants.length > 0 ? Math.min(...variants.map(v => v.price || 0)) : 0;

    const renderPreviewOptions = () => {
        const validOptions = optionTypes.filter(o => o.name && o.name.trim() !== '' && o.values && o.values.length > 0);
        if (validOptions.length === 0) return null;

        return (
            <div className="pc-preview-options">
                {validOptions.map((opt, idx) => (
                    <div key={idx} className="pc-option-preview-group">
                        <span className="pc-option-preview-label">{opt.name.toUpperCase()}:</span>
                        <div className="pc-size-options">
                            {opt.values.map(val => (
                                <button key={val} className="pc-size-btn preview-mode">
                                    {val}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="pc-create-container">
            <div className="pc-header-section">
                <div className="pc-back-btn" onClick={() => navigate('/admin/products')}>
                    <PlusOutlined style={{ transform: 'rotate(45deg)' }} />
                </div>
                <div className="pc-header-info">
                    <h2>{t('admin_product_create')}</h2>
                    <p>{t('admin_create_desc')}</p>
                </div>
            </div>

            <div className="pc-steps-wrapper">
                <Steps
                    current={currentStep}
                    className="pc-modern-steps"
                    responsive={false}
                    items={[
                        { title: t('admin_step_1') },
                        { title: t('admin_step_2') },
                        { title: t('admin_step_3') },
                        { title: t('admin_step_4') }
                    ]}
                />
            </div>

            <div className="pc-product-preview-wrap">
                <div className="pc-product-top-section">
                    <div className="pc-product-gallery">
                        <div className="pc-thumbnail-list">
                            <div className="pc-thumb-item active"><img src={previewImage} alt={t('admin_product_image')} /></div>
                        </div>
                        <div className="pc-main-image">
                            {currentStep === 1 ? (
                                <Form.Item name="image" className="pc-image-form-item" form={form}>
                                    <Upload.Dragger maxCount={1} beforeUpload={() => false} showUploadList={false} className="pc-upload-dragger">
                                        {imageField ? (
                                            <img src={previewImage} alt={t('product')} className="pc-main-img-fit" />
                                        ) : (
                                            <div className="pc-upload-placeholder">
                                                <CloudUploadOutlined className="pc-upload-icon" />
                                                <p className="pc-upload-text">{t('admin_btn_upload')}</p>
                                                <p className="pc-upload-subtext">JPG, PNG, WEBP</p>
                                            </div>
                                        )}
                                    </Upload.Dragger>
                                </Form.Item>
                            ) : (
                                <img src={previewImage} alt={t('product')} className="pc-main-img-fit" onError={(e) => { e.target.src = fallbackImg }} />
                            )}
                        </div>
                    </div>

                    <div className="pc-product-info-side">
                        <div className="pc-info-header">
                            <div className="pc-brand-label">BKEUTY</div>
                            <CButton type={isPreview ? "primary" : "outline"} icon={isPreview ? <EditOutlined /> : <EyeOutlined />} onClick={() => setIsPreview(!isPreview)} size="small" className="pc-preview-btn">
                                {isPreview ? t('admin_btn_edit_mode') : t('admin_btn_preview')}
                            </CButton>
                        </div>

                        {isPreview ? (
                            <div className="pc-preview-content">
                                <h1 className="pc-detail-title">{formName || t('admin_placeholder_product_name')}</h1>
                                
                                {formCategories && formCategories.length > 0 && (
                                    <div className="pc-detail-categories">
                                        <span className="pc-categories-label">{t('categories')}: </span>
                                        <Space wrap>
                                            {formCategories.map(catId => {
                                                const cat = categories.find(c => c.id === catId);
                                                return cat ? (
                                                    <span key={catId} className="pc-category-tag">
                                                        {cat.categoryName}
                                                    </span>
                                                ) : null;
                                            })}
                                        </Space>
                                    </div>
                                )}

                                <div className="pc-detail-price">
                                    {minPrice.toLocaleString("vi-VN")}đ
                                    <span className="pc-vat-tag">({t('vat_included')})</span>
                                </div>

                                {renderPreviewOptions()}

                                <div className="pc-actions-top">
                                    <CButton type="primary" block size="large" disabled className="pc-buy-btn">{t('add_to_cart')}</CButton>
                                </div>
                            </div>
                        ) : (
                            <div className="pc-edit-content">
                                {currentStep === 0 && (
                                    <Form form={form} layout="vertical" onFinish={handleCreateProduct} requiredMark={false} className="pc-form-full">
                                        <Form.Item name="name" rules={[{ required: true, message: t('admin_error_name_required') }]} className="pc-mb-16">
                                            <CInput className="pc-preview-title-input" placeholder={t('admin_placeholder_product_name')} />
                                        </Form.Item>
                                        <Row gutter={24} className="pc-mb-20">
                                            <Col span={24}>
                                                <div className="pc-input-label">{t('admin_label_category')}</div>
                                                <Form.Item name="categories" rules={[{ required: true, message: t('admin_error_category_required') }]} className="pc-mb-0">
                                                    <Select mode="multiple" className="pc-select-large" placeholder={t('admin_placeholder_categories')}>
                                                        {categories.map(cat => (
                                                            <Option key={cat.id} value={cat.id}>{cat.categoryName}</Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <div className="pc-input-label">{t('admin_label_desc')}</div>
                                        <Form.Item name="description" className="pc-mb-30">
                                            <CInput multiline rows={4} placeholder={t('admin_placeholder_desc')} />
                                        </Form.Item>
                                        <div className="pc-actions-bottom">
                                            <CButton type="primary" htmlType="submit" loading={loading} block size="large" className="pc-admin-btn">
                                                {t('admin_btn_create_continue')}
                                            </CButton>
                                        </div>
                                    </Form>
                                )}

                                {currentStep === 1 && (
                                    <div className="pc-image-upload-step">
                                        <h3 className="pc-step-title">{t('admin_step_2')}</h3>
                                        <p className="pc-step-desc">{t('admin_label_image')}</p>
                                        <div className="pc-actions-flex">
                                            <CButton type="secondary" onClick={() => setCurrentStep(0)} className="pc-flex-1">{t('back')}</CButton>
                                            <CButton type="primary" onClick={handleUploadProductImage} loading={loading} className="pc-admin-btn pc-flex-2">
                                                {t('admin_btn_upload_continue')}
                                            </CButton>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 2 && (
                                    <div className="pc-product-options-section">
                                        <h3 className="pc-step-title">{t('admin_step_3')}</h3>
                                        {optionTypes.map((opt, index) => (
                                            <div key={index} className="pc-option-group">
                                                <div className="pc-option-header">
                                                    <CInput
                                                        value={opt.name}
                                                        onChange={(e) => handleOptionNameChange(index, e.target.value)}
                                                        placeholder={t('admin_placeholder_option_name')}
                                                        className="pc-preview-title-input pc-w-60"
                                                    />
                                                    {index > 0 && <CButton type="text" danger icon={<DeleteOutlined />} onClick={() => handleRemoveOptionType(index)} />}
                                                </div>
                                                <Select
                                                    mode="tags"
                                                    className="pc-select-large pc-w-100"
                                                    placeholder={t('admin_placeholder_option_values_short')}
                                                    value={opt.values}
                                                    onChange={(val) => handleOptionValuesChange(index, val)}
                                                    tokenSeparators={[',']}
                                                    open={false}
                                                />
                                            </div>
                                        ))}
                                        <CButton type="dashed" onClick={handleAddOptionType} icon={<PlusOutlined />} className="pc-add-option-btn">
                                            {t('admin_btn_add_option')}
                                        </CButton>
                                        <div className="pc-actions-flex pc-mt-48">
                                            <CButton type="secondary" onClick={() => setCurrentStep(1)} className="pc-flex-1">{t('back')}</CButton>
                                            <CButton type="primary" onClick={handleSubmitOptions} loading={loading} className="pc-admin-btn pc-flex-2">
                                                {t('admin_btn_gen_variants')}
                                            </CButton>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 3 && (
                                    <div className="pc-product-variants-edit">
                                        <div className="pc-variants-container">
                                            <h3 className="pc-step-title">{t('admin_step_4')}</h3>
                                            <div className="pc-custom-scrollbar">
                                                {variants.map(record => (
                                                    <div key={record.id} className="pc-variant-row">
                                                        <div className="pc-variant-img-upload">
                                                            <Upload
                                                                showUploadList={false}
                                                                beforeUpload={(file) => handleVariantImageUpload(record.id, file)}
                                                            >
                                                                {(record.image || record.productImageUrl) ? (
                                                                    <img src={getImageUrl(record.image || record.productImageUrl)} alt="v" className="pc-variant-img" />
                                                                ) : (
                                                                    <div className="pc-variant-img-placeholder"><FileImageOutlined className="pc-variant-icon" /></div>
                                                                )}
                                                            </Upload>
                                                        </div>
                                                        <div className="pc-variant-info-col">
                                                            <div className="pc-variant-name">{record.displayVariantName || record.productVariantName}</div>
                                                            <div className="pc-variant-inputs-row">
                                                                <div className="pc-variant-input-col">
                                                                    <div className="pc-variant-input-label">{t('admin_label_price')}</div>
                                                                    <InputNumber
                                                                        placeholder={t('admin_placeholder_price')}
                                                                        value={record.price}
                                                                        min={0}
                                                                        className="pc-input-number"
                                                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                                                        onChange={(val) => handleVariantChange(record.id, 'price', val)}
                                                                    />
                                                                </div>
                                                                <div className="pc-variant-input-col">
                                                                    <div className="pc-variant-input-label">{t('admin_label_stock')}</div>
                                                                    <InputNumber
                                                                        placeholder={t('admin_placeholder_stock')}
                                                                        value={record.stockQuantity}
                                                                        min={0}
                                                                        className="pc-input-number"
                                                                        onChange={(val) => handleVariantChange(record.id, 'stockQuantity', val)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {variants.length === 0 && (
                                                    <div className="pc-no-variants">{t('admin_step_4')}</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="pc-actions-flex pc-mt-48 pc-pt-20">
                                            <CButton type="secondary" onClick={() => setCurrentStep(2)} className="pc-flex-1">{t('back')}</CButton>
                                            <CButton type="primary" onClick={handleSaveVariants} loading={loading} className="pc-admin-btn pc-flex-2">
                                                <CheckCircleOutlined style={{ marginRight: 8 }} /> {t('admin_btn_save_finish')}
                                            </CButton>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {!isPreview && (
                    <div className="pc-product-description-bottom pc-mt-30">
                        <div className="pc-tabs-style">
                            <div className="pc-tab-header">{t('product_details')}</div>
                            <div className="pc-tab-content">
                                <CInput 
                                    multiline
                                    value={formDescription} 
                                    readOnly 
                                    rows={6} 
                                    placeholder={t('admin_placeholder_desc')}
                                    className="pc-description-read-only"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductCreate;
