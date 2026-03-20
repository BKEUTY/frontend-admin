import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../../i18n/LanguageContext';
import './AdminProductDetail.css';
import { StarFilled } from '@ant-design/icons';
import Pagination from "../../../Component/Common/Pagination";
import Skeleton from "../../../Component/Common/Skeleton";
import adminApi from '../../../api/adminApi';
import { getImageUrl } from '../../../api/axiosClient';
import NotFound from '../../../Component/ErrorPages/NotFound';
import { generateSlug, extractIdsFromSlug } from '../../../utils/helpers';

import dummy1 from '../../../Assets/Images/Products/product_dummy_1.jpg';
import dummy2 from '../../../Assets/Images/Products/product_dummy_2.jpg';
import dummy3 from '../../../Assets/Images/Products/product_dummy_3.jpg';
import dummy4 from '../../../Assets/Images/Products/product_dummy_4.jpg';
import dummy5 from '../../../Assets/Images/Products/product_dummy_5.svg';

const dummyImages = [dummy1, dummy2, dummy3, dummy4, dummy5];
const getRandomImage = () => dummyImages[Math.floor(Math.random() * dummyImages.length)];

export default function AdminProductDetail() {
    const { slug } = useParams();
    const { t, language } = useLanguage();
    const location = useLocation();

    const categoryName = location.state?.category || t('all_products');
    const categoryLink = location.state?.from || '/admin/products';

    const { productId: parsedPid, variantId: parsedVid } = extractIdsFromSlug(slug);
    const productIdParam = parsedPid || slug;
    const variantIdParam = parsedVid;

    const fallbackImg = useMemo(() => getRandomImage(), []);

    const [productData, setProductData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [activeTab, setActiveTab] = useState('details');
    const [selectedOptions, setSelectedOptions] = useState({});
    const [currentVariant, setCurrentVariant] = useState(null);
    const [mainImage, setMainImage] = useState(fallbackImg);
    const [reviewPage, setReviewPage] = useState(0);
    const reviewsPerPage = 5;

    useEffect(() => {
        if (productData && productData.images && productData.images.length > 0) {
            setMainImage(productData.images[0]);
        }
    }, [productData]);

    useEffect(() => {
        const fetchProduct = async () => {
            setIsLoading(true);
            setIsError(false);
            try {
                const response = await adminApi.getAllProducts(0, 1000);
                const parentProducts = response.data.content || [];
                const found = parentProducts.find(p => p.productId?.toString() === productIdParam?.toString() || p.id?.toString() === productIdParam?.toString());

                if (found) {
                    const actualId = found.productId || found.id;
                    const variantsResponse = await adminApi.getVariants(actualId);
                    const variantsData = variantsResponse.data || [];

                    const mappedVariants = variantsData.map(v => ({
                        id: v.id,
                        variantOptions: v.variantOptions || {},
                        price: parseFloat(v.price) || 0,
                        stockQuantity: v.stockQuantity || 0,
                        image: v.productImageUrl ? getImageUrl(v.productImageUrl) : null,
                        productVariantName: v.productVariantName
                    }));

                    const variantImages = mappedVariants.map(v => v.image).filter(img => img !== null && img !== "");

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
                        options = Object.entries(optionsMap).map(([name, valuesSet]) => ({ name: name, values: Array.from(valuesSet) }));
                    }

                    const mergedData = {
                        id: actualId,
                        name: found.name || "Sản phẩm BKEUTY",
                        brand: "BKEUTY",
                        price: mappedVariants.length > 0 ? mappedVariants[0].price : (found.minPrice !== undefined ? found.minPrice : found.price || 0),
                        rating: 4.8,
                        reviews_count: 124,
                        categories: found.categories || [],
                        images: [found.image ? getImageUrl(found.image) : fallbackImg, ...variantImages, getRandomImage(), getRandomImage()].filter(Boolean).slice(0, 5),
                        options: options,
                        variants: mappedVariants,
                        content: { en: { details: found.description || "" }, vi: { details: found.description || "" } },
                        reviews: []
                    };
                    
                    setProductData(mergedData);
                    
                    if (variantIdParam && mappedVariants.length > 0) {
                        const targetVariant = mappedVariants.find(v => v.id === variantIdParam);
                        if (targetVariant && targetVariant.variantOptions) {
                            setSelectedOptions(targetVariant.variantOptions);
                        } else {
                            setDefaultOptions(mergedData);
                        }
                    } else {
                        setDefaultOptions(mergedData);
                    }
                } else {
                    setIsError(true);
                }
            } catch (err) {
                setIsError(true);
            } finally {
                setIsLoading(false);
            }
        };

        const setDefaultOptions = (data) => {
            if (data.options) {
                const initialOptions = {};
                data.options.forEach(opt => { if (opt.values && opt.values.length > 0) initialOptions[opt.name] = opt.values[0]; });
                setSelectedOptions(initialOptions);
            }
        };

        if (productIdParam) fetchProduct();
    }, [productIdParam, variantIdParam, fallbackImg]);

    useEffect(() => {
        if (productData && productData.variants && Object.keys(selectedOptions).length > 0) {
            const matchVariant = productData.variants.find(v => {
                if (!v.variantOptions || Object.keys(v.variantOptions).length === 0) return false;
                return Object.entries(selectedOptions).every(([optName, selectedVal]) => {
                    const vVal = v.variantOptions[optName];
                    if (!vVal || !selectedVal) return false;
                    return vVal.toString().toLowerCase().trim() === selectedVal.toString().toLowerCase().trim();
                });
            });
            setCurrentVariant(matchVariant || null);
        }
    }, [selectedOptions, productData]);

    useEffect(() => {
        if (currentVariant && currentVariant.image) setMainImage(currentVariant.image);
    }, [currentVariant]);

    useEffect(() => {
        if (currentVariant && productData) {
            const combinedName = currentVariant.productVariantName && currentVariant.productVariantName !== productData.name ? `${productData.name} ${currentVariant.productVariantName}` : productData.name;
            const newSlug = generateSlug(combinedName, productData.id, currentVariant.id);
            if (slug !== newSlug) window.history.replaceState(null, '', `/admin/products/${newSlug}`);
        }
    }, [currentVariant, productData, slug]);

    const totalReviewPages = productData ? Math.ceil(productData.reviews.length / reviewsPerPage) : 0;
    const displayedReviews = productData ? productData.reviews.slice(reviewPage * reviewsPerPage, (reviewPage + 1) * reviewsPerPage) : [];
    const getLocalContent = (key) => productData?.content?.[language === 'vi' ? 'vi' : 'en']?.[key] || "";

    if (isError) return <NotFound />;

    if (isLoading || !productData) return (
        <div className="admin-pd-page">
            <div className="admin-pd-top-section">
                <Skeleton width="45%" height="450px" className="admin-pd-skeleton-img" />
                <div className="admin-pd-skeleton-info">
                    <Skeleton width="30%" height="20px" className="admin-pd-mb15" />
                    <Skeleton width="80%" height="40px" className="admin-pd-mb20" />
                    <Skeleton width="40%" height="30px" className="admin-pd-mb30" />
                    <Skeleton width="100%" height="80px" className="admin-pd-mb30" />
                    <Skeleton width="100%" height="60px" />
                </div>
            </div>
        </div>
    );

    const tabs = [{ id: 'details', label: t('product_details') }, { id: 'reviews', label: `${t('reviews')} (${productData.reviews_count})` }];

    return (
        <div className="admin-pd-page">
            <div className="admin-pd-breadcrumb">
                <Link to={categoryLink} state={{ fromDetail: true }}>{categoryName}</Link>
                <span className="admin-pd-divider">/</span>
                <span className="admin-pd-current">{productData.name}</span>
            </div>

            <div className="admin-pd-top-section">
                <div className="admin-pd-gallery">
                    <div className="admin-pd-thumbnail-list">
                        {productData.images.map((img, idx) => (
                            <div key={idx} className={`admin-pd-thumb-item ${mainImage === img ? 'active' : ''}`} onClick={() => setMainImage(img)}>
                                <img src={img} alt={`Thumb ${idx}`} />
                            </div>
                        ))}
                    </div>
                    <div className="admin-pd-main-image"><img src={mainImage} alt={productData.name} onError={(e) => { e.target.src = fallbackImg }} /></div>
                </div>

                <div className="admin-pd-info-side">
                    <div className="admin-pd-brand-label">{productData.brand}</div>
                    <h1 className="admin-pd-detail-title">{productData.name}</h1>

                    {productData.categories && productData.categories.length > 0 && (
                        <div className="admin-pd-detail-categories">
                            <span className="admin-pd-categories-label">{t('categories')}: </span>
                            {productData.categories.map((cat, idx) => <span key={idx} className="admin-pd-category-tag">{typeof cat === 'object' ? cat.categoryName : cat}</span>)}
                        </div>
                    )}

                    <div className="admin-pd-price-box">
                        <div className="admin-pd-current-price">
                            {(currentVariant ? currentVariant.price : productData.price).toLocaleString("vi-VN")}đ
                            <span className="admin-pd-vat-tag">{t('vat_included')}</span>
                        </div>
                    </div>

                    <div className="admin-pd-options-section">
                        {productData.options && productData.options.map((opt, idx) => (
                            <div key={idx} className="admin-pd-option-group">
                                <span className="admin-pd-option-label">{opt.name.toUpperCase()}:</span>
                                <div className="admin-pd-size-options">
                                    {opt.values.map(val => {
                                        const isActive = selectedOptions[opt.name]?.toString().toLowerCase().trim() === val?.toString().toLowerCase().trim();
                                        return <button key={val} className={`admin-pd-size-btn ${isActive ? 'active' : ''}`} onClick={() => setSelectedOptions(prev => ({ ...prev, [opt.name]: val }))}>{val}</button>;
                                    })}
                                </div>
                            </div>
                        ))}

                        {currentVariant && (
                            <div className="admin-pd-selected-variant">
                                <span className="admin-pd-variant-label">{t('variant_selected_label')}: </span>
                                <strong className="admin-pd-variant-value">
                                    {currentVariant.variantOptions && Object.keys(currentVariant.variantOptions).length > 0 ? Object.values(currentVariant.variantOptions).join(' - ') : currentVariant.productVariantName}
                                </strong>
                            </div>
                        )}
                        <div className="admin-pd-stock-info">{t('in_stock_label')} <strong>{currentVariant ? currentVariant.stockQuantity : 0}</strong> {t('items_available')}</div>
                    </div>
                </div>
            </div>

            <div className="admin-pd-tabs-container">
                <div className="admin-pd-tab-headers">
                    {tabs.map(tab => <button key={tab.id} className={`admin-pd-tab-btn ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>)}
                </div>
                <div className="admin-pd-tab-body">
                    {activeTab === 'details' && (
                        <div className="admin-pd-tab-content">
                            <h3>{t('product_details')}</h3>
                            <p>{getLocalContent('details')}</p>
                        </div>
                    )}
                    {activeTab === 'reviews' && (
                        <div className="admin-pd-tab-content">
                            <div className="admin-pd-review-dashboard">
                                <div className="admin-pd-rating-overview">
                                    <span className="admin-pd-big-score">{productData.rating}</span>
                                    <div className="admin-pd-star-row">
                                        {[...Array(5)].map((_, i) => <StarFilled key={i} className="admin-pd-star" />)}
                                    </div>
                                    <span className="admin-pd-total-reviews">{productData.reviews_count} {t('reviews')}</span>
                                </div>
                            </div>
                            <div className="admin-pd-review-list">
                                {displayedReviews.map((rev, i) => (
                                    <div key={i} className="admin-pd-review-card">
                                        <div className="admin-pd-review-avatar">{rev.user.charAt(0)}</div>
                                        <div className="admin-pd-review-body">
                                            <div className="admin-pd-review-header"><strong>{rev.user}</strong><span>{rev.date}</span></div>
                                            <div className="admin-pd-review-text">{rev.content}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Pagination page={reviewPage} totalPages={totalReviewPages} onPageChange={setReviewPage} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
