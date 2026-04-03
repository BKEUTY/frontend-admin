import {
    CheckCircleOutlined,
    CloudUploadOutlined,
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    FileImageOutlined,
    PlusOutlined,
    StarFilled,
    LoadingOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Col, Form, InputNumber, Row, Select, Space, Steps, Upload, notification } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminBrandApi from '../../../api/adminBrandApi';
import { getImageUrl } from '../../../api/axiosClient';
import { CButton, CInput } from '../../../Component/Common';
import { useAdminProducts } from '../../../hooks/useAdminProducts';
import { usePublicProducts } from '../../../hooks/usePublicProducts';
import { useLanguage } from '../../../i18n/LanguageContext';
import './ProductCreate.css';

import dummy1 from '../../../Assets/Images/Products/product_dummy_1.jpg';
import dummy2 from '../../../Assets/Images/Products/product_dummy_2.jpg';
import dummy3 from '../../../Assets/Images/Products/product_dummy_3.jpg';
import dummy4 from '../../../Assets/Images/Products/product_dummy_4.jpg';
import dummy5 from '../../../Assets/Images/Products/product_dummy_5.svg';

const { Option } = Select;
const dummyImages = [dummy1, dummy2, dummy3, dummy4, dummy5];
const getRandomImage = () => dummyImages[Math.floor(Math.random() * dummyImages.length)];

const ProductCreate = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [form] = Form.useForm();
    const [createdProductId, setCreatedProductId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isPreview, setIsPreview] = useState(false);

    const [formValues, setFormValues] = useState({
        name: '',
        categories: [],
        brandId: null,
        description: ''
    });

    const [optionTypes, setOptionTypes] = useState([{ optionName: '', optionValues: [], isCustomName: false }]);
    const [variants, setVariants] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [selectedImageFile, setSelectedImageFile] = useState(null);

    const fallbackImg = useMemo(() => getRandomImage(), []);
    const previewImage = selectedImageFile ? URL.createObjectURL(selectedImageFile) : fallbackImg;

    const { categories } = usePublicProducts();
    const {
        availableOptions = {},
        createProduct, updateProduct, uploadProductImage,
        createOption, uploadSkuImage, updateVariant
    } = useAdminProducts();
    const optionKeys = Object.keys(availableOptions);

    const { data: brands = [] } = useQuery({
        queryKey: ['brands'],
        queryFn: async () => {
            const brandRes = await adminBrandApi.getAll({ page: 0, size: 1000 });
            return brandRes.data?.content || [];
        }
    });

    const handleCreateProduct = async ({ name, description, categories, brandId }) => {
        setLoading(true);
        try {
            const res = await createProduct({
                name,
                description,
                productCategories: categories.map(Number),
                brandId,
                image: ''
            });
            setCreatedProductId(res.id);
            notification.success({ message: t('success'), description: t('admin_msg_create_success') });
            setCurrentStep(1);
        } catch (error) {
            notification.error({ message: t('error'), description: error.message || 'Error creating product' });
        } finally {
            setLoading(false);
        }
    };

    const handleUploadProductImage = async () => {
        if (!createdProductId || !selectedImageFile) { setCurrentStep(2); return; }
        setLoading(true);
        try {
            const uploadRes = await uploadProductImage({ file: selectedImageFile, productId: createdProductId });
            if (uploadRes.data?.url) {
                await updateProduct({
                    id: createdProductId,
                    name: formValues.name,
                    description: formValues.description,
                    productCategories: formValues.categories?.map(Number) || [],
                    brandId: formValues.brandId,
                    image: uploadRes.data.url
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

    const handleAddOptionType = () => setOptionTypes([...optionTypes, { optionName: '', optionValues: [], isCustomName: false }]);
    
    const handleRemoveOptionType = (index) => {
        setOptionTypes(prev => {
            const newTypes = prev.filter((_, i) => i !== index);
            if (selectedOptions[prev[index].optionName]) {
                const newSelected = { ...selectedOptions };
                delete newSelected[prev[index].optionName];
                setSelectedOptions(newSelected);
            }
            return newTypes;
        });
    };

    const handleOptionSelectChange = (index, val) => {
        setOptionTypes(prev => prev.map((opt, i) => {
            if (i === index) {
                if (selectedOptions[opt.optionName]) {
                    const newSelected = { ...selectedOptions };
                    delete newSelected[opt.optionName];
                    setSelectedOptions(newSelected);
                }
                if (val === 'OTHER_CUSTOM') return { ...opt, optionName: '', isCustomName: true, optionValues: [] };
                return { ...opt, optionName: val, isCustomName: false, optionValues: [] };
            }
            return opt;
        }));
    };

    const handleOptionNameChange = (index, val) => {
        setOptionTypes(prev => {
            const newTypes = [...prev];
            const oldName = newTypes[index].optionName;
            newTypes[index].optionName = val;
            
            if (selectedOptions[oldName]) {
                const newSelected = { ...selectedOptions };
                newSelected[val] = newSelected[oldName];
                delete newSelected[oldName];
                setSelectedOptions(newSelected);
            }
            return newTypes;
        });
    };

    const handleOptionValuesChange = (index, val) => {
        setOptionTypes(prev => {
            const newTypes = [...prev];
            newTypes[index].optionValues = val;
            
            const optName = newTypes[index].optionName;
            if (selectedOptions[optName] && !val.includes(selectedOptions[optName])) {
                const newSelected = { ...selectedOptions };
                delete newSelected[optName];
                setSelectedOptions(newSelected);
            }
            return newTypes;
        });
    };

    const handleSubmitOptions = async () => {
        if (!createdProductId) return;

        const names = optionTypes.map(o => o.optionName?.trim().toLowerCase()).filter(Boolean);
        const uniqueNames = new Set(names);
        if (names.length !== uniqueNames.size) {
            return notification.warning({ message: t('warning'), description: t('admin_error_duplicate_options', 'Các thuộc tính không được trùng tên nhau!') });
        }

        const hasConflict = optionTypes.some(o => o.isCustomName && optionKeys.map(k => k.toLowerCase()).includes(o.optionName?.trim().toLowerCase()));
        if (hasConflict) {
            return notification.warning({ message: t('warning'), description: t('admin_error_custom_exists', 'Tên thuộc tính tạo mới đã có sẵn trong hệ thống, vui lòng chọn từ danh sách!') });
        }

        const validOptions = optionTypes.filter(o => o.optionName?.trim() && o.optionValues?.length).map(o => ({
            optionName: o.optionName,
            optionValues: o.optionValues
        }));

        if (!validOptions.length) {
            return notification.warning({ message: t('info'), description: t('admin_error_at_least_one_option') });
        }
        
        setLoading(true);
        try {
            const res = await createOption({
                productId: createdProductId,
                productOptionValues: validOptions
            });
            
            if (res) {
                setVariants(res.map(v => ({ ...v, price: 0, stockQuantity: 0, productImageUrl: '', description: '' })));
            }
            
            notification.success({ message: t('success'), description: t('admin_msg_options_success') });
            setCurrentStep(3);
        } catch {
            notification.error({ message: t('error'), description: t('admin_error_options_save') });
        } finally {
            setLoading(false);
        }
    };

    const handleVariantChange = (id, field, value) => {
        setVariants(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
    }

    const handleVariantImageUpload = async (id, file) => {
        try {
            notification.open({ message: t('loading'), key: 'skuUpload', icon: <LoadingOutlined className="pc-loading-icon" />, duration: 0 });
            const res = await uploadSkuImage({ file, skuId: id });
            handleVariantChange(id, 'productImageUrl', res.url);
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
            await Promise.all(variants.map(({ id, productVariantName, price, stockQuantity, productImageUrl, description }) => 
                updateVariant({ id, productVariantName, price, stockQuantity, productImageUrl, description, status: 'ACTIVE' })
            ));
            notification.success({ message: t('success'), description: t('admin_msg_variants_success') });
            navigate(`/admin/products/${variants[0].productVariantName}`);
        } catch {
            notification.error({ message: t('error'), description: t('admin_error_options_save') });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isPreview && optionTypes.length > 0 && Object.keys(selectedOptions).length === 0) {
            const initialOptions = {};
            optionTypes.forEach(opt => {
                if (opt.optionName && opt.optionValues?.length) {
                    initialOptions[opt.optionName] = opt.optionValues[0];
                }
            });
            setSelectedOptions(initialOptions);
        }
    }, [isPreview, optionTypes, selectedOptions]);

    const currentVariant = useMemo(() => {
        if (!variants.length || !Object.keys(selectedOptions).length) return null;
        const selectedValues = optionTypes
            .map(opt => selectedOptions[opt.optionName])
            .filter(Boolean);
        return variants.find(v => {
            if (!v.optionValues || !v.optionValues.length) return false;
            return selectedValues.every(val => v.optionValues.includes(val));
        }) || null;
    }, [variants, selectedOptions, optionTypes]);

    const shownPrice = currentVariant?.price || 0;
    const variantImage = currentVariant?.productImageUrl ? getImageUrl(currentVariant.productImageUrl) : previewImage;

    const renderPreviewOptions = () => {
        const displayOptions = optionTypes.filter(o => o.optionName?.trim() && o.optionValues?.length);
        if (!displayOptions.length) return null;
        return (
            <div className="pc-preview-options">
                {displayOptions.map((opt, idx) => (
                    <div key={idx} className="pc-option-preview-group">
                        <span className="pc-option-preview-label">{opt.optionName.toUpperCase()}:</span>
                        <div className="pc-size-options">
                            {opt.optionValues.map(val => {
                                const isActive = isPreview && selectedOptions[opt.optionName] === val;
                                return (
                                    <button
                                        key={val}
                                        className={`pc-size-btn preview-mode ${isActive ? 'active' : ''}`}
                                        onClick={() => isPreview && setSelectedOptions(prev => ({ ...prev, [opt.optionName]: val }))}
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
                                <img src={isPreview ? variantImage : previewImage} alt={t('admin_product_image')} />
                            </div>
                        </div>
                        <div className="pc-main-image">
                            {currentStep === 1 && !isPreview ? (
                                <Upload.Dragger
                                    maxCount={1}
                                    beforeUpload={(file) => {
                                        setSelectedImageFile(file);
                                        return false;
                                    }}
                                    showUploadList={false}
                                    className="pc-upload-dragger"
                                >
                                    {selectedImageFile ? (
                                        <img src={previewImage} alt={t('product')} className="pc-main-img-fit" />
                                    ) : (
                                        <div className="pc-upload-placeholder">
                                            <CloudUploadOutlined className="pc-upload-icon" />
                                            <p className="pc-upload-text">{t('admin_btn_upload')}</p>
                                            <p className="pc-upload-subtext">JPG, PNG, WEBP</p>
                                        </div>
                                    )}
                                </Upload.Dragger>
                            ) : (
                                <img src={isPreview ? variantImage : previewImage} alt={t('product')} className="pc-main-img-fit" onError={(e) => { e.target.src = fallbackImg }} />
                            )}
                        </div>
                    </div>

                    <div className="pc-product-info-side">
                        <div className="pc-info-header">
                            <div className="pc-brand-label">
                                {brands.find(b => b.id === formValues.brandId)?.name || ''}
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
                                    {currentVariant ? currentVariant.productVariantName : (formValues.name || t('admin_placeholder_product_name'))}
                                </h1>

                                {formValues.categories?.length > 0 && (
                                    <div className="pc-detail-categories">
                                        <span className="pc-categories-label">{t('categories')}: </span>
                                        <Space wrap>
                                            {formValues.categories.map(catId => {
                                                const cat = categories.find(c => c.id === catId);
                                                return cat ? <span key={catId} className="pc-category-tag">{cat.categoryName}</span> : null;
                                            })}
                                        </Space>
                                    </div>
                                )}

                                <div className="pc-detail-tags">
                                    <div className="pc-rating-container">
                                        <StarFilled className="pc-star-icon" />
                                        <strong>0.0</strong>/5 (0 {t('reviews')})
                                    </div>
                                </div>

                                <div className="pc-detail-price-box">
                                    <div className="pc-detail-current-price-wrapper">
                                        <div className="pc-detail-current-price">
                                            {`${shownPrice.toLocaleString('vi-VN')}đ`}
                                        </div>
                                    </div>
                                </div>

                                {renderPreviewOptions()}

                                {optionTypes.length > 0 && optionTypes[0].optionName !== '' && (
                                    <>
                                        {Object.keys(selectedOptions).length > 0 && (
                                            <div className="admin-pd-selected-variant" style={{ marginTop: '16px' }}>
                                                <span className="admin-pd-variant-label">{t('variant_selected_label')}: </span>
                                                <strong className="admin-pd-variant-value">
                                                    {optionTypes
                                                        .map(opt => selectedOptions[opt.optionName])
                                                        .filter(Boolean)
                                                        .join(' - ') || t('not_selected')}
                                                </strong>
                                            </div>
                                        )}

                                        <div className="admin-pd-stock-info">
                                            {t('in_stock_label')} <strong>{currentVariant?.stockQuantity || 0}</strong> {t('items_available')}
                                        </div>
                                    </>
                                )}

                                <div className="pc-actions-top">
                                    <CButton type="primary" block size="large" disabled className="pc-buy-btn">
                                        {t('add_to_cart')}
                                    </CButton>
                                </div>
                            </div>
                        ) : (
                            <div className="pc-edit-content">
                                {currentStep === 0 && (
                                    <Form 
                                        form={form} 
                                        layout="vertical" 
                                        onFinish={handleCreateProduct} 
                                        initialValues={formValues}
                                        onValuesChange={(_, allValues) => setFormValues(allValues)}
                                        requiredMark={false} 
                                        className="pc-form-full"
                                    >
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
                                                <div className="pc-input-label">{t('admin_label_brand')}</div>
                                                <Form.Item name="brandId" rules={[{ required: true, message: t('admin_error_brand_required') }]} className="pc-mb-0">
                                                    <Select className="pc-select-modern" placeholder={t('admin_placeholder_brand')}>
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
                                        {optionTypes.map((opt, index) => {
                                            const isDuplicateError = opt.isCustomName && optionKeys.map(k=>k.toLowerCase()).includes(opt.optionName?.trim().toLowerCase());
                                            return (
                                                <div key={index} className="pc-option-group">
                                                    <div className="pc-option-header">
                                                        <Select
                                                            value={opt.isCustomName ? 'OTHER_CUSTOM' : (opt.optionName || undefined)}
                                                            onChange={(val) => handleOptionSelectChange(index, val)}
                                                            placeholder={t('admin_placeholder_option_name')}
                                                            className="pc-select-modern pc-opt-select"
                                                            style={{ flex: 2}}
                                                        >
                                                            {optionKeys.map(k => (
                                                                <Option 
                                                                    key={k} 
                                                                    value={k} 
                                                                    disabled={optionTypes.some((o, i) => i !== index && o.optionName === k)}
                                                                    style={{ padding: '6px 3px' }}
                                                                >
                                                                    {k}
                                                                </Option>
                                                            ))}
                                                            <Option value="OTHER_CUSTOM" style={{ color: 'var(--color_main)', fontWeight: 600, padding: '6px 3px' }}>
                                                                + {t('other')}
                                                            </Option>
                                                        </Select>

                                                        {opt.isCustomName && (
                                                            <div style={{ flex: 2, position: 'relative' }}>
                                                                <CInput
                                                                    value={opt.optionName}
                                                                    onChange={(e) => handleOptionNameChange(index, e.target.value)}
                                                                    placeholder={t('admin_placeholder_option_name_custom')}
                                                                    className="pc-opt-input"
                                                                    style={{ borderColor: isDuplicateError ? 'red' : undefined }}
                                                                />
                                                                {isDuplicateError && (
                                                                    <div style={{ color: 'red', fontSize: '11px', position: 'absolute', bottom: '-18px', left: '4px' }}>
                                                                        {t('admin_error_option_name_duplicate')}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {index > 0 && (
                                                            <CButton type="text" danger icon={<DeleteOutlined />} onClick={() => handleRemoveOptionType(index)} className="pc-delete-opt-btn" />
                                                        )}
                                                    </div>
                                                    <Select
                                                        mode="tags"
                                                        className="pc-select-modern pc-w-100"
                                                        placeholder={t('admin_placeholder_option_values_short')}
                                                        value={opt.optionValues}
                                                        onChange={(val) => handleOptionValuesChange(index, val)}
                                                        tokenSeparators={[',']}
                                                        options={(!opt.isCustomName && availableOptions[opt.optionName]) ? availableOptions[opt.optionName].map(v => ({ value: v, label: v })) : []}
                                                    />
                                                </div>
                                            );
                                        })}
                                        <CButton type="dashed" onClick={handleAddOptionType} icon={<PlusOutlined />} className="pc-add-option-btn" style={{ marginTop: '10px' }}>
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
                                                            <div className="pc-variant-header">
                                                                <span className="pc-variant-name">{record.productVariantName}</span>
                                                            </div>
                                                            <div className="pc-variant-inputs-grid">
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
                                                            <div className="pc-variant-desc-col">
                                                                <div className="pc-variant-input-label">{t('admin_label_desc')}</div>
                                                                <CInput
                                                                    multiline
                                                                    rows={2}
                                                                    placeholder={t('admin_placeholder_desc')}
                                                                    value={record.description}
                                                                    onChange={(e) => handleVariantChange(record.id, 'description', e.target.value)}
                                                                />
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
            </div>
        </div>
    );
};

export default ProductCreate;
