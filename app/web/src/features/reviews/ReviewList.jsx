import React, { useState, useEffect } from 'react';
import { Modal, Input, Rate, Avatar } from 'antd';
import { MessageOutlined, DeleteOutlined, CheckCircleOutlined, StarFilled } from '@ant-design/icons';
import { useLanguage } from '@/store/LanguageContext';
import { useNotification } from '@/store/NotificationContext';
import { useReviews } from '@/features/reviews/hooks/useReviews';
import { Pagination, CButton } from '@/components/common';
import '@/admin-list.css';
import './ReviewList.css';

const { TextArea } = Input;

const ReviewList = ({ variantId }) => {
    const { t, language } = useLanguage();
    const showNotification = useNotification();
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [selectedVariantId, setSelectedVariantId] = useState(variantId || null);
    const [ratingFilter, setRatingFilter] = useState(null);
    const [hasImageFilter, setHasImageFilter] = useState(null);
    const [isRepliedFilter, setIsRepliedFilter] = useState(null);
    const [isHiddenFilter, setIsHiddenFilter] = useState(null);

    const [isReplyModalVisible, setIsReplyModalVisible] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [replyComment, setReplyComment] = useState('');
    const [isViewReviews, setIsViewReviews] = useState(!variantId);

    useEffect(() => {
        if (variantId) {
            setSelectedVariantId(variantId);
            setIsViewReviews(false);
        }
    }, [variantId]);

    const {
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
    } = useReviews(page, pageSize, selectedVariantId, ratingFilter, hasImageFilter, isRepliedFilter, isHiddenFilter, isViewReviews);

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
            showNotification(t('warning'), 'warning', t('admin_review_reply_placeholder'));
            return;
        }

        try {
            if (selectedReview.reply) {
                await updateReply({ replyId: selectedReview.reply.id, comment: replyComment });
                showNotification(t('success'), 'success', t('admin_review_reply_update_success'));
            } else {
                await replyToReview({ reviewId: selectedReview.id, comment: replyComment });
                showNotification(t('success'), 'success', t('admin_review_reply_success'));
            }
            setIsReplyModalVisible(false);
            setReplyComment('');
        } catch (error) {}
    };

    const handleDeleteReply = async (replyId) => {
        try {
            await deleteReply(replyId);
            showNotification(t('success'), 'success', t('admin_review_reply_delete_success'));
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
                    showNotification(t('success'), 'success', t('admin_review_delete_success'));
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
        const date = dateString.endsWith('Z') ? new Date(dateString) : new Date(dateString + 'Z');
        return date.toLocaleString(locale, {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div className="admin-list-container">

            {selectedVariantId && (
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
            )}

                    {isViewReviews ? (
                        <>
                            <div className="review-filters-admin">
                                        <button 
                                            className={`filter-chip-admin ${!ratingFilter && !hasImageFilter && isRepliedFilter === null && isHiddenFilter === null ? 'active' : ''}`}
                                            onClick={() => { setRatingFilter(null); setHasImageFilter(null); setIsRepliedFilter(null); setIsHiddenFilter(null); setPage(1); }}
                                        >
                                            {t('admin_review_all')}
                                        </button>
                                        <button 
                                            className={`filter-chip-admin ${hasImageFilter ? 'active' : ''}`}
                                            onClick={handleFilterMedia}
                                        >
                                            {t('admin_review_with_images')}
                                        </button>
                                        <button 
                                            className={`filter-chip-admin ${isRepliedFilter === true ? 'active' : ''}`}
                                            onClick={() => { setIsRepliedFilter(prev => prev === true ? null : true); setPage(1); }}
                                        >
                                            {t('is_replied')}
                                        </button>
                                        <button 
                                            className={`filter-chip-admin ${isRepliedFilter === false ? 'active' : ''}`}
                                            onClick={() => { setIsRepliedFilter(prev => prev === false ? null : false); setPage(1); }}
                                        >
                                            {t('not_replied')}
                                        </button>
                                        <button 
                                            className={`filter-chip-admin ${isHiddenFilter === true ? 'active' : ''}`}
                                            onClick={() => { setIsHiddenFilter(prev => prev === true ? null : true); setPage(1); }}
                                        >
                                            {t('is_hidden')}
                                        </button>
                                        <button 
                                            className={`filter-chip-admin ${isHiddenFilter === false ? 'active' : ''}`}
                                            onClick={() => { setIsHiddenFilter(prev => prev === false ? null : false); setPage(1); }}
                                        >
                                            {t('not_hidden')}
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
                                        <div style={{ textAlign: 'center', padding: '40px' }}>{t('loading')}</div>
                                    ) : (!reviewsData?.content || reviewsData.content.length === 0) ? (
                                        <div className="admin-pr-empty-state">{t('admin_review_no_data')}</div>
                                    ) : (
                                        reviewsData.content.map((rev) => (
                                            <div key={rev.id} className="admin-pr-card">
                                                <Avatar size={48} className="admin-pr-user-avatar" style={{ backgroundColor: 'var(--color_main_title)' }}>
                                                    {rev.userName ? rev.userName.charAt(0).toUpperCase() : 'U'}
                                                </Avatar>
                                                <div className="admin-pr-main-content">
                                                    <div className="admin-pr-card-header" style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}>
                                                        <div className="admin-pr-header-layout">
                                                            <span className="admin-pr-user-name">
                                                                {rev.userName}
                                                            </span>
                                                            <div className="admin-pr-badges-row">
                                                                <span className="admin-pr-badge user-id">
                                                                    User ID: {rev.userId}
                                                                </span>
                                                                {rev.isReplied ? (
                                                                    <span className="admin-pr-badge is-replied">{t('is_replied')}</span>
                                                                ) : (
                                                                    <span className="admin-pr-badge not-replied">{t('not_replied')}</span>
                                                                )}
                                                                {rev.isHidden && (
                                                                    <span className="admin-pr-badge is-hidden">{t('is_hidden')}</span>
                                                                )}
                                                            </div>
                                                        </div>
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
                                                                <span>{rev.reply.adminName}</span>
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
                    ) : selectedVariantId ? (
                        <div className="load-reviews-prompt-container" style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '24px', border: '1px dashed #cbd5e1' }}>
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
                    ) : null}

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
                    <Avatar size={48} style={{ backgroundColor: 'var(--color_main_title)' }}>{selectedReview?.userName?.charAt(0) || 'U'}</Avatar>
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
                    style={{ borderRadius: '16px' }}
                />
            </Modal>
        </div>
    );
};

export default ReviewList;
