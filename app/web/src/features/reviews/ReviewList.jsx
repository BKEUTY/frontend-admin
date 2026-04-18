import React, { useState, useEffect } from 'react';
import { Modal, Input, message, Rate, Avatar, Select } from 'antd';
import { MessageOutlined, DeleteOutlined, CheckCircleOutlined, StarFilled } from '@ant-design/icons';
import { useLanguage } from '@/store/LanguageContext';
import { useReviews } from '@/features/reviews/hooks/useReviews';
import { Pagination, CButton } from '@/components/common';
import '@/admin-list.css';
import './ReviewList.css';

const { TextArea } = Input;
const { Option } = Select;

const ReviewList = ({ variantId }) => {
    const { t, language } = useLanguage();
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [selectedVariantId, setSelectedVariantId] = useState(variantId || null);
    const [ratingFilter, setRatingFilter] = useState(null);
    const [hasImageFilter, setHasImageFilter] = useState(null);
    const [isReplyModalVisible, setIsReplyModalVisible] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [replyComment, setReplyComment] = useState('');
    const [isViewReviews, setIsViewReviews] = useState(false);

    useEffect(() => {
        if (variantId) {
            setSelectedVariantId(variantId);
            setIsViewReviews(false);
        }
    }, [variantId]);

    const {
        productsData,
        reviewsData,
        ratingCounts,
        isReviewsLoading,
        isStatsLoading,
        replyToReview,
        isReplying,
        updateReply,
        isUpdatingReply,
        deleteReply,
        deleteReview,
    } = useReviews(page, pageSize, selectedVariantId, ratingFilter, hasImageFilter, isViewReviews);

    const reviewCount = Object.values(ratingCounts).reduce((a, b) => a + b, 0);
    const averageRating = reviewCount > 0 
        ? (Object.entries(ratingCounts).reduce((acc, [star, count]) => acc + (parseInt(star) * count), 0) / reviewCount).toFixed(1)
        : 0;

    const handleReply = (record) => {
        setSelectedReview(record);
        setReplyComment(record.reply?.comment || '');
        setIsReplyModalVisible(true);
    };

    const handleSubmitReply = async () => {
        if (!replyComment.trim()) {
            message.warning(t('admin_review_reply_placeholder'));
            return;
        }

        try {
            if (selectedReview.reply) {
                await updateReply({ replyId: selectedReview.reply.id, comment: replyComment });
                message.success(t('admin_review_reply_update_success'));
            } else {
                await replyToReview({ reviewId: selectedReview.id, comment: replyComment });
                message.success(t('admin_review_reply_success'));
            }
            setIsReplyModalVisible(false);
            setReplyComment('');
        } catch (error) {}
    };

    const handleDeleteReply = async (replyId) => {
        try {
            await deleteReply(replyId);
            message.success(t('admin_review_reply_delete_success'));
        } catch (error) {}
    };

    const handleDeleteReview = async (reviewId) => {
        Modal.confirm({
            title: t('admin_review_delete_review_confirm_title'),
            content: t('admin_review_delete_review_confirm_content'),
            okText: t('delete'),
            okType: 'danger',
            cancelText: t('cancel'),
            onOk: async () => {
                try {
                    await deleteReview(reviewId);
                    message.success(t('admin_review_delete_success'));
                } catch (error) {}
            }
        });
    };

    const handleFilterRating = (star) => {
        setRatingFilter(prev => prev === star ? null : star);
        setPage(1);
    };

    const handleFilterMedia = () => {
        setHasImageFilter(prev => prev ? null : true);
        setPage(1);
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        const locale = language === 'vi' ? 'vi-VN' : 'en-US';
        return new Date(dateString).toLocaleString(locale, {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div className="admin-list-container">
            {!variantId && (
                <div className="admin-filter-bar" style={{ marginBottom: '24px', justifyContent: 'space-between' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#0f172a' }}>
                        {t('admin_review_management_title')}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: 600, color: '#475569' }}>{t('product')}:</span>
                        <Select
                            showSearch
                            className="admin-toolbar-select"
                            style={{ width: 350 }}
                            placeholder={t('admin_review_product_select')}
                            optionFilterProp="children"
                            onChange={(val) => { 
                                setSelectedVariantId(val); 
                                setPage(1); 
                                setRatingFilter(null);
                                setHasImageFilter(null);
                                setIsViewReviews(false);
                            }}
                            filterOption={(input, option) =>
                                (option?.children ?? '').toString().toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {productsData?.content?.map(prod => (
                                <Option key={prod.id} value={prod.id}>{prod.name}</Option>
                            ))}
                        </Select>
                    </div>
                </div>
            )}

            {selectedVariantId && (
                <>
                    <div className="review-dashboard-admin">
                        <div className="rating-overview-admin">
                            <span className="big-score-admin">{isStatsLoading ? '...' : averageRating}</span>
                            <div className="star-stack-admin">
                                <div className="star-row-admin">
                                    {[...Array(5)].map((_, i) => (
                                        <StarFilled 
                                            key={i} 
                                            style={{ color: i < Math.round(Number(averageRating)) ? '#f59e0b' : '#e2e8f0' }} 
                                        />
                                    ))}
                                </div>
                                <span className="total-reviews-admin">
                                    {isStatsLoading ? '...' : reviewCount} {t('reviews').toLowerCase()}
                                </span>
                            </div>
                        </div>

                        <div className="rating-bars-admin">
                            {[5, 4, 3, 2, 1].map((star) => {
                                const count = ratingCounts[star] || 0;
                                const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
                                return (
                                    <div 
                                        key={star} 
                                        className={`bar-row-admin ${ratingFilter === star ? 'active' : ''}`} 
                                        onClick={() => {
                                            if (!isViewReviews) setIsViewReviews(true);
                                            handleFilterRating(star);
                                        }}
                                    >
                                        <span className="star-label-admin">
                                            {star} <StarFilled style={{ fontSize: '12px', color: '#f59e0b' }} />
                                        </span>
                                        <div className="progress-bg-admin">
                                            <div className="progress-fi-admin" style={{ width: `${percentage}%` }} /> 
                                        </div>
                                        <span style={{ minWidth: '30px', textAlign: 'right' }}>{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {isViewReviews ? (
                        <>
                            <div className="review-filters-admin">
                                <button 
                                    className={`filter-chip-admin ${!ratingFilter && !hasImageFilter ? 'active' : ''}`}
                                    onClick={() => { setRatingFilter(null); setHasImageFilter(null); setPage(1); }}
                                >
                                    {t('admin_review_all')}
                                </button>
                                <button 
                                    className={`filter-chip-admin ${hasImageFilter ? 'active' : ''}`}
                                    onClick={handleFilterMedia}
                                >
                                    {t('admin_review_with_images')}
                                </button>
                                {[5, 4, 3, 2, 1].map(star => (
                                    <button 
                                        key={star}
                                        className={`filter-chip-admin ${ratingFilter === star ? 'active' : ''}`}
                                        onClick={() => handleFilterRating(star)}
                                    >
                                        {t('admin_review_star').replace('{star}', star)}
                                    </button>
                                ))}
                            </div>

                            <div className="admin-table-wrapper">
                                <div className="admin-pr-list">
                                    {isReviewsLoading ? (
                                        <div style={{ textAlign: 'center', padding: '40px' }}>{t('loading_dots')}</div>
                                    ) : (!reviewsData?.content || reviewsData.content.length === 0) ? (
                                        <div className="admin-pr-empty-state">{t('admin_review_no_data')}</div>
                                    ) : (
                                        reviewsData.content.map((rev) => (
                                            <div key={rev.id} className="admin-pr-card">
                                                <Avatar size={48} className="admin-pr-user-avatar" style={{ backgroundColor: '#c2185b' }}>
                                                    {rev.userName?.charAt(0) || 'U'}
                                                </Avatar>
                                                <div className="admin-pr-main-content">
                                                    <div className="admin-pr-card-header">
                                                        <span className="admin-pr-user-name">{rev.userName || 'User'}</span>
                                                        <span className="admin-pr-post-date">
                                                            {formatDateTime(rev.createdAt)}
                                                        </span>
                                                    </div>
                                                    <div className="admin-pr-rating-meta">
                                                        <Rate disabled defaultValue={rev.rating} style={{ fontSize: '13px', color: '#f59e0b' }} />
                                                        <span className="verified-badge-admin"><CheckCircleOutlined style={{ marginRight: '4px' }} />{t('verified_purchase')}</span>
                                                    </div>
                                                    <div className="admin-pr-comment-text">{rev.comment}</div>
                                                    {rev.images?.length > 0 && (
                                                        <div className="admin-pr-image-gallery">
                                                            {rev.images.filter(img => img && img.trim() !== "").map((img, idx) => (
                                                                <img key={idx} src={img} alt="review" className="admin-pr-review-img" onClick={() => window.open(img, '_blank')} />
                                                            ))}
                                                        </div>
                                                    )}
                                                    {rev.reply && (
                                                        <div className="admin-reply-box-item">
                                                            <div className="admin-reply-header-item">
                                                                <span>{rev.reply.adminName || 'Admin'}</span>
                                                                <span>{formatDateTime(rev.reply.repliedAt)}</span>
                                                            </div>
                                                            <div className="admin-reply-content-item">{rev.reply.comment}</div>
                                                            <div className="admin-reply-actions">
                                                                <button className="reply-action-btn edit" onClick={() => handleReply(rev)}>{t('edit')}</button>
                                                                <button className="reply-action-btn delete" onClick={() => handleDeleteReply(rev.reply.id)}>{t('delete')}</button>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="admin-pr-card-actions">
                                                        {!rev.reply && (
                                                            <CButton type="outline" onClick={() => handleReply(rev)} icon={<MessageOutlined />}>
                                                                {t('admin_review_reply_btn')}
                                                            </CButton>
                                                        )}
                                                        <CButton danger type="outline" onClick={() => handleDeleteReview(rev.id)} icon={<DeleteOutlined />}>
                                                            {t('delete')}
                                                        </CButton>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                {reviewsData?.content?.length > 0 && reviewsData?.totalPages > 1 && (
                                    <div className="admin-custom-pagination">
                                        <Pagination
                                            page={page}
                                            totalPages={reviewsData.totalPages}
                                            totalItems={reviewsData.totalElements}
                                            pageSize={pageSize}
                                            onPageChange={(p) => {
                                                setPage(p);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="load-reviews-prompt-container" style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                            <CButton 
                                type="primary" 
                                size="large" 
                                icon={<MessageOutlined />}
                                onClick={() => setIsViewReviews(true)}
                                style={{ margin: '0 auto' }}
                            >
                                {t('admin_review_view_btn')}
                            </CButton>
                        </div>
                    )}
                </>
            )}

            {!selectedVariantId && (
                <div className="no-reviews-msg-admin">
                    {t('admin_review_select_product_hint')}
                </div>
            )}

            <Modal
                title={selectedReview?.reply ? t('admin_review_reply_modal_title_edit') : t('admin_review_reply_modal_title_add')}
                open={isReplyModalVisible}
                onOk={handleSubmitReply}
                onCancel={() => setIsReplyModalVisible(false)}
                okText={t('save')}
                cancelText={t('cancel')}
                confirmLoading={isReplying || isUpdatingReply}
                centered
            >
                <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center' }}>
                    <Avatar size={48} style={{ backgroundColor: '#c2185b' }}>{selectedReview?.userName?.charAt(0) || 'U'}</Avatar>
                    <div>
                        <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#0f172a' }}>{selectedReview?.userName || 'User'}</div>
                        <Rate disabled defaultValue={selectedReview?.rating} style={{ fontSize: '14px', color: '#f59e0b' }} />
                    </div>
                </div>
                <div style={{ 
                    padding: '12px 16px', 
                    background: '#f8fafc', 
                    borderRadius: '8px', 
                    marginBottom: '20px',
                    fontStyle: 'italic',
                    color: '#475569',
                    borderLeft: '4px solid #cbd5e1'
                }}>
                    "{selectedReview?.comment}"
                </div>
                <div style={{ fontWeight: 600, marginBottom: '8px', color: '#334155' }}>{t('admin_review_reply_label')}</div>
                <TextArea
                    rows={5}
                    value={replyComment}
                    onChange={(e) => setReplyComment(e.target.value)}
                    placeholder={t('admin_review_reply_placeholder')}
                    style={{ borderRadius: '8px' }}
                />
            </Modal>
        </div>
    );
};

export default ReviewList;
