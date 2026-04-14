import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { Tag } from 'antd';
import { useLanguage } from '@/store/LanguageContext';
import { Skeleton } from "@/components/common";
import publicProductService from '@/features/products/services/publicProductService';
import { getImageUrl } from '@/services/axiosClient';
import NotFound from '@/pages/error/NotFound';
import ReviewList from '@/features/reviews/ReviewList'; 
import { generateSlug, getIdFromSlug } from '@/utils/helpers';
import './AdminProductDetail.css';

import dummy1 from '@/assets/images/products/product_dummy_1.jpg';
import dummy2 from '@/assets/images/products/product_dummy_2.jpg';
import dummy3 from '@/assets/images/products/product_dummy_3.jpg';
import dummy4 from '@/assets/images/products/product_dummy_4.jpg';
import dummy5 from '@/assets/images/products/product_dummy_5.svg';

const dummyImages = [dummy1, dummy2, dummy3, dummy4, dummy5];
const getRandomImage = () => dummyImages[Math.floor(Math.random() * dummyImages.length)];

export default function AdminProductDetail() {
    const { slug } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useLanguage();

    const productId = location.state?.productId ?? getIdFromSlug(slug);
    const fallbackImg = useMemo(() => getRandomImage(), []);

    const [productData, setProductData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    const [activeTab, setActiveTab] = useState('details');
    const [selectedOptions, setSelectedOptions] = useState({});
    const [stockQuantity, setStockQuantity] = useState(0);
    const [mainImage, setMainImage] = useState(fallbackImg);

    const [currentPrice, setCurrentPrice] = useState({ originPrice: 0, promotionPrice: 0, hasDiscount: false });

    const galleryImages = useMemo(() => {
        if (!productData) return [];
        const variantImage = productData.variants?.find(v => v.id === productData.id)?.productImageUrl;
        const images = [
            productData.image ? getImageUrl(productData.image) : fallbackImg,
            variantImage ? getImageUrl(variantImage) : getRandomImage()
        ].filter(Boolean);

        const uniqueImages = [...new Set(images)];
        if (uniqueImages.length < 2) uniqueImages.push(getRandomImage());

        return uniqueImages;
    }, [productData, fallbackImg]);

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
                    hasDiscount: responseData.promotionPrice < responseData.originPrice,
                });

                const targetVariant = responseData.variants?.find(v => v.id === responseData.id) || responseData.variants?.[0];
                const correctSlug = generateSlug(targetVariant.productVariantName, productId);
                if (slug && slug !== correctSlug) {
                    throw new Error('Invalid product slug'); 
                }
                setProductData(responseData);
                setSelectedOptions(targetVariant?.variantOptions || {});
                setStockQuantity(targetVariant?.stockQuantity || 0);
                
            } catch (err) {
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
            
            if (matchedVariant.id !== productData.id) {
                const combinedName = matchedVariant.productVariantName || productData.name;
                const newSlug = generateSlug(combinedName, matchedVariant.id);
                navigate(`/admin/products/${newSlug}`, {
                    replace: true,
                    state: {
                        ...location.state,
                        productId: matchedVariant.id
                    }
                });
            }
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
                            <div key={idx} className={`admin-pd-thumb-item ${mainImage === img ? 'active' : ''}`} onClick={() => setMainImage(img)}>
                                <img src={img} alt={`Thumb ${idx}`} />
                            </div>
                        ))}
                    </div>
                    <div className="admin-pd-main-image">
                        <img src={mainImage} alt={displayName} onError={(e) => { e.target.src = fallbackImg }} />
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

                    <div className="admin-pd-price-box">
                        <div className="admin-pd-current-price-wrapper">
                            <div className="admin-pd-current-price">
                                {shownPrice.toLocaleString('vi-VN')}đ
                            </div>
                            {currentPrice.hasDiscount && (
                                <div className="admin-pd-old-price-wrapper">
                                    <span className="admin-pd-old-price-text">
                                        {currentPrice.originPrice.toLocaleString('vi-VN')}đ
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="admin-pd-options-section">
                        {productData.options?.map((opt, idx) => (
                            <div key={idx} className="admin-pd-option-group">
                                <span className="admin-pd-option-label">{opt.name.toUpperCase()}:</span>
                                <div className="admin-pd-size-options">
                                    {opt.values.map(val => {
                                        const isActive = selectedOptions[opt.name]?.toString().toLowerCase().trim() === val?.toString().toLowerCase().trim();
                                        return (
                                            <button
                                                key={val}
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
                                <span className="admin-pd-variant-label">{t('variant_selected_label')}: </span>
                                <strong className="admin-pd-variant-value">
                                    {Object.values(selectedOptions).join(' - ')}
                                </strong>
                            </div>
                        )}

                        <div className="admin-pd-stock-info">
                            {t('in_stock_label')} <strong>{stockQuantity}</strong> {t('items_available')}
                        </div>
                    </div>
                </div>
            </div>

            <div className="admin-pd-tabs-container">
                <div className="admin-pd-tab-headers">
                    {tabs.map(tab => (
                        <button 
                            key={tab.id} 
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
        </div>
    );
}
