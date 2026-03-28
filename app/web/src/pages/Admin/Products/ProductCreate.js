import {
    CheckCircleOutlined,
    CloudUploadOutlined,
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    FileImageOutlined, LoadingOutlined,
    PlusOutlined,
    StarFilled
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Col, Form, InputNumber, Row, Select, Space, Steps, Upload, notification } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminBrandApi from '../../../api/adminBrandApi';
import { getImageUrl } from '../../../api/axiosClient';
import { CButton, CInput } from '../../../Component/Common';
import { useAdminProducts } from '../../../hooks/useAdminProducts';
import { useProductDetail, usePublicProducts } from '../../../hooks/usePublicProducts';
import { useLanguage } from '../../../i18n/LanguageContext';
import { generateSlug } from '../../../utils/helpers';
import './ProductCreate.css';

import dummy1 from '../../../Assets/Images/Products/product_dummy_1.jpg';
import dummy2 from '../../../Assets/Images/Products/product_dummy_2.jpg';
import dummy3 from '../../../Assets/Images/Products/product_dummy_3.jpg';
import dummy4 from '../../../Assets/Images/Products/product_dummy_4.jpg';
import dummy5 from '../../../Assets/Images/Products/product_dummy_5.svg';

const { Option } = Select;
const dummyImages = [dummy1, dummy2, dummy3, dummy4, dummy5];
const getRandomImage = () => dummyImages[Math.floor(Math.random() * dummyImages.length)];

const resolveHasDiscount = (origin, promotion) =>
    origin > 0 && promotion > 0 && promotion < origin;

const ProductCreate = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [form] = Form.useForm();
    const [createdProductId, setCreatedProductId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isPreview, setIsPreview] = useState(false);

    const [optionTypes, setOptionTypes] = useState([{ name: '', values: [] }]);
    const [variants, setVariants] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [firstVariantId, setFirstVariantId] = useState(null);

    const fallbackImg = useMemo(() => getRandomImage(), []);

    const formName = Form.useWatch('name', form);
    const formDescription = Form.useWatch('description', form);
    const formCategories = Form.useWatch('categories', form);
    const formBrandId = Form.useWatch('brandId', form);
    const imageField = Form.useWatch('image', form);
    const previewImage = imageField?.file?.originFileObj
        ? URL.createObjectURL(imageField.file.originFileObj)
        : fallbackImg;

    const { categories } = usePublicProducts();
    const {
        createProduct, updateProduct, uploadProductImage,
        createOption, uploadSkuImage, updateVariant
    } = useAdminProducts();

    const { data: brands = [] } = useQuery({
        queryKey: ['brands'],
        queryFn: async () => {
            const brandRes = await adminBrandApi.getAll({ page: 0, size: 1000 });
            return brandRes.data?.content || brandRes.data || [];
        }
    });

    const priceQueryId = isPreview ? firstVariantId : null;
    const { data: productRaw, isLoading: isPriceLoading } = useProductDetail(priceQueryId, {
        enabled: !!priceQueryId
    });

    const handleCreateProduct = async (values) => {
        setLoading(true);
        try {
            const res = await createProduct({
                name: values.name,
                description: values.description || '',
                productCategories: values.categories.map(Number),
                brandId: Number(values.brandId),
                image: ''
            });
            setCreatedProductId(res.data.id);
            notification.success({ message: t('success'), description: t('admin_msg_create_success') });
            setCurrentStep(1);
        } catch (error) {
            notification.error({ message: t('error'), description: error.message || 'Error creating product' });
        } finally {
            setLoading(false);
        }
    };

    const handleUploadProductImage = async () => {
        if (!createdProductId || !imageField?.file) { setCurrentStep(2); return; }
        setLoading(true);
        try {
            const uploadRes = await uploadProductImage({ file: imageField.file.originFileObj, productId: createdProductId });
            if (uploadRes.data?.url) {
                await updateProduct({
                    id: createdProductId,
                    data: {
                        name: form.getFieldValue('name'),
                        description: form.getFieldValue('description') || '',
                        productCategories: form.getFieldValue('categories').map(Number),
                        brandId: Number(form.getFieldValue('brandId')),
                        image: uploadRes.data.url
                    }
                });
                notification.success({ message: t('success'), description: t('admin_msg_upload_success') });
            }
            setCurrentStep(2);
        } catch {
            notification.error({ message: t('error'), description: t('admin_error_upload_img') });
        } finally {
            setLoading(false);
        }
    };

    const handleAddOptionType = () => setOptionTypes([...optionTypes, { name: '', values: [] }]);
    const handleRemoveOptionType = (index) => setOptionTypes(prev => prev.filter((_, i) => i !== index));
    const handleOptionNameChange = (index, val) => setOptionTypes(prev => prev.map((opt, i) => i === index ? { ...opt, name: val } : opt));
    const handleOptionValuesChange = (index, val) => setOptionTypes(prev => prev.map((opt, i) => i === index ? { ...opt, values: val } : opt));

    const handleSubmitOptions = async () => {
        if (!createdProductId) return;
        const validOptions = optionTypes.filter(o => o.name?.trim() !== '' && o.values?.length > 0);
        if (validOptions.length === 0) {
            return notification.warning({ message: t('info'), description: t('admin_error_at_least_one_option') });
        }
        setLoading(true);
        try {
            const res = await createOption({
                productId: createdProductId,
                productOptionValues: validOptions.map(opt => ({ optionName: opt.name, optionValues: opt.values }))
            });
            if (res.data) {
                const suffixes = [];
                const generateCombinations = (opts, index = 0, currentCombo = []) => {
                    if (index === opts.length) { suffixes.push(currentCombo.join(' - ')); return; }
                    for (let val of opts[index].values) generateCombinations(opts, index + 1, [...currentCombo, val]);
                };
                generateCombinations(validOptions);
                setVariants(res.data.map((v, idx) => ({
                    ...v,
                    displayVariantName: suffixes[idx] || v.productVariantName || '',
                    price: 0,
                    stockQuantity: 0
                })));
            }
            notification.success({ message: t('success'), description: t('admin_msg_options_success') });
            setCurrentStep(3);
        } catch {
            notification.error({ message: t('error'), description: t('admin_error_options_save') });
        } finally {
            setLoading(false);
        }
    };

    const handleVariantChange = (id, field, value) =>
        setVariants(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));

    const handleVariantImageUpload = async (id, file) => {
        try {
            notification.open({ message: t('loading'), key: 'skuUpload', icon: <LoadingOutlined className="pc-loading-icon" />, duration: 0 });
            const res = await uploadSkuImage({ file, skuId: id });
            handleVariantChange(id, 'productImageUrl', res.data.url);
            notification.success({ message: t('success'), key: 'skuUpload' });
        } catch {
            notification.destroy('skuUpload');
        }
        return false;
    };

    const handleSaveVariants = async () => {
        if (!createdProductId) return;
        setLoading(true);
        try {
            const productName = form.getFieldValue('name');
            if (variants.length > 0) {
                await Promise.all(variants.map(v =>
                    updateVariant({
                        id: v.id,
                        data: {
                            productVariantName: v.displayVariantName
                                ? `${productName} - ${v.displayVariantName}`
                                : v.productVariantName,
                            price: v.price || 0,
                            stockQuantity: v.stockQuantity || 0,
                            description: form.getFieldValue('description') || '',
                            productImageUrl: v.productImageUrl,
                            status: 'ACTIVE'
                        }
                    })
                ));
            }

            const firstVariant = variants[0];
            const variantCombinedName = firstVariant?.displayVariantName
                ? `${productName} ${firstVariant.displayVariantName}`
                : productName;

            notification.success({ message: t('success'), description: t('admin_msg_variants_success') });
            navigate(`/admin/products/${generateSlug(variantCombinedName)}`, {
                state: {
                    id: createdProductId,
                    productId: createdProductId,
                    variantId: firstVariant?.id
                }
            });
        } catch {
            notification.error({ message: t('error'), description: t('admin_error_options_save') });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (variants.length > 0 && !firstVariantId) {
            setFirstVariantId(variants[0].id);
        }
    }, [variants, firstVariantId]);

    useEffect(() => {
        if (isPreview && productRaw?.options && Object.keys(selectedOptions).length === 0) {
            const initialOptions = {};
            productRaw.options.forEach(opt => {
                if (opt.values?.length > 0) initialOptions[opt.name] = opt.values[0];
            });
            setSelectedOptions(initialOptions);
        }
    }, [isPreview, productRaw, selectedOptions]);

    const currentVariant = useMemo(() => {
        if (!productRaw?.variants || Object.keys(selectedOptions).length === 0) return null;
        return productRaw.variants.find(v => {
            if (!v.variantOptions || Object.keys(v.variantOptions).length === 0) return false;
            return Object.entries(selectedOptions).every(([optName, selectedVal]) => {
                const vVal = v.variantOptions[optName];
                return vVal?.toString().toLowerCase().trim() === selectedVal?.toString().toLowerCase().trim();
            });
        }) || null;
    }, [productRaw, selectedOptions]);

    const originPrice = productRaw?.originPrice || 0;
    const promotionPrice = productRaw?.promotionPrice || 0;
    const hasDiscount = resolveHasDiscount(originPrice, promotionPrice);
    const shownPrice = hasDiscount ? promotionPrice : originPrice;
    const discountPercent = hasDiscount
        ? Math.round(((originPrice - promotionPrice) / originPrice) * 100)
        : null;

    const renderPreviewOptions = () => {
        const displayOptions = (isPreview && productRaw?.options?.length > 0)
            ? productRaw.options
            : optionTypes.filter(o => o.name?.trim() !== '' && o.values?.length > 0);
        if (displayOptions.length === 0) return null;
        return (
            <div className="pc-preview-options">
                {displayOptions.map((opt, idx) => (
                    <div key={idx} className="pc-option-preview-group">
                        <span className="pc-option-preview-label">{opt.name.toUpperCase()}:</span>
                        <div className="pc-size-options">
                            {opt.values.map(val => {
                                const isActive = isPreview &&
                                    selectedOptions[opt.name]?.toString().toLowerCase().trim() === val?.toString().toLowerCase().trim();
                                return (
                                    <button
                                        key={val}
                                        className={`pc-size-btn preview-mode ${isActive ? 'active' : ''}`}
                                        onClick={() => isPreview && setSelectedOptions(prev => ({ ...prev, [opt.name]: val }))}
                                    >
                                        {val}
                                    </button>
                                );
                            })}
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
                            <div className="pc-thumb-item active">
                                <img src={previewImage} alt={t('admin_product_image')} />
                            </div>
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
                            {isPreview && discountPercent && (
                                <div className="pc-discount-badge-main">-{discountPercent}%</div>
                            )}
                        </div>
                    </div>

                    <div className="pc-product-info-side">
                        <div className="pc-info-header">
                            <div className="pc-brand-label">
                                {brands.find(b => b.id === formBrandId)?.name || 'BKEUTY'}
                            </div>
                            <CButton
                                type={isPreview ? 'primary' : 'outline'}
                                icon={isPreview ? <EditOutlined /> : <EyeOutlined />}
                                onClick={() => setIsPreview(!isPreview)}
                                size="small"
                                className="pc-preview-btn"
                            >
                                {isPreview ? t('admin_btn_edit_mode') : t('admin_btn_preview')}
                            </CButton>
                        </div>

                        {isPreview ? (
                            <div className="pc-preview-content">
                                <h1 className="pc-detail-title">
                                    {currentVariant?.productVariantName || formName || t('admin_placeholder_product_name')}
                                </h1>

                                {formCategories?.length > 0 && (
                                    <div className="pc-detail-categories">
                                        <span className="pc-categories-label">{t('categories')}: </span>
                                        <Space wrap>
                                            {formCategories.map(catId => {
                                                const cat = categories.find(c => c.id === catId);
                                                return cat ? <span key={catId} className="pc-category-tag">{cat.categoryName}</span> : null;
                                            })}
                                        </Space>
                                    </div>
                                )}

                                <div className="pc-detail-tags">
                                    <div className="pc-rating-container">
                                        <StarFilled className="pc-star-icon" />
                                        <strong>4.8</strong>/5 (124 {t('reviews')})
                                    </div>
                                </div>

                                <div className="pc-detail-price-box">
                                    <div className={`pc-detail-current-price-wrapper ${isPriceLoading ? 'pc-price-loading' : ''}`}>
                                        <div className="pc-detail-current-price">
                                            {isPriceLoading ? '...' : `${shownPrice.toLocaleString('vi-VN')}đ`}
                                            <span className="pc-vat-tag">{t('vat_included')}</span>
                                        </div>
                                        {!isPriceLoading && hasDiscount && (
                                            <div className="pc-detail-old-price-wrapper">
                                                <span className="pc-detail-old-price-text">
                                                    {originPrice.toLocaleString('vi-VN')}đ
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {renderPreviewOptions()}

                                <div className="pc-actions-top">
                                    <CButton type="primary" block size="large" disabled className="pc-buy-btn">
                                        {t('add_to_cart')}
                                    </CButton>
                                </div>
                            </div>
                        ) : (
                            <div className="pc-edit-content">
                                {currentStep === 0 && (
                                    <Form form={form} layout="vertical" onFinish={handleCreateProduct} requiredMark={false} className="pc-form-full">
                                        <Form.Item name="name" rules={[{ required: true, message: t('admin_error_name_required') }]} className="pc-mb-16">
                                            <CInput className="pc-preview-title-input" placeholder={t('admin_placeholder_product_name')} />
                                        </Form.Item>

                                        <Row gutter={[16, 16]} className="pc-mb-20">
                                            <Col xs={24} md={12}>
                                                <div className="pc-input-label">{t('admin_label_category')}</div>
                                                <Form.Item name="categories" rules={[{ required: true, message: t('admin_error_category_required') }]} className="pc-mb-0">
                                                    <Select mode="multiple" className="pc-select-modern" placeholder={t('admin_placeholder_categories')}>
                                                        {categories.map(cat => <Option key={cat.id} value={cat.id}>{cat.categoryName}</Option>)}
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} md={12}>
                                                <div className="pc-input-label">Thương hiệu</div>
                                                <Form.Item name="brandId" rules={[{ required: true, message: 'Vui lòng chọn thương hiệu' }]} className="pc-mb-0">
                                                    <Select className="pc-select-modern" placeholder="Chọn thương hiệu">
                                                        {brands.map(brand => <Option key={brand.id} value={brand.id}>{brand.name}</Option>)}
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
                                                        className="pc-w-60-modern"
                                                    />
                                                    {index > 0 && (
                                                        <CButton type="text" danger icon={<DeleteOutlined />} onClick={() => handleRemoveOptionType(index)} />
                                                    )}
                                                </div>
                                                <Select
                                                    mode="tags"
                                                    className="pc-select-modern pc-w-100"
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
                                                            <Upload showUploadList={false} beforeUpload={(file) => handleVariantImageUpload(record.id, file)}>
                                                                {record.productImageUrl
                                                                    ? <img src={getImageUrl(record.productImageUrl)} alt="v" className="pc-variant-img" />
                                                                    : <div className="pc-variant-img-placeholder"><FileImageOutlined className="pc-variant-icon" /></div>
                                                                }
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
