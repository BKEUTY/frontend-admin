import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, notification, Typography, Tooltip, Tag, Space, Modal } from 'antd';
import { PlusOutlined, SyncOutlined, FormOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import promotionApi from '../../../api/promotionApi';
import { useLanguage } from '../../../i18n/LanguageContext';
import { useAuth } from '../../../Context/AuthContext';
import { EmptyState, PageWrapper, CButton } from '../../Common';
import Pagination from '../../Common/Pagination';
import './PromotionList.css';

const { Text } = Typography;

const PromotionList = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [actionModalVisible, setActionModalVisible] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const pageSize = 10;

    const fetchPromotions = useCallback(async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const response = await promotionApi.getAll(currentPage);
            const items = response.data?.content || [];
            setData(items);
            setTotalPages(response.data?.totalPages || 0);
            setTotalItems(response.data?.totalElements || 0);
        } catch (error) {
            if (!error?.isGlobalHandled) {
                notification.error({ key: 'fetch_promotions_error', message: t('error'), description: t('api_error_fetch') });
            }
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, currentPage, t]);

    useEffect(() => {
        if (isAuthenticated) fetchPromotions();
    }, [fetchPromotions, isAuthenticated]);

    const handleEdit = (record) => {
        navigate(`/admin/promotions/edit/${record.id}`, { state: { promotion: record } });
        setActionModalVisible(false);
    };

    const handleDeleteClick = (record) => {
        setSelectedRecord(record);
        setDeleteModalVisible(true);
        setActionModalVisible(false);
    };

    const confirmDelete = async () => {
        if (!selectedRecord) return;
        setLoading(true);
        try {
            await promotionApi.delete(selectedRecord.id);
            notification.success({ message: t('success'), description: t('delete_success') });
            fetchPromotions();
        } catch (error) {
            notification.error({ message: t('error'), description: t('delete_error') });
        } finally {
            setLoading(false);
            setDeleteModalVisible(false);
            setSelectedRecord(null);
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
            align: 'center',
            render: (id) => <span className="admin-table-id">#{id}</span>
        },
        {
            title: t('promo_col_name'),
            dataIndex: 'title',
            key: 'title',
            width: 250,
            render: (text) => <span className="admin-table-product-name">{text}</span>
        },
        {
            title: t('promo_col_discount'),
            key: 'discount',
            width: 150,
            render: (_, record) => (
                <Tag color="volcano" className="discount-tag">
                    {record.discountType === 'PERCENTAGE' ? `${record.discountValue}%` : `${record.discountValue.toLocaleString()}đ`}
                </Tag>
            )
        },
        {
            title: t('promo_col_type'),
            dataIndex: 'promotionType',
            key: 'type',
            width: 120,
            render: (type) => <Tag color="blue">{type || 'ALL'}</Tag>
        },
        {
            title: t('promo_col_time'),
            key: 'time',
            width: 200,
            render: (_, record) => (
                <div className="promo-time-cell">
                    <div>{new Date(record.startAt).toLocaleDateString('vi-VN')}</div>
                    <div>{new Date(record.endAt).toLocaleDateString('vi-VN')}</div>
                </div>
            )
        },
        {
            title: t('promo_col_status'),
            dataIndex: 'status',
            key: 'status',
            width: 120,
            align: 'center',
            render: (status) => (
                <span className={`status-badge status-${status}`}>
                    {t(`promo_status_${status}`)}
                </span>
            )
        },
        {
            title: t('actions_col'),
            key: 'action',
            width: 120,
            align: 'center',
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title={t('edit')}>
                        <Button type="text" className="admin-action-btn edit-btn" icon={<FormOutlined />} onClick={(e) => { e.stopPropagation(); handleEdit(record); }} />
                    </Tooltip>
                    <Tooltip title={t('delete')}>
                        <Button type="text" className="admin-action-btn delete-btn" icon={<DeleteOutlined />} onClick={(e) => { e.stopPropagation(); handleDeleteClick(record); }} />
                    </Tooltip>
                </Space>
            )
        },
    ];

    return (
        <div className="admin-promotion-list-container">
            <PageWrapper
                title={t('promo_list_title')}
                subtitle={<>{t('total')} • <Text strong className="admin-subtitle-count">{totalItems}</Text> {t('items')}</>}
                extra={
                    <Space size="large" wrap className="admin-space-btn">
                        <CButton type="secondary" icon={<SyncOutlined />} onClick={() => { setCurrentPage(0); fetchPromotions(); }} loading={loading} className="admin-btn-responsive">{t('refresh')}</CButton>
                        <CButton type="primary" icon={<PlusOutlined />} onClick={() => navigate('/admin/promotions/create')} className="admin-btn-responsive">{t('admin_product_create')}</CButton>
                    </Space>
                }
            >
                <div className="admin-table-wrapper">
                    <Table
                        columns={columns} dataSource={data} rowKey="id" className="beauty-table" pagination={false} loading={loading} scroll={{ x: 'max-content' }}
                        locale={{ emptyText: <EmptyState description={t('no_promos_found')} /> }}
                    />
                    {data.length > 0 && totalPages > 1 && (
                        <div className="admin-custom-pagination">
                            <Pagination page={currentPage} totalPages={totalPages} onPageChange={(page) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
                        </div>
                    )}
                </div>
            </PageWrapper>

            <Modal
                title={t('confirm_delete_title')}
                open={deleteModalVisible}
                onOk={confirmDelete}
                onCancel={() => setDeleteModalVisible(false)}
                okText={t('delete')}
                cancelText={t('cancel')}
                okButtonProps={{ danger: true, loading: loading }}
            >
                <p>{t('promo_confirm_delete')}</p>
                {selectedRecord && <strong>{selectedRecord.title}</strong>}
            </Modal>
        </div>
    );
};

export default PromotionList;
