import React, { useState, useMemo } from 'react';
import { Table, Tooltip, Space, Select, Modal, Button } from 'antd';
import { 
    ArrowLeftOutlined, 
    SyncOutlined, 
    EyeOutlined, 
    CheckOutlined, 
    CloseOutlined, 
    WalletOutlined, 
    FileDoneOutlined,
    FilterOutlined,
    DownOutlined
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { useLanguage } from '@/store/LanguageContext';
import { useAdminRefunds, useUpdateRefundStatus } from '@/features/orders/hooks/useAdminRefunds';
import { EmptyState, PageWrapper, CButton, Pagination } from '@/components/common';
import useQueryParams from '@/hooks/useQueryParams';
import { PRODUCT_IMAGE_FALLBACK } from '@/utils/helpers';
import { getImageUrl } from '@/services/axiosClient';
import '@/admin-list.css';
import './OrderRefundList.css';

const { Option } = Select;

const OrderRefundList = () => {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const [query, setQuery] = useQueryParams();
    const locale = language === 'vi' ? 'vi-VN' : 'en-US';

    const page = query.page ? Number(query.page) : 1;
    const pageSize = 10;
    const status = query.status || 'ALL';

    const queryParams = useMemo(() => ({
        page,
        size: pageSize,
        status: status,
    }), [page, pageSize, status]);

    const { 
        refunds, 
        totalItems,
        totalPages, 
        isLoading, 
        refetchRefunds 
    } = useAdminRefunds(queryParams);

    const { mutateAsync: updateRefundStatus, isPending: isUpdating } = useUpdateRefundStatus();

    const [selectedRefund, setSelectedRefund] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    const handleAction = async (id, action) => {
        try {
            await updateRefundStatus({ id, action });
            if (selectedRefund && selectedRefund.refundOrderId === id) {
                // Keep the detail modal state synchronized if it's open
                refetchRefunds().then((res) => {
                    const freshData = res.data?.content || [];
                    const updated = freshData.find(item => item.refundOrderId === id);
                    if (updated) setSelectedRefund(updated);
                });
            }
        } catch (error) {}
    };

    const getStatusClass = (statusStr) => {
        const s = statusStr?.toUpperCase();
        if (s === 'COMPLETED' || s === 'REFUNDED') return 'success';
        if (s === 'REJECTED') return 'danger';
        if (s === 'APPROVED') return 'info';
        return 'warning';
    };

    const columns = [
        {
            title: t('admin_refund_order_id'),
            dataIndex: 'refundOrderId',
            key: 'refundOrderId',
            width: 90,
            align: 'center',
            render: (text) => <span className="admin-table-id">#{text}</span>,
        },
        {
            title: t('admin_order_id'),
            dataIndex: 'orderId',
            key: 'orderId',
            width: 100,
            align: 'center',
            render: (orderId) => (
                <Link to={`/admin/orders/${orderId}`} className="admin-table-id" style={{ color: 'var(--admin-primary)', fontWeight: 600 }}>
                    #{orderId}
                </Link>
            ),
        },
        {
            title: t('admin_customer'),
            key: 'customer',
            width: 200,
            ellipsis: true,
            render: (_, record) => (
                <span className="admin-table-product-name">{record.userName || ''}</span>
            ),
        },
        {
            title: t('admin_refund_phone'),
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
            width: 130,
            align: 'center',
            render: (phone) => <span style={{ color: '#475569', fontWeight: 500 }}>{phone}</span>,
        },
        {
            title: t('admin_refund_order_total'),
            dataIndex: 'total',
            key: 'total',
            width: 150,
            align: 'right',
            render: (total) => (
                <span className="admin-current-price" style={{ color: '#e11d48', fontWeight: 700, fontSize: '15px' }}>
                    {(total || 0).toLocaleString(locale)}{t('admin_unit_vnd')}
                </span>
            ),
        },
        {
            title: t('admin_refund_order_date'),
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 130,
            align: 'center',
            render: (date) => <span style={{ color: '#64748b' }}>{dayjs(date).format('DD/MM/YYYY')}</span>,
        },
        {
            title: t('admin_refund_order_status'),
            dataIndex: 'status',
            key: 'status',
            width: 150,
            align: 'center',
            render: (statusVal) => {
                const badgeClass = statusVal?.toLowerCase() || 'pending';
                return (
                    <span className={`admin-refund-badge ${badgeClass}`}>
                        {t(`refund_status_${statusVal}`)}
                    </span>
                );
            },
        },
        {
            title: t('actions_col'),
            key: 'action',
            width: 90,
            align: 'center',
            fixed: 'right',
            render: (_, record) => (
                <Tooltip title={t('view')}>
                    <Button 
                        type="text" 
                        className="admin-action-btn edit-btn" 
                        icon={<EyeOutlined />} 
                        onClick={() => setSelectedRefund(record)} 
                    />
                </Tooltip>
            ),
        },
    ];

    return (
        <div className="admin-list-container">
            <PageWrapper
                title={t('admin_home_refunds_title')}
                subtitle={<>{t('total')} • <strong className="admin-subtitle-count">{totalItems}</strong> {t('admin_unit_order')}</>}
                extra={
                    <div className="admin-header-buttons">
                        <CButton
                            type="secondary"
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate('/admin/orders')}
                        >
                            {t('back')}
                        </CButton>
                        <CButton
                            type="secondary"
                            icon={<SyncOutlined />}
                            onClick={() => refetchRefunds()}
                            loading={isLoading || isUpdating}
                        >
                            {t('refresh')}
                        </CButton>
                    </div>
                }
            >
                <div className="admin-filter-bar">
                    <div className="admin-filter-left">
                        <div className="admin-select-wrapper">
                            <Select 
                                value={status} 
                                onChange={(val) => setQuery({ status: val, page: 1 })} 
                                className="admin-toolbar-select admin-custom-select"
                                placeholder={t('status')}
                                suffixIcon={
                                    <div className="admin-select-suffix">
                                        <FilterOutlined style={{ color: 'var(--admin-primary)', fontSize: '16px' }} />
                                        <DownOutlined style={{ fontSize: '12px', opacity: 0.6 }} />
                                    </div>
                                }
                                variant="borderless"
                                options={[
                                    { value: 'ALL', label: t('all') },
                                    { value: 'PENDING', label: t('refund_status_PENDING') },
                                    { value: 'APPROVED', label: t('refund_status_APPROVED') },
                                    { value: 'REJECTED', label: t('refund_status_REJECTED') },
                                    { value: 'COMPLETED', label: t('refund_status_COMPLETED') },
                                    { value: 'REFUNDED', label: t('refund_status_REFUNDED') }
                                ]}
                            />
                        </div>
                    </div>
                </div>

                <div className="admin-table-wrapper">
                    <Table
                        columns={columns}
                        dataSource={refunds}
                        rowKey="id"
                        className="beauty-table"
                        pagination={false}
                        loading={isLoading}
                        scroll={{ x: 'max-content' }}
                        onRow={(record) => ({
                            onClick: () => setSelectedRefund(record),
                            className: "admin-table-row-pointer"
                        })}
                        locale={{ emptyText: <EmptyState description={t('no_orders')} /> }}
                    />
                    {refunds && refunds.length > 0 && totalPages > 1 && (
                        <div className="admin-custom-pagination">
                            <Pagination 
                                page={page} 
                                totalPages={totalPages} 
                                totalItems={totalItems}
                                pageSize={pageSize}
                                onPageChange={(p) => setQuery({ page: p })} 
                            />
                        </div>
                    )}
                </div>
            </PageWrapper>

            {/* Refund Detail Modal */}
            <Modal
                title={<span className="admin-modal-title" style={{ fontSize: '18px', fontWeight: 700 }}>{t('request_refund_title')} #{selectedRefund?.refundOrderId}</span>}
                open={!!selectedRefund}
                onCancel={() => setSelectedRefund(null)}
                footer={null}
                width={700}
                className="admin-refund-detail-modal-luxury"
            >
                {selectedRefund && (
                    <div className="admin-refund-modal-body" style={{ marginTop: '16px' }}>
                        <div className="admin-refund-items-summary">
                            <label className="admin-refund-detail-label" style={{ marginBottom: '8px', display: 'block' }}>{t('refund_selected_items')}</label>
                            <div className="admin-refund-summary-list">
                                {(selectedRefund.items || []).map((item, index) => (
                                    <div key={index} className="admin-refund-summary-item">
                                         <img 
                                             src={item.productImageUrl ? getImageUrl(item.productImageUrl) : PRODUCT_IMAGE_FALLBACK} 
                                             alt={item.productVariantName} 
                                             onError={(e) => { e.target.src = PRODUCT_IMAGE_FALLBACK; }}
                                         />
                                        <div className="item-info">
                                            <div className="item-name">{item.productVariantName}</div>
                                            <div className="item-qty">{t('quantity')}: x{item.quantity}</div>
                                        </div>
                                        <span className="admin-current-price" style={{ fontWeight: 600 }}>
                                            {(item.unitRefundAmount * item.quantity).toLocaleString(locale)}{t('admin_unit_vnd')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="admin-refund-detail-grid">
                            <div className="admin-refund-detail-group">
                                <span className="admin-refund-detail-label">{t('admin_order_id')}</span>
                                <span className="admin-refund-detail-value">
                                    <Link to={`/admin/orders/${selectedRefund.orderId}`} style={{ color: 'var(--admin-primary)', fontWeight: 600 }}>
                                        #{selectedRefund.orderId}
                                    </Link>
                                </span>
                            </div>

                            <div className="admin-refund-detail-group">
                                <span className="admin-refund-detail-label">{t('admin_refund_order_total')}</span>
                                <span className="admin-refund-detail-value" style={{ color: '#e11d48', fontWeight: 700 }}>
                                    {(selectedRefund.total || 0).toLocaleString(locale)}{t('admin_unit_vnd')}
                                </span>
                            </div>

                            <div className="admin-refund-detail-group">
                                <span className="admin-refund-detail-label">{t('admin_customer')}</span>
                                <span className="admin-refund-detail-value" style={{ fontWeight: 600 }}>{selectedRefund.userName || ''}</span>
                            </div>

                            <div className="admin-refund-detail-group">
                                <span className="admin-refund-detail-label">{t('phone')}</span>
                                <span className="admin-refund-detail-value">{selectedRefund.phoneNumber || ''}</span>
                            </div>

                            <div className="admin-refund-detail-group">
                                <span className="admin-refund-detail-label">{t('admin_refund_order_status')}</span>
                                <div>
                                    <span className={`admin-refund-badge ${selectedRefund.status?.toLowerCase() || 'pending'}`} style={{ marginTop: '4px' }}>
                                        {t(`refund_status_${selectedRefund.status}`)}
                                    </span>
                                </div>
                            </div>

                            <div className="admin-refund-detail-group full-width">
                                <span className="admin-refund-detail-label">{t('address')}</span>
                                <span className="admin-refund-detail-value">
                                    {selectedRefund.fromAddress ? selectedRefund.fromAddress.split('|')[0] : ''}
                                </span>
                            </div>

                            <div className="admin-refund-detail-group full-width">
                                <span className="admin-refund-detail-label">{t('admin_refund_note')}</span>
                                <span className="admin-refund-detail-value" style={{ whiteSpace: 'pre-wrap', background: '#fff' }}>
                                    {selectedRefund.note || ''}
                                </span>
                            </div>

                            {selectedRefund.evidenceImageUrls && selectedRefund.evidenceImageUrls.length > 0 && (
                                <div className="admin-refund-detail-group full-width">
                                    <span className="admin-refund-detail-label">{t('admin_refund_evidence')}</span>
                                    <div className="admin-refund-evidence-gallery">
                                        {selectedRefund.evidenceImageUrls.map((imgUrl, i) => (
                                            <img 
                                                key={i} 
                                                src={imgUrl} 
                                                alt="evidence" 
                                                className="admin-refund-evidence-thumb" 
                                                onClick={() => setPreviewImage(imgUrl)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Action Footer buttons inside modal for fast admin control */}
                        <div className="admin-refund-action-buttons" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                            <Button className="c-button c-button-secondary" onClick={() => setSelectedRefund(null)}>
                                {t('back')}
                            </Button>
                            
                            {selectedRefund.status?.toUpperCase() === 'PENDING' && (
                                <>
                                    <Button 
                                        className="c-button refund-btn-reject" 
                                        disabled={isUpdating}
                                        onClick={() => handleAction(selectedRefund.refundOrderId, 'reject')}
                                    >
                                        {t('admin_refund_reject')}
                                    </Button>
                                    
                                    <Button 
                                        className="c-button refund-btn-approve" 
                                        disabled={isUpdating}
                                        onClick={() => handleAction(selectedRefund.refundOrderId, 'approve')}
                                    >
                                        {t('admin_refund_approve')}
                                    </Button>
                                </>
                            )}

                            {selectedRefund.status?.toUpperCase() === 'APPROVED' && (
                                <Button 
                                    className="c-button refund-btn-complete" 
                                    disabled={isUpdating}
                                    onClick={() => handleAction(selectedRefund.refundOrderId, 'complete')}
                                >
                                    {t('admin_refund_complete')}
                                </Button>
                            )}

                            {selectedRefund.status?.toUpperCase() === 'COMPLETED' && (
                                <Button 
                                    className="c-button refund-btn-payout" 
                                    disabled={isUpdating}
                                    onClick={() => handleAction(selectedRefund.refundOrderId, 'process-refund')}
                                >
                                    {t('admin_refund_process_payout')}
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                open={!!previewImage}
                footer={null}
                onCancel={() => setPreviewImage(null)}
                width={800}
                centered
            >
                {previewImage && (
                    <img 
                        src={previewImage} 
                        alt="evidence preview" 
                        style={{ width: '100%', height: 'auto', borderRadius: '8px' }} 
                    />
                )}
            </Modal>
        </div>
    );
};

export default OrderRefundList;
