import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';

import './ProductDetail.css';
import {
    StarFilled,
    CheckCircleFilled,
    HeartOutlined,
    MessageOutlined
} from '@ant-design/icons';
import best_selling_image from "../../Assets/Images/Products/product_placeholder.svg";
import Pagination from "../../Component/Common/Pagination";
import Skeleton from "../../Component/Common/Skeleton";
import productApi from '../../api/productApi';
import { getImageUrl } from '../../api/axiosClient';
import NotFound from '../../Component/ErrorPages/NotFound';

export default function ProductDetail({ previewProduct }) {
    const { id } = useParams();
    const { t, language } = useLanguage();

    const categoryName = t('admin_home_products_title');
    const categoryLink = '/admin/products';

    const [productData, setProductData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    const [activeTab, setActiveTab] = useState('details');
    const [selectedOptions, setSelectedOptions] = useState({});
    const [currentVariant, setCurrentVariant] = useState(null);
    const [mainImage, setMainImage] = useState(best_selling_image);

    const [reviewPage, setReviewPage] = useState(0);
    const reviewsPerPage = 5;

    useEffect(() => {
        if (productData && productData.images && productData.images.length > 0) {
            setMainImage(productData.images[0]);
        }
    }, [productData]);

    useEffect(() => {
        if (previewProduct) {
            setProductData(previewProduct);
            setMainImage(previewProduct.images?.[0] || best_selling_image);
            setIsLoading(false);
            return;
        }

        const fetchProduct = async () => {
            setIsLoading(true);
            setIsError(false);
            try {
                const response = await productApi.getById(id);
                const found = response.data;

                if (found) {
                    const mappedVariants = (found.variants || []).map(v => ({
                        id: v.id,
                        variantOptions: v.variantOptions || {},
                        price: parseFloat(v.price) || 0,
                        stockQuantity: v.stockQuantity || 0,
                        image: v.productImageUrl ? getImageUrl(v.productImageUrl) : null,
                        productVariantName: v.productVariantName
                    }));

                    const variantImages = mappedVariants
                        .map(v => v.image)
                        .filter(img => img !== null && img !== "");

                    let options = found.options || [];
                    if (options.length === 0) {
                        const optionsMap = {};
                        mappedVariants.forEach(v => {
                            if (v.variantOptions) {
                                Object.entries(v.variantOptions).forEach(([name, val]) => {
                                    if (!optionsMap[name]) optionsMap[name] = new Set();
                                    optionsMap[name].add(val);
                                });
                            }
                        });

                        options = Object.entries(optionsMap).map(([name, valuesSet]) => ({
                            name: name,
                            values: Array.from(valuesSet)
                        }));
                    }

                    const mergedData = {
                        id: found.id,
                        productId: found.id,
                        name: found.name || "Sản phẩm BKEUTY",
                        brand: "BKEUTY",
                        price: mappedVariants.length > 0 ? mappedVariants[0].price : 0,
                        original_price: mappedVariants.length > 0 ? mappedVariants[0].price * 1.1 : 0,
                        rating: 4.8,
                        reviews_count: 124,
                        images: [
                            found.image ? getImageUrl(found.image) : best_selling_image,
                            ...variantImages,
                            best_selling_image
                        ].filter(Boolean).slice(0, 5),
                        options: options,
                        variants: mappedVariants,
                        content: {
                            en: {
                                description: found.description || "High-quality BKEUTY skincare product.",
                                details: "This product is formulated with natural ingredients to provide the best results for your skin health and beauty.",
                                application: "1. Cleanse your skin.\n2. Apply a proper amount to the targeted area.\n3. Massage gently until absorbed.",
                                ingredients: "Aqua, Glycerin, Botanical Extracts, Vitamins, Natural Oils.",
                                advance: "Advanced dermatological technology.",
                                benefits_list: ["Revitalizing", "Repairing", "Moisturizing"]
                            },
                            vi: {
                                description: found.description || "Sản phẩm chăm sóc da cao cấp từ BKEUTY.",
                                details: "Sản phẩm được chiết xuất từ thành phần tự nhiên, giúp nuôi dưỡng làn da khỏe mạnh và rạng rỡ từ bên trong.",
                                application: "1. Làm sạch da.\n2. Thoa một lượng vừa đủ lên vùng da cần chăm sóc.\n3. Massage nhẹ nhàng để dưỡng chất thấm sâu.",
                                ingredients: "Nước khoáng, Glycerin, Chiết xuất thảo mộc, Vitamin, Tinh dầu tự nhiên.",
                                advance: "Công nghệ da liễu tiên tiến.",
                                benefits_list: ["Tái Tạo", "Phục Hồi", "Dưỡng Ẩm"]
                            }
                        },
                        reviews: []
                    };
                    setProductData(mergedData);
                    setMainImage(mergedData.images[0]);
                } else {
                    setIsError(true);
                }
            } catch (err) {
                setIsError(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [id, previewProduct]);

    useEffect(() => {
        if (productData && productData.options) {
            const initialOptions = {};
            productData.options.forEach(opt => {
                if (opt.values && opt.values.length > 0) {
                    initialOptions[opt.name] = opt.values[0];
                }
            });
            setSelectedOptions(initialOptions);
        }
    }, [productData]);

    useEffect(() => {
        if (productData && productData.variants && Object.keys(selectedOptions).length > 0) {
            const match = productData.variants.find(v => {
                if (!v.variantOptions || Object.keys(v.variantOptions).length === 0) return false;
                
                return Object.entries(selectedOptions).every(([optName, selectedVal]) => {
                    const vVal = v.variantOptions[optName];
                    if (!vVal || !selectedVal) return false;
                    return vVal.toString().toLowerCase().trim() === selectedVal.toString().toLowerCase().trim();
                });
            });
            setCurrentVariant(match || null);
        }
    }, [selectedOptions, productData]);

    useEffect(() => {
        if (currentVariant && currentVariant.image) {
            setMainImage(currentVariant.image);
        }
    }, [currentVariant]);

    const totalReviewPages = productData ? Math.ceil(productData.reviews.length / reviewsPerPage) : 0;
    const displayedReviews = productData ? productData.reviews.slice(reviewPage * reviewsPerPage, (reviewPage + 1) * reviewsPerPage) : [];

    const getLocalContent = (key) => {
        if (!productData) return "";
        return productData.content[language === 'vi' ? 'vi' : 'en'][key] || productData.content['en'][key];
    };

    if (isError) return <NotFound />;

    if (isLoading || !productData) return (
        <div className="product-detail-page">
            <div className="product-top-section">
                <Skeleton width="45%" height="450px" style={{ marginRight: '40px', borderRadius: '16px' }} />
                <div style={{ flex: 1 }}>
                    <Skeleton width="30%" height="20px" style={{ marginBottom: '15px' }} />
                    <Skeleton width="80%" height="40px" style={{ marginBottom: '20px' }} />
                    <Skeleton width="40%" height="30px" style={{ marginBottom: '30px' }} />
                    <Skeleton width="100%" height="80px" style={{ marginBottom: '30px' }} />
                    <Skeleton width="100%" height="60px" />
                </div>
            </div>
        </div>
    );



    const tabs = [
        { id: 'details', label: t('product_details') },
        { id: 'application', label: t('how_to_apply') },
        { id: 'ingredients', label: t('ingredients') },
        { id: 'reviews', label: `${t('reviews')} (${productData.reviews_count})` },
    ];

    return (
        <div className="product-detail-page">
            <div className="breadcrumb">
                <Link to={categoryLink} state={{ fromDetail: true }}>{categoryName}</Link>
                <span className="divider">/</span>
                <span className="current">{productData.name}</span>
            </div>

            <div className="product-top-section">
                <div className="product-gallery">
                    <div className="thumbnail-list">
                        {productData.images.map((img, idx) => (
                            <div
                                key={idx}
                                className={`thumb-item ${mainImage === img ? 'active' : ''}`}
                                onClick={() => setMainImage(img)}
                            >
                                <img src={img} alt={`Thumb ${idx}`} />
                            </div>
                        ))}
                    </div>
                    <div className="main-image">
                        <img 
                            src={mainImage} 
                            alt={productData.name} 
                            onError={(e) => { e.target.src = best_selling_image }}
                        />
                    </div>
                </div>

                <div className="product-info-side">
                    <div className="brand-label">{productData.brand}</div>
                    <h1 className="detail-title">{productData.name}</h1>

                    <div className="detail-tags">
                        <div className="rating-container">
                            <StarFilled className="star-icon" />
                            <strong>{productData.rating}</strong>/5 ({productData.reviews_count} {t('reviews')})
                        </div>
                    </div>

                    <div className="price-box">
                        <div className="current-price">
                            {(currentVariant ? currentVariant.price : productData.price).toLocaleString("vi-VN")}đ
                            <span className="vat-tag">{t('vat_included')}</span>
                        </div>
                    </div>

                    <div className="product-options-section">
                        {productData.options && productData.options.map((opt, idx) => (
                            <div key={idx} className="option-group">
                                <span className="option-label">{opt.name.toUpperCase()}:</span>
                                <div className="size-options">
                                    {opt.values.map(val => {
                                        const isActive = selectedOptions[opt.name]?.toString().toLowerCase().trim() === val?.toString().toLowerCase().trim();
                                        return (
                                            <button
                                                key={val}
                                                className={`size-btn ${isActive ? 'active' : ''}`}
                                                onClick={() => setSelectedOptions(prev => ({ ...prev, [opt.name]: val }))}
                                            >
                                                {val}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {currentVariant && (
                            <div className="selected-variant-info">
                                <span className="variant-label-title">{t('variant_selected_label')}: </span>
                                <strong className="variant-label-value">
                                    {currentVariant.variantOptions && Object.keys(currentVariant.variantOptions).length > 0
                                        ? Object.values(currentVariant.variantOptions).join(' - ')
                                        : currentVariant.productVariantName}
                                </strong>
                            </div>
                        )}

                        <div className="stock-info">
                            {t('in_stock_label')} <strong>{currentVariant ? currentVariant.stockQuantity : 0}</strong> {t('items_available')}
                        </div>
                    </div>

                    <div className="actions-wrapper">
                        <div className="admin-preview-badge">
                            {t('admin_preview_mode_msg')}
                        </div>
                    </div>
                </div>
            </div>

            <div className="product-content-tabs">
                <div className="tab-headers">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="tab-body">
                    {activeTab === 'details' && (
                        <div className="tab-content">
                            <h3>{t('product_details')}</h3>
                            <p>{getLocalContent('details')}</p>
                        </div>
                    )}
                    {activeTab === 'application' && (
                        <div className="tab-content">
                            <h3>{t('how_to_apply')}</h3>
                            {getLocalContent('application').split('\n').map((line, i) => (
                                <p key={i}>{line}</p>
                            ))}
                        </div>
                    )}
                    {activeTab === 'ingredients' && (
                        <div className="tab-content">
                            <h3>{t('ingredients')}</h3>
                            <p>{getLocalContent('ingredients')}</p>
                        </div>
                    )}
                    {activeTab === 'reviews' && (
                        <div className="tab-content review-tab-content">
                            <div className="review-dashboard">
                                <div className="rating-overview">
                                    <span className="big-score">{productData.rating}</span>
                                    <div className="star-stack">
                                        <div className="star-row">
                                            {[...Array(5)].map((_, i) => (
                                                <StarFilled key={i} className="filled-star" />
                                            ))}
                                        </div>
                                        <span className="total-reviews">{productData.reviews_count} {t('reviews')}</span>
                                    </div>
                                </div>
                                <div className="rating-bars">
                                    {[5, 4, 3, 2, 1].map((star) => (
                                        <div key={star} className="bar-row">
                                            <span className="star-label">{star} <StarFilled style={{ fontSize: '12px' }} /></span>
                                            <div className="progress-bg">
                                                <div className="progress-fi" style={{ width: star === 5 ? '70%' : star === 4 ? '20%' : '5%' }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button className="btn-write-review">{t('write_review')}</button>
                            </div>

                            <div className="review-filters">
                                <button className="filter-chip active">{t('all')}</button>
                                <button className="filter-chip">{t('filter_with_media')} (24)</button>
                                <button className="filter-chip">{t('filter_5_star')} (80)</button>
                            </div>

                            <div className="review-list-container">
                                {displayedReviews.map((rev, i) => (
                                    <div key={i} className="review-card">
                                        <div className="review-user-avatar">
                                            {rev.user.charAt(0)}
                                        </div>
                                        <div className="review-content-body">
                                            <div className="review-header-row">
                                                <span className="reviewer-name">{rev.user}</span>
                                                <span className="review-time">{rev.date}</span>
                                            </div>
                                            <div className="review-stars-row">
                                                {[...Array(5)].map((_, starIdx) => (
                                                    <span key={starIdx} className={`rv-star ${starIdx < rev.rating ? 'filled' : ''}`}>
                                                        <StarFilled />
                                                    </span>
                                                ))}
                                                {rev.verified && <span className="verified-tag"><CheckCircleFilled className="icon-check" /> {t('verified_purchase')}</span>}
                                            </div>
                                            <div className="review-text">
                                                {rev.content}
                                            </div>
                                            <div className="review-actions">
                                                <button className="action-btn">
                                                    <HeartOutlined className="icon-action" /> {t('like')}
                                                </button>
                                                <button className="action-btn">
                                                    <MessageOutlined className="icon-action" /> {t('comment')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Pagination
                                page={reviewPage}
                                totalPages={totalReviewPages}
                                onPageChange={setReviewPage}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
