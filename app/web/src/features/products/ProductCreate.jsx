import {
    CheckCircleOutlined,
    CloudUploadOutlined,
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    FileImageOutlined,
    PlusOutlined,
    StarFilled,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Col, Form, InputNumber, Row, Select, Space, Steps, Upload, notification } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import brandService from '@/features/brands/services/brandService';
import { getImageUrl } from '@/services/axiosClient';
import { CButton, CInput } from '@/components/common';
import { useProducts } from '@/features/products/hooks/useProducts';
import { usePublicProducts } from '@/features/products/hooks/usePublicProducts';
import { useLanguage } from '@/store/LanguageContext';
import { generateSlug, PRODUCT_IMAGE_FALLBACK } from '@/utils/helpers';
import './ProductCreate.css';

const { Option } = Select;
const MAX_PRODUCT_IMAGES = 5;
const MAX_VARIANT_IMAGES = 3;

const ProductCreate = () => {
    const { t, language } = useLanguage();
    const locale = language === 'vi' ? 'vi-VN' : 'en-US';
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

    const [productImageFiles, setProductImageFiles] = useState([]);
    const [optionTypes, setOptionTypes] = useState([{ optionName: '', optionValues: [], isCustomName: false }]);
    const [variants, setVariants] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState({});

    const previewImage = productImageFiles.length > 0
        ? URL.createObjectURL(productImageFiles[0])
        : PRODUCT_IMAGE_FALLBACK;

    const { categories } = usePublicProducts();
    const {
        availableOptions = {},
        createProduct, updateProduct,
        createOption, updateVariant
    } = useProducts();
    const optionKeys = Object.keys(availableOptions);

    const { data: brands = [] } = useQuery({
        queryKey: ['brands'],
        queryFn: async () => {
            const brandRes = await brandService.getAll({ page: 1, size: 1000 });
            return brandRes.data?.content ?? [];
        }
    });

    const handleProductImageUpload = (file) => {
        if (productImageFiles.length >= MAX_PRODUCT_IMAGES) {
            notification.warning({ message: t('warning'), description: t('admin_max_images_reached') });
            return false;
        }
        setProductImageFiles(prev => [...prev, file]);
        return false;
    };

    const handleRemoveProductImage = (index) => {
        setProductImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleCreateProduct = async ({ name, description, categories: cats, brandId }) => {
        setLoading(true);
        try {
            const res = await createProduct({
                data: {
                    name,
                    description,
                    productCategories: cats.map(Number),
                    brandId,
                },
                images: productImageFiles
            });
            setCreatedProductId(res.id);
            notification.success({ message: t('success'), description: t('admin_msg_create_success') });
            setCurrentStep(1);
        } catch (error) {
            if (!error.isGlobalHandled) {
                notification.error({
                    message: t('error'),
                    description: error.response?.data?.message ?? t('api_error_general')
                });
            }
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
        if (names.length !== new Set(names).size) {
            return notification.warning({ message: t('warning'), description: t('admin_error_option_name_duplicate') });
        }
        const hasConflict = optionTypes.some(o => o.isCustomName && optionKeys.map(k => k.toLowerCase()).includes(o.optionName?.trim().toLowerCase()));
        if (hasConflict) {
            return notification.warning({ message: t('warning'), description: t('admin_error_custom_exists') });
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
                setVariants(res.map(v => ({
                    ...v,
                    price: 0,
                    stockQuantity: 0,
                    description: '',
                    newImageFiles: [],
                    existingImageUrls: v.productImageUrl ?? []
                })));
            }
            notification.success({ message: t('success'), description: t('admin_msg_options_success') });
            setCurrentStep(2);
        } catch (error) {
            if (!error.isGlobalHandled) {
                notification.error({ message: t('error'), description: t('admin_error_options_save') });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVariantChange = (id, field, value) => {
        setVariants(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
    };

    const handleVariantImageAdd = (id, file) => {
        setVariants(prev => prev.map(v => {
            if (v.id !== id) return v;
            const totalImages = (v.existingImageUrls?.length ?? 0) + (v.newImageFiles?.length ?? 0);
            if (totalImages >= MAX_VARIANT_IMAGES) {
                notification.warning({ message: t('warning'), description: t('admin_max_images_reached') });
                return v;
            }
            return { ...v, newImageFiles: [...(v.newImageFiles ?? []), file] };
        }));
        return false;
    };

    const handleRemoveVariantNewImage = (variantId, fileIndex) => {
        setVariants(prev => prev.map(v => {
            if (v.id !== variantId) return v;
            return { ...v, newImageFiles: v.newImageFiles.filter((_, i) => i !== fileIndex) };
        }));
    };

    const handleSaveVariants = async () => {
        if (!createdProductId) return;
        setLoading(true);
        try {
            await Promise.all(variants.map(({ id, productVariantName, price, stockQuantity, description, newImageFiles, existingImageUrls }) =>
                updateVariant({
                    data: {
                        id,
                        productVariantName,
                        price,
                        stockQuantity,
                        description,
                        productImageUrl: existingImageUrls ?? [],
                        status: 'ACTIVE'
                    },
                    images: newImageFiles ?? []
                })
            ));
            notification.success({ message: t('success'), description: t('admin_msg_variants_success') });
            const slug = generateSlug(variants[0].productVariantName, variants[0].id);
            navigate(`/admin/products/${slug}`);
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
    }, [isPreview, optionTypes]);

    const currentVariant = useMemo(() => {
        if (!variants.length || !Object.keys(selectedOptions).length) return null;
        const selectedValues = optionTypes
            .map(opt => selectedOptions[opt.optionName])
            .filter(Boolean);
        return variants.find(v => {
            if (!v.optionValues?.length) return false;
            return selectedValues.every(val => v.optionValues.includes(val));
        }) ?? null;
    }, [variants, selectedOptions, optionTypes]);

    const shownPrice = currentVariant?.price ?? 0;

    const getVariantPreviewImage = () => {
        if (!currentVariant) return previewImage;
        if (currentVariant.newImageFiles?.length > 0) return URL.createObjectURL(currentVariant.newImageFiles[0]);
        if (currentVariant.existingImageUrls?.length > 0) return getImageUrl(currentVariant.existingImageUrls[0]);
        return previewImage;
    };

    const variantImage = isPreview ? getVariantPreviewImage() : previewImage;

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
                                        type="button"
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

    const renderImageUploadArea = () => (
        <div className="pc-multi-upload-area">
            <div className="pc-upload-thumbnails">
                {productImageFiles.map((file, idx) => (
                    <div key={idx} className="pc-upload-thumb-item">
                        <img src={URL.createObjectURL(file)} alt={`product-${idx}`} />
                        <button type="button" className="pc-upload-thumb-remove" onClick={() => handleRemoveProductImage(idx)}>
                            <DeleteOutlined />
                        </button>
                    </div>
                ))}
                {productImageFiles.length < MAX_PRODUCT_IMAGES && (
                    <Upload
                        showUploadList={false}
                        beforeUpload={handleProductImageUpload}
                        accept="image/*"
                        multiple
                    >
                        <div className="pc-upload-thumb-add">
                            <PlusOutlined />
                            <span>{t('admin_btn_upload')}</span>
                        </div>
                    </Upload>
                )}
            </div>
            <p className="pc-upload-hint">{t('admin_upload_images_hint')} ({productImageFiles.length}/{MAX_PRODUCT_IMAGES})</p>
        </div>
    );

    return (
        <div className="pc-create-container">
            <div className="pc-header-section">
                <button type="button" className="pc-back-btn" onClick={() => navigate('/admin/products')}>
                    <PlusOutlined style={{ transform: 'rotate(45deg)' }} />
                </button>
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
                    items={[{ title: t('admin_step_1') }, { title: t('admin_step_3') }, { title: t('admin_step_4') }]}
                />
            </div>

            <div className="pc-product-preview-wrap">
                <div className="pc-product-top-section">
                    <div className="pc-product-gallery">
                        <div className="pc-thumbnail-list">
                            {productImageFiles.length > 0 ? productImageFiles.map((file, idx) => (
                                <div key={idx} className={`pc-thumb-item ${idx === 0 ? 'active' : ''}`}>
                                    <img src={URL.createObjectURL(file)} alt={`thumb-${idx}`} />
                                </div>
                            )) : (
                                <div className="pc-thumb-item active">
                                    <img src={PRODUCT_IMAGE_FALLBACK} alt={t('admin_product_image')} />
                                </div>
                            )}
                        </div>
                        <div className="pc-main-image">
                            <img
                                src={isPreview ? variantImage : previewImage}
                                alt={t('product')}
                                className="pc-main-img-fit"
                                onError={(e) => { e.target.src = PRODUCT_IMAGE_FALLBACK; }}
                            />
                        </div>
                    </div>

                    <div className="pc-product-info-side">
                        <div className="pc-info-header">
                            <div className="pc-brand-label">{brands.find(b => b.id === formValues.brandId)?.name ?? ''}</div>
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
                                    {currentVariant ? currentVariant.productVariantName : (formValues.name ? formValues.name : t('admin_placeholder_product_name'))}
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
                                    <div className="pc-detail-current-price">
                                        {shownPrice.toLocaleString(locale)}{t('admin_unit_vnd')}
                                    </div>
                                </div>
                                {renderPreviewOptions()}
                                {optionTypes.length > 0 && optionTypes[0].optionName !== '' && (
                                    <div className="pc-stock-wrapper">
                                        {Object.keys(selectedOptions).length > 0 && (
                                            <div className="admin-pd-selected-variant">
                                                <span className="admin-pd-variant-label">{t('variant_selected_label')}: </span>
                                                <strong className="admin-pd-variant-value">{Object.values(selectedOptions).join(' - ')}</strong>
                                            </div>
                                        )}
                                        <div className="admin-pd-stock-info">{t('in_stock_label')} <strong>{currentVariant?.stockQuantity ?? 0}</strong> {t('items_available')}</div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="pc-edit-content">
                                {currentStep === 0 && (
                                    <Form form={form} layout="vertical" onFinish={handleCreateProduct} initialValues={formValues} onValuesChange={(_, allValues) => setFormValues(allValues)} requiredMark={false} className="pc-form-full">
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
                                        <Form.Item name="description" className="pc-mb-16">
                                            <CInput multiline rows={3} placeholder={t('admin_placeholder_desc')} />
                                        </Form.Item>
                                        <div className="pc-input-label">{t('admin_product_images')}</div>
                                        {renderImageUploadArea()}
                                        <CButton type="primary" htmlType="submit" loading={loading} block size="large" className="pc-mt-10">{t('admin_btn_create_continue')}</CButton>
                                    </Form>
                                )}
                                {currentStep === 1 && (
                                    <div className="pc-step-content">
                                        <h3 className="pc-step-title">{t('admin_step_3')}</h3>
                                        {optionTypes.map((opt, index) => (
                                            <div key={index} className="pc-option-group">
                                                <div className="pc-option-header">
                                                    <Select value={opt.isCustomName ? 'OTHER_CUSTOM' : (opt.optionName ? opt.optionName : undefined)} onChange={(val) => handleOptionSelectChange(index, val)} placeholder={t('admin_placeholder_option_name')} className="pc-opt-select" style={{ flex: 1 }}>
                                                        {optionKeys.map(k => <Option key={k} value={k} disabled={optionTypes.some((o, i) => i !== index && o.optionName === k)}>{k}</Option>)}
                                                        <Option value="OTHER_CUSTOM" style={{ color: 'var(--color_main)', fontWeight: 600 }}>+ {t('other')}</Option>
                                                    </Select>
                                                    {opt.isCustomName && <CInput value={opt.optionName} onChange={(e) => handleOptionNameChange(index, e.target.value)} placeholder={t('admin_placeholder_option_name_custom')} className="pc-opt-input" style={{ flex: 1 }} />}
                                                    {index > 0 && (
                                                        <CButton
                                                            type="text"
                                                            danger
                                                            icon={<DeleteOutlined />}
                                                            onClick={() => handleRemoveOptionType(index)}
                                                            className="pc-delete-opt-btn"
                                                        />
                                                    )}
                                                </div>
                                                <Select mode="tags" className="pc-tags-select pc-w-100" placeholder={t('admin_placeholder_option_values_short')} value={opt.optionValues} onChange={(val) => handleOptionValuesChange(index, val)} options={(!opt.isCustomName && availableOptions[opt.optionName]) ? availableOptions[opt.optionName].map(v => ({ value: v, label: v })) : []} />
                                            </div>
                                        ))}
                                        <CButton type="dashed" onClick={handleAddOptionType} icon={<PlusOutlined />} block className="pc-mt-10">{t('admin_btn_add_option')}</CButton>
                                        <div className="pc-actions-flex pc-mt-48">
                                            <CButton type="secondary" onClick={() => setCurrentStep(0)} className="pc-flex-1">{t('back')}</CButton>
                                            <CButton type="primary" onClick={handleSubmitOptions} loading={loading} className="pc-flex-2">{t('admin_btn_gen_variants')}</CButton>
                                        </div>
                                    </div>
                                )}
                                {currentStep === 2 && (
                                    <div className="pc-step-content">
                                        <h3 className="pc-step-title">{t('admin_step_4')}</h3>
                                        <div className="pc-custom-scrollbar">
                                            {variants.map(record => (
                                                <div key={record.id} className="pc-variant-row">
                                                    <div className="pc-variant-images-section">
                                                        <div className="pc-variant-thumbs">
                                                            {(record.existingImageUrls ?? []).map((url, idx) => (
                                                                <div key={`existing-${idx}`} className="pc-variant-thumb-item">
                                                                    <img src={getImageUrl(url)} alt={`v-${idx}`} />
                                                                </div>
                                                            ))}
                                                            {(record.newImageFiles ?? []).map((file, idx) => (
                                                                <div key={`new-${idx}`} className="pc-variant-thumb-item">
                                                                    <img src={URL.createObjectURL(file)} alt={`v-new-${idx}`} />
                                                                    <button type="button" className="pc-upload-thumb-remove" onClick={() => handleRemoveVariantNewImage(record.id, idx)}>
                                                                        <DeleteOutlined />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                            {((record.existingImageUrls?.length ?? 0) + (record.newImageFiles?.length ?? 0)) < MAX_VARIANT_IMAGES && (
                                                                <Upload showUploadList={false} beforeUpload={(file) => handleVariantImageAdd(record.id, file)} accept="image/*">
                                                                    <div className="pc-variant-thumb-add">
                                                                        <FileImageOutlined />
                                                                    </div>
                                                                </Upload>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="pc-variant-info-col">
                                                        <span className="pc-variant-name">{record.productVariantName}</span>
                                                        <div className="pc-variant-inputs-grid">
                                                            <div className="pc-variant-input-col">
                                                                <div className="pc-variant-input-label">{t('admin_label_price')}</div>
                                                                <InputNumber value={record.price} min={0} className="pc-w-100" formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\$\s?|(,*)/g, '')} onChange={(val) => handleVariantChange(record.id, 'price', val)} />
                                                            </div>
                                                            <div className="pc-variant-input-col">
                                                                <div className="pc-variant-input-label">{t('admin_label_stock')}</div>
                                                                <InputNumber value={record.stockQuantity} min={0} className="pc-w-100" onChange={(val) => handleVariantChange(record.id, 'stockQuantity', val)} />
                                                            </div>
                                                        </div>
                                                        <CInput multiline rows={2} placeholder={t('admin_placeholder_desc')} value={record.description} onChange={(e) => handleVariantChange(record.id, 'description', e.target.value)} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="pc-actions-flex pc-mt-48">
                                            <CButton type="secondary" onClick={() => setCurrentStep(1)} className="pc-flex-1">{t('back')}</CButton>
                                            <CButton type="primary" onClick={handleSaveVariants} loading={loading} className="pc-flex-2"><CheckCircleOutlined /> {t('admin_btn_save_finish')}</CButton>
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
