import React, { useState, useEffect } from 'react';
import { Table, Button, Typography, Tooltip, Space, Modal, Input } from 'antd';
import { PlusOutlined, SyncOutlined, FormOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../i18n/LanguageContext';
import { useAuth } from '../../../Context/AuthContext';
import { EmptyState, PageWrapper, CButton, Pagination } from '../../../Component/Common';
import { useAdminPromotions, useDeletePromotion } from '../../../hooks/useAdminPromotions';
import { useQueryParams } from '../../../hooks/useQueryParams';
import { useDebounce } from '../../../hooks/useDebounce';
import '../../../Component/Admin/Common/List.css';

const { Text } = Typography;
const { Search } = Input;
const { confirm } = Modal;

const PromotionList = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [query, setQuery] = useQueryParams();

    const searchTerm = query.search || '';
    const currentPage = query.page ? Number(query.page) - 1 : 0;
    const pageSize = 10;

    const [searchInput, setSearchInput] = useState(searchTerm);
    const debouncedSearch = useDebounce(searchInput, 500);

    const { data: promotions, totalPages, totalItems, isLoading: loading, refetchPromotions } = useAdminPromotions(
        { page: currentPage, size: pageSize, search: searchTerm },
        { enabled: isAuthenticated }
    );
    const { mutateAsync: deletePromotion, isPending: isDeleting } = useDeletePromotion();

    useEffect(() => {
        setSearchInput(searchTerm);
    }, [searchTerm]);

    useEffect(() => {
        if (debouncedSearch !== searchTerm) {
            setQuery({ search: debouncedSearch || null, page: 1 });
        }
    }, [debouncedSearch, searchTerm, setQuery]);

    const handleRefresh = () => {
        setQuery({ search: null, page: null });
        setSearchInput('');
        refetchPromotions();
    };

    const handleEdit = (record) => {
        navigate(`/admin/promotions/edit/${record.id}`, { state: { promotion: record } });
    };

    const handleDeleteClick = (record) => {
        confirm({
            title: `${t('confirm_delete_title')} ${record.title}`,
            icon: <ExclamationCircleOutlined />,
            content: t('promo_confirm_delete'),
            okText: t('delete'),
            okType: 'danger',
            cancelText: t('cancel'),
            onOk: async () => {
                await deletePromotion(record.id);
                refetchPromotions();
            }
        });
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
                <span className="admin-current-price is-sale">
                    {record.discountType === 'PERCENTAGE' ? `${record.discountValue}%` : `${record.discountValue?.toLocaleString()}đ`}
                </span>
            )
        },
        {
            title: t('promo_col_type'),
            dataIndex: 'promotionType',
            key: 'type',
            width: 150,
            render: (type) => <span className="admin-table-tag">{type === 'PRODUCT' ? 'Sản phẩm' : type || 'ALL'}</span>
        },
        {
            title: t('promo_col_start_time'), 
            dataIndex: 'startAt',
            key: 'startAt',
            width: 160,
            render: (date) => (
                <span style={{ color: '#64748b' }}>
                    {new Date(date).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                </span>
            )
        },
        {
            title: t('promo_col_end_time'), 
            dataIndex: 'endAt',
            key: 'endAt',
            width: 160,
            render: (date) => (
                <span style={{ color: '#64748b' }}>
                    {new Date(date).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                </span>
            )
        },
        {
            title: t('promo_col_status'),
            dataIndex: 'status',
            key: 'status',
            width: 130,
            align: 'center',
            render: (status) => {
                let badgeClass = 'default';
                switch(status) {
                    case 'STARTING': badgeClass = 'success'; break;
                    case 'INCOMING': badgeClass = 'info'; break;
                    case 'ENDED': badgeClass = 'danger'; break;
                    case 'DISABLED': badgeClass = 'default'; break;
                    default: badgeClass = 'default';
                }
                return (
                    <span className={`admin-status-badge ${badgeClass}`}>
                        {t(`promo_status_${status}`)}
                    </span>
                );
            }
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
                        <Button type="text" className="admin-action-btn delete-btn" icon={<DeleteOutlined />} loading={isDeleting} onClick={(e) => { e.stopPropagation(); handleDeleteClick(record); }} />
                    </Tooltip>
                </Space>
            )
        },
    ];

    return (
        <div className="admin-list-container">
            <PageWrapper
                title={t('admin_home_promotions_title')}
                subtitle={<>{t('total')} • <strong className="admin-subtitle-count">{totalItems}</strong> {t('promotion_items').toLowerCase()}</>}
                extra={
                    <div className="admin-header-buttons">
                        <CButton type="secondary" icon={<SyncOutlined />} onClick={handleRefresh} loading={loading} className="admin-btn-responsive">
                            {t('refresh')}
                        </CButton>
                        <CButton type="primary" icon={<PlusOutlined />} onClick={() => navigate('/admin/promotions/create')} className="admin-btn-responsive">
                            {t('admin_promotion_create')}
                        </CButton>
                    </div>
                }
            >
                <div className="admin-filter-bar">
                    <Search
                        placeholder={t('promo_search_placeholder')}
                        allowClear
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onSearch={(v) => setQuery({ search: v || null, page: 1 })}
                        className="admin-toolbar-search"
                        style={{ maxWidth: 400 }}
                    />
                </div>

                <div className="admin-table-wrapper">
                    <Table
                        columns={columns} 
                        dataSource={promotions} 
                        rowKey="id" 
                        className="beauty-table" 
                        pagination={false} 
                        loading={loading} 
                        scroll={{ x: 'max-content' }}
                        locale={{ emptyText: <EmptyState description={t('no_promos_found')} /> }}
                    />
                    {promotions.length > 0 && totalPages > 1 && (
                        <div className="admin-custom-pagination">
                            <Pagination 
                                page={currentPage} 
                                totalPages={totalPages} 
                                totalItems={totalItems}
                                pageSize={pageSize}
                                onPageChange={(page) => { 
                                    setQuery({ page: page + 1 }); 
                                    window.scrollTo({ top: 0, behavior: 'smooth' }); 
                                }} 
                            />
                        </div>
                    )}
                </div>
            </PageWrapper>
        </div>
    );
};

export default PromotionList;
