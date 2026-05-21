import { Skeleton } from "@/components/common";
import publicProductService from '@/features/products/services/publicProductService';
import productService from '@/features/products/services/productService';
import ReviewList from '@/features/reviews/ReviewList';
import { useQuery } from '@tanstack/react-query';
import brandService from '@/features/brands/services/brandService';
import NotFound from '@/pages/error/NotFound';
import { getImageUrl } from '@/services/axiosClient';
import { useLanguage } from '@/store/LanguageContext';
import { generateSlug, getIdFromSlug, PRODUCT_IMAGE_FALLBACK } from '@/utils/helpers';
import { DeleteOutlined, EditOutlined, PlusOutlined, StarFilled } from '@ant-design/icons';
import { Col, Form, InputNumber, Modal, Row, Select, Tag, Upload, notification } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { CButton, CInput } from '@/components/common';
import { useProducts } from '@/features/products/hooks/useProducts';
import { usePublicProducts } from '@/features/products/hooks/usePublicProducts';
import './AdminProductDetail.css';

const MAX_PRODUCT_IMAGES = 5;
const MAX_VARIANT_IMAGES = 3;

export default function AdminProductDetail() {
    const { slug } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { t, language } = useLanguage();
    const locale = language === 'vi' ? 'vi-VN' : 'en-US';

    const productId = location.state?.productId ?? getIdFromSlug(slug);

    const [productData, setProductData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    const [activeTab, setActiveTab] = useState('details');
    const [selectedOptions, setSelectedOptions] = useState({});
    const [stockQuantity, setStockQuantity] = useState(0);
    const [soldQuantity, setSoldQuantity] = useState(0);
    const [mainImage, setMainImage] = useState(PRODUCT_IMAGE_FALLBACK);

    const [currentPrice, setCurrentPrice] = useState({ originPrice: 0, promotionPrice: 0, hasDiscount: false });

    const [editVariantModal, setEditVariantModal] = useState(false);
    const [editingVariant, setEditingVariant] = useState(null);
    const [editVariantImages, setEditVariantImages] = useState([]);
    const [editVariantNewFiles, setEditVariantNewFiles] = useState([]);
    const [editVariantLoading, setEditVariantLoading] = useState(false);

    const [editProductModal, setEditProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editProductImages, setEditProductImages] = useState([]);
    const [editProductNewFiles, setEditProductNewFiles] = useState([]);
    const [editProductLoading, setEditProductLoading] = useState(false);

    const { updateVariant, updateProduct } = useProducts();
    const { categories } = usePublicProducts();

    const { data: brands = [] } = useQuery({
        queryKey: ['brands'],
        queryFn: async () => {
            const brandRes = await brandService.getAll({ page: 1, size: 1000 });
            return brandRes.data?.content ?? [];
        }
    });

    const galleryImages = useMemo(() => {
        if (!productData) return [];
        const images = [];
        if (productData.productImages?.length > 0) {
            productData.productImages.forEach(img => {
                const url = typeof img === 'object' ? img.imageUrl : img;
                if (url) images.push(getImageUrl(url));
            });
        }
        const targetVariant = productData.variants?.find(v => v.id === productData.id);
        if (targetVariant?.productImageUrl) {
            const variantUrls = Array.isArray(targetVariant.productImageUrl) ? targetVariant.productImageUrl : [targetVariant.productImageUrl];
            variantUrls.forEach(url => {
                if (url) {
                    const fullUrl = getImageUrl(url);
                    if (!images.includes(fullUrl)) images.push(fullUrl);
                }
            });
        }
        if (images.length === 0) images.push(PRODUCT_IMAGE_FALLBACK);
        return images;
    }, [productData]);

    useEffect(() => {
        if (galleryImages.length > 0) setMainImage(galleryImages[0]);
    }, [galleryImages]);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!productId) {
                setIsError(true);
                setIsLoading(false);
                return;
            }
            setIsError(false);
            setIsLoading(true);
            try {
                const responseData = (await publicProductService.getById(productId)).data;
                if (!responseData) throw new Error("Not found");

                setCurrentPrice({
                    originPrice: responseData.originPrice,
                    promotionPrice: responseData.promotionPrice,
                    hasDiscount: (responseData.promotionPrice !== undefined && responseData.promotionPrice !== null) && responseData.promotionPrice < responseData.originPrice,
                });

                const targetVariant = responseData.variants?.find(v => v.id === responseData.id) ?? responseData.variants?.[0];
                setProductData(responseData);
                setSelectedOptions(targetVariant?.variantOptions ?? {});
                setStockQuantity(targetVariant?.stockQuantity ?? 0);
                setSoldQuantity(targetVariant?.sold ?? 0);
            } catch {
                setIsError(true);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    const findMatchedVariant = (options) => {
        if (!productData?.variants) return null;
        const normalize = (val) => val?.toString().toLowerCase().trim();
        return productData.variants.find(v => {
            if (!v.variantOptions) return false;
            return Object.entries(options).every(([key, value]) =>
                normalize(v.variantOptions[key]) === normalize(value)
            );
        });
    };

    const handleOptionSelect = (optName, val) => {
        if (!productData?.variants) return;
        const newSelectedOptions = { ...selectedOptions, [optName]: val };
        setSelectedOptions(newSelectedOptions);
        const matchedVariant = findMatchedVariant(newSelectedOptions);
        if (matchedVariant) {
            setStockQuantity(matchedVariant.stockQuantity);
            setSoldQuantity(matchedVariant.sold ?? 0);
            if (matchedVariant.id !== productData.id) {
                const combinedName = matchedVariant.productVariantName ?? productData.name;
                const newSlug = generateSlug(combinedName, matchedVariant.id);
                navigate(`/admin/products/${newSlug}`, {
                    replace: true,
                    state: { ...location.state, productId: matchedVariant.id }
                });
            }
        }
    };

    const openEditVariantModal = (variant) => {
        setEditingVariant({
            id: variant.id,
            productVariantName: variant.productVariantName,
            price: variant.originPrice ?? variant.price ?? 0,
            stockQuantity: variant.stockQuantity ?? 0,
            description: variant.description ?? '',
            status: variant.status ?? 'ACTIVE',
        });
        const urls = Array.isArray(variant.productImageUrl)
            ? variant.productImageUrl
            : (variant.productImageUrl ? [variant.productImageUrl] : []);
        setEditVariantImages(urls);
        setEditVariantNewFiles([]);
        setEditVariantModal(true);
    };

    const handleEditVariantRemoveExisting = (index) => {
        setEditVariantImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleEditVariantRemoveNew = (index) => {
        setEditVariantNewFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleEditVariantAddFile = (file) => {
        const total = editVariantImages.length + editVariantNewFiles.length;
        if (total >= MAX_VARIANT_IMAGES) {
            notification.warning({ message: t('warning'), description: t('admin_max_images_reached') });
            return false;
        }
        setEditVariantNewFiles(prev => [...prev, file]);
        return false;
    };

    const handleSaveEditVariant = async () => {
        if (!editingVariant) return;
        setEditVariantLoading(true);
        try {
            await updateVariant({
                data: {
                    id: editingVariant.id,
                    productVariantName: editingVariant.productVariantName,
                    price: editingVariant.price,
                    stockQuantity: editingVariant.stockQuantity,
                    description: editingVariant.description,
                    productImageUrl: editVariantImages,
                    status: editingVariant.status,
                },
                images: editVariantNewFiles
            });
            setEditVariantModal(false);
            const responseData = (await publicProductService.getById(productId)).data;
            if (responseData) {
                setProductData(responseData);
                const targetVariant = responseData.variants?.find(v => v.id === productData.id) ?? responseData.variants?.[0];
                setStockQuantity(targetVariant?.stockQuantity ?? 0);
                setSoldQuantity(targetVariant?.sold ?? 0);
            }
        } catch {
            notification.error({ message: t('error'), description: t('api_error_general') });
        } finally {
            setEditVariantLoading(false);
        }
    };

    const openEditProductModal = () => {
        if (!productData) return;
        setEditingProduct({
            id: productData.productId, // parent product ID
            name: productData.productName ?? productData.name, // parent product name
            brandId: brands.find(b => b.name === productData.brand)?.id ?? null,
            productCategories: productData.categories?.map(cat => typeof cat === 'object' ? cat.id : cat) ?? [],
            description: productData.description ?? '',
        });
        setEditProductImages(productData.productImages ?? []);
        setEditProductNewFiles([]);
        setEditProductModal(true);
    };

    const handleEditProductRemoveExisting = (index) => {
        setEditProductImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleEditProductRemoveNew = (index) => {
        setEditProductNewFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleEditProductAddFile = (file) => {
        const total = editProductImages.length + editProductNewFiles.length;
        if (total >= MAX_PRODUCT_IMAGES) {
            notification.warning({ message: t('warning'), description: t('admin_max_images_reached') });
            return false;
        }
        setEditProductNewFiles(prev => [...prev, file]);
        return false;
    };

    const handleSaveEditProduct = async () => {
        if (!editingProduct) return;
        setEditProductLoading(true);
        try {
            await updateProduct({
                data: {
                    id: editingProduct.id,
                    name: editingProduct.name,
                    description: editingProduct.description,
                    productCategories: editingProduct.productCategories,
                    imageUrl: editProductImages
                },
                images: editProductNewFiles
            });
            setEditProductModal(false);
            const responseData = (await publicProductService.getById(productId)).data;
            if (responseData) {
                setProductData(responseData);
                setCurrentPrice({
                    originPrice: responseData.originPrice,
                    promotionPrice: responseData.promotionPrice,
                    hasDiscount: (responseData.promotionPrice !== undefined && responseData.promotionPrice !== null) && responseData.promotionPrice < responseData.originPrice,
                });
                const targetVariant = responseData.variants?.find(v => v.id === responseData.id) ?? responseData.variants?.[0];
                setStockQuantity(targetVariant?.stockQuantity ?? 0);
                setSoldQuantity(targetVariant?.sold ?? 0);
            }
        } catch (error) {
            if (!error.isGlobalHandled) {
                notification.error({
                    message: t('error'),
                    description: error.response?.data?.message ?? t('api_error_general')
                });
            }
        } finally {
            setEditProductLoading(false);
        }
    };

    const displayName = productData?.name;
    const shownPrice = currentPrice.hasDiscount ? currentPrice.promotionPrice : currentPrice.originPrice;

    if (isError) return <NotFound />;
    if (isLoading || !productData) return (
        <div className="admin-pd-page">
            <div className="admin-pd-top-section">
                <Skeleton width="45%" height="450px" borderRadius="16px" className="admin-pd-skeleton-img" />
                <div className="admin-pd-skeleton-info">
                    <Skeleton width="30%" height="20px" borderRadius="4px" className="admin-pd-mb15" />
                    <Skeleton width="80%" height="40px" borderRadius="8px" className="admin-pd-mb20" />
                    <Skeleton width="40%" height="30px" borderRadius="6px" className="admin-pd-mb30" />
                    <Skeleton width="100%" height="80px" borderRadius="12px" className="admin-pd-mb30" />
                    <Skeleton width="100%" height="60px" borderRadius="12px" />
                </div>
            </div>
        </div>
    );

    const tabs = [
        { id: 'details', label: t('product_details') },
        { id: 'reviews', label: `${t('reviews')} (${productData.reviewCount})` }
    ];

    const currentVariant = productData.variants?.find(v => v.id === productData.id);

    return (
        <div className="admin-pd-page">
            <div className="admin-pd-breadcrumb">
                <Link to={'/admin/products'} state={{ fromDetail: true }}>{t('admin_home_products_title')}</Link>
                <span className="admin-pd-divider">/</span>
                <span className="admin-pd-current">{displayName}</span>
            </div>

            <div className="admin-pd-top-section">
                <div className="admin-pd-gallery">
                    <div className="admin-pd-thumbnail-list">
                        {galleryImages.map((img, idx) => (
                            <button
                                key={idx}
                                className={`admin-pd-thumb-item ${mainImage === img ? 'active' : ''}`}
                                onClick={() => setMainImage(img)}
                                type="button"
                            >
                                <img src={img} alt={`Thumb ${idx}`} width="80" height="80" loading="lazy" onError={(e) => { e.target.src = PRODUCT_IMAGE_FALLBACK; }} />
                            </button>
                        ))}
                    </div>
                    <div className="admin-pd-main-image">
                        <img
                            src={mainImage}
                            alt={displayName}
                            onError={(e) => { e.target.src = PRODUCT_IMAGE_FALLBACK; }}
                            width="450"
                            height="450"
                            loading="eager"
                            fetchpriority="high"
                        />
                        {currentPrice.hasDiscount && <div className="admin-pd-discount-badge-main">{t('promotions')}</div>}
                    </div>
                </div>

                <div className="admin-pd-info-side">
                    <div className="admin-pd-brand-label">
                        {productData.brand}
                        {productData.status && (
                            <Tag color={productData.status === 'ACTIVE' ? 'processing' : 'error'} style={{ marginLeft: 10 }}>
                                {productData.status}
                            </Tag>
                        )}
                    </div>
                    <h1 className="admin-pd-detail-title">{displayName}</h1>

                    {productData.categories?.length > 0 && (
                        <div className="admin-pd-detail-categories">
                            <span className="admin-pd-categories-label">{t('categories')}: </span>
                            {productData.categories.map((cat, idx) => (
                                <span key={idx} className="admin-pd-category-tag">
                                    {typeof cat === 'object' ? cat.categoryName : cat}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="admin-pd-rating-container">
                        <StarFilled className="admin-pd-star" />
                        {Number(productData.averageRating ?? 0).toFixed(1)}/5 ({productData.reviewCount ?? 0} {t('reviews')})
                    </div>

                    <div className="admin-pd-price-box">
                        <div className="admin-pd-current-price-wrapper">
                            <div className="admin-pd-current-price">
                                {shownPrice.toLocaleString(locale)}{t('admin_unit_vnd')}
                            </div>
                            {currentPrice.hasDiscount && (
                                <div className="admin-pd-old-price-wrapper">
                                    <span className="admin-pd-old-price-text">
                                        {currentPrice.originPrice.toLocaleString(locale)}{t('admin_unit_vnd')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="admin-pd-options-section">
                        {productData.options?.map((opt, idx) => (
                            <div key={idx} className="admin-pd-option-group">
                                <span className="admin-pd-option-label">{opt.name}:</span>
                                <div className="admin-pd-size-options">
                                    {opt.values.map(val => {
                                        const isActive = selectedOptions[opt.name]?.toString().toLowerCase().trim() === val?.toString().toLowerCase().trim();
                                        return (
                                            <button
                                                key={val}
                                                type="button"
                                                className={`admin-pd-size-btn ${isActive ? 'active' : ''}`}
                                                onClick={() => handleOptionSelect(opt.name, val)}
                                            >
                                                {val}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {Object.keys(selectedOptions).length > 0 && (
                            <div className="admin-pd-selected-variant">
                                <span className="admin-pd-variant-label">{t('product_selected')} </span>
                                <strong className="admin-pd-variant-value">
                                    {Object.values(selectedOptions).join(' - ')}
                                </strong>
                            </div>
                        )}

                        <div className="product-meta-stats-row">
                            <div className="stat-badge-item stock-badge">
                                <span className="stat-dot green-dot"></span>
                                <span className="stat-text">
                                    {t('product_stock_count').split('{count}')[0]}
                                    <strong className="stat-value">{stockQuantity}</strong>
                                    {t('product_stock_count').split('{count}')[1]}
                                </span>
                            </div>
                            <div className="stat-badge-divider"></div>
                            <div className="stat-badge-item sold-badge">
                                <span className="stat-dot gray-dot"></span>
                                <span className="stat-text">
                                    {t('product_sold_count').split('{count}')[0]}
                                    <strong className="stat-value">{soldQuantity}</strong>
                                    {t('product_sold_count').split('{count}')[1]}
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                            {currentVariant && (
                                <CButton
                                    type="primary"
                                    icon={<EditOutlined />}
                                    onClick={() => openEditVariantModal(currentVariant)}
                                    className="admin-pd-edit-variant-btn"
                                    style={{ marginTop: 0 }}
                                >
                                    {t('admin_edit_sub_product')}
                                </CButton>
                            )}
                            <CButton
                                type="outline"
                                icon={<EditOutlined />}
                                onClick={openEditProductModal}
                                className="admin-pd-edit-variant-btn"
                                style={{ marginTop: 0 }}
                            >
                                {t('admin_edit_product')}
                            </CButton>
                        </div>
                    </div>
                </div>
            </div>

            <div className="admin-pd-tabs-container">
                <div className="admin-pd-tab-headers">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            type="button"
                            className={`admin-pd-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="admin-pd-tab-body">
                    {activeTab === 'details' && (
                        <div className="admin-pd-tab-content animate-fade-in">
                            <p className="admin-pd-description-text">
                                {productData.description}
                            </p>
                        </div>
                    )}
                    {activeTab === 'reviews' && (
                        <div className="admin-pd-reviews-wrapper animate-fade-in">
                            <ReviewList variantId={productData.id} />
                        </div>
                    )}
                </div>
            </div>

            <Modal
                title={t('admin_edit_sub_product')}
                open={editVariantModal}
                onCancel={() => setEditVariantModal(false)}
                footer={null}
                width={600}
                destroyOnClose
            >
                {editingVariant && (
                    <Form layout="vertical" className="admin-pd-edit-form">
                        <Form.Item label={t('admin_product_name')}>
                            <CInput value={editingVariant.productVariantName} onChange={(e) => setEditingVariant(prev => ({ ...prev, productVariantName: e.target.value }))} />
                        </Form.Item>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label={t('admin_label_price')}>
                                    <InputNumber
                                        value={editingVariant.price}
                                        min={0}
                                        className="pc-w-100"
                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                        onChange={(val) => setEditingVariant(prev => ({ ...prev, price: val }))}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label={t('admin_label_stock')}>
                                    <InputNumber value={editingVariant.stockQuantity} min={0} className="pc-w-100" onChange={(val) => setEditingVariant(prev => ({ ...prev, stockQuantity: val }))} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.Item label={t('admin_label_desc')}>
                            <CInput multiline rows={3} value={editingVariant.description} onChange={(e) => setEditingVariant(prev => ({ ...prev, description: e.target.value }))} />
                        </Form.Item>
                        <Form.Item label={t('status')}>
                            <Select value={editingVariant.status} onChange={(val) => setEditingVariant(prev => ({ ...prev, status: val }))}>
                                <Select.Option value="ACTIVE">{t('active')}</Select.Option>
                                <Select.Option value="INACTIVE">{t('inactive')}</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item label={t('admin_variant_images')}>
                            <div className="admin-pd-edit-images">
                                {editVariantImages.map((url, idx) => (
                                    <div key={`existing-${idx}`} className="admin-pd-edit-img-item">
                                        <img src={getImageUrl(url)} alt={`img-${idx}`} />
                                        <button type="button" className="admin-pd-edit-img-remove" onClick={() => handleEditVariantRemoveExisting(idx)}>
                                            <DeleteOutlined />
                                        </button>
                                    </div>
                                ))}
                                {editVariantNewFiles.map((file, idx) => (
                                    <div key={`new-${idx}`} className="admin-pd-edit-img-item">
                                        <img src={URL.createObjectURL(file)} alt={`new-${idx}`} />
                                        <button type="button" className="admin-pd-edit-img-remove" onClick={() => handleEditVariantRemoveNew(idx)}>
                                            <DeleteOutlined />
                                        </button>
                                    </div>
                                ))}
                                {(editVariantImages.length + editVariantNewFiles.length) < MAX_VARIANT_IMAGES && (
                                    <Upload showUploadList={false} beforeUpload={handleEditVariantAddFile} accept="image/*">
                                        <div className="admin-pd-edit-img-add">
                                            <PlusOutlined />
                                        </div>
                                    </Upload>
                                )}
                            </div>
                        </Form.Item>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                            <CButton type="secondary" onClick={() => setEditVariantModal(false)}>{t('cancel')}</CButton>
                            <CButton type="primary" onClick={handleSaveEditVariant} loading={editVariantLoading}>{t('admin_save_changes')}</CButton>
                        </div>
                    </Form>
                )}
            </Modal>

            <Modal
                title={t('admin_edit_product')}
                open={editProductModal}
                onCancel={() => setEditProductModal(false)}
                footer={null}
                width={600}
                destroyOnClose
            >
                {editingProduct && (
                    <Form layout="vertical" className="admin-pd-edit-form">
                        <Form.Item label={t('admin_product_name')} required>
                            <CInput value={editingProduct.name} onChange={(e) => setEditingProduct(prev => ({ ...prev, name: e.target.value }))} />
                        </Form.Item>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label={t('admin_label_brand')}>
                                    <Select value={editingProduct.brandId} disabled className="pc-select-modern" style={{ width: '100%' }}>
                                        {brands.map(brand => <Select.Option key={brand.id} value={brand.id}>{brand.name}</Select.Option>)}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label={t('admin_label_category')} required>
                                    <Select mode="multiple" className="pc-select-modern" style={{ width: '100%' }} value={editingProduct.productCategories} onChange={(vals) => setEditingProduct(prev => ({ ...prev, productCategories: vals }))}>
                                        {categories.map(cat => <Select.Option key={cat.id} value={cat.id}>{cat.categoryName}</Select.Option>)}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.Item label={t('admin_label_desc')}>
                            <CInput multiline rows={3} value={editingProduct.description} onChange={(e) => setEditingProduct(prev => ({ ...prev, description: e.target.value }))} />
                        </Form.Item>
                        <Form.Item label={t('admin_product_images')}>
                            <div className="admin-pd-edit-images">
                                {editProductImages.map((url, idx) => (
                                    <div key={`existing-${idx}`} className="admin-pd-edit-img-item">
                                        <img src={getImageUrl(url)} alt={`img-${idx}`} />
                                        <button type="button" className="admin-pd-edit-img-remove" onClick={() => handleEditProductRemoveExisting(idx)}>
                                            <DeleteOutlined />
                                        </button>
                                    </div>
                                ))}
                                {editProductNewFiles.map((file, idx) => (
                                    <div key={`new-${idx}`} className="admin-pd-edit-img-item">
                                        <img src={URL.createObjectURL(file)} alt={`new-${idx}`} />
                                        <button type="button" className="admin-pd-edit-img-remove" onClick={() => handleEditProductRemoveNew(idx)}>
                                            <DeleteOutlined />
                                        </button>
                                    </div>
                                ))}
                                {(editProductImages.length + editProductNewFiles.length) < MAX_PRODUCT_IMAGES && (
                                    <Upload showUploadList={false} beforeUpload={handleEditProductAddFile} accept="image/*">
                                        <div className="admin-pd-edit-img-add">
                                            <PlusOutlined />
                                        </div>
                                    </Upload>
                                )}
                            </div>
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 4, display: 'block' }}>
                                {t('admin_upload_images_hint')} ({editProductImages.length + editProductNewFiles.length}/{MAX_PRODUCT_IMAGES})
                            </span>
                        </Form.Item>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                            <CButton type="secondary" onClick={() => setEditProductModal(false)}>{t('cancel')}</CButton>
                            <CButton type="primary" onClick={handleSaveEditProduct} loading={editProductLoading}>{t('admin_save_changes')}</CButton>
                        </div>
                    </Form>
                )}
            </Modal>
        </div>
    );
}
