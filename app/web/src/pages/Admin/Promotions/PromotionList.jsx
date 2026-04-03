import React, { useState, useMemo } from 'react';
import { Table, Button, Typography, Tooltip, Tag, Space, Modal, Input } from 'antd';
import { PlusOutlined, SyncOutlined, FormOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../i18n/LanguageContext';
import { useAuth } from '../../../Context/AuthContext';
import { EmptyState, PageWrapper, CButton, Pagination } from '../../../Component/Common';
import { useAdminPromotions, useDeletePromotion } from '../../../hooks/useAdminPromotions';
import '../../../Component/Admin/Common/List.css';

const { Text } = Typography;
const { Search } = Input;
const { confirm } = Modal;

const PromotionList = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [inputValue, setInputValue] = useState('');
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 10;

    const { data, totalPages, totalItems, isLoading: loading, refetchPromotions } = useAdminPromotions(
        { page: currentPage, size: pageSize },
        { enabled: isAuthenticated }
    );
    const { mutateAsync: deletePromotion, isPending: isDeleting } = useDeletePromotion();

    const filteredPromotions = useMemo(() => {
        return data.filter(p => (p.title || '').toLowerCase().includes(searchText.toLowerCase()));
    }, [data, searchText]);

    const handleSearch = (value) => {
        setSearchText(value);
        setCurrentPage(0);
    };

    const handleRefresh = () => {
        setInputValue('');
        setSearchText('');
        setCurrentPage(0);
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
                <Tag color="volcano" className="discount-tag" style={{ margin: 0, padding: '4px 12px', fontSize: '13px' }}>
                    {record.discountType === 'PERCENTAGE' ? `${record.discountValue}%` : `${record.discountValue?.toLocaleString()}đ`}
                </Tag>
            )
        },
        {
            title: t('promo_col_type'),
            dataIndex: 'promotionType',
            key: 'type',
            width: 150,
            render: (type) => <Tag color="blue" style={{ margin: 0 }}>{type === 'PRODUCT' ? 'Sản phẩm' : type || 'ALL'}</Tag>
        },
        {
            title: t('promo_col_start_time'), 
            dataIndex: 'startAt',
            key: 'startAt',
            width: 160,
            render: (date) => (
                <span style={{ color: '#475569', fontSize: '13px' }}>
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
                <span style={{ color: '#475569', fontSize: '13px' }}>
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
                let color = 'default';
                switch(status) {
                    case 'STARTING': color = 'success'; break;
                    case 'INCOMING': color = 'processing'; break;
                    case 'ENDED': color = 'error'; break;
                    case 'DISABLED': color = 'default'; break;
                }
                return (
                    <Tag color={color} style={{ margin: 0, padding: '2px 10px', borderRadius: '4px' }}>
                        {t(`promo_status_${status}`)}
                    </Tag>
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
                subtitle={<>{t('total')} • <Text strong className="admin-subtitle-count">{totalItems}</Text> {t('promotion_items').toLowerCase()}</>}
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
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onSearch={handleSearch}
                        className="admin-toolbar-search"
                        style={{ maxWidth: 400 }}
                    />
                </div>

                <div className="admin-table-wrapper">
                    <Table
                        columns={columns} 
                        dataSource={filteredPromotions} 
                        rowKey="id" 
                        className="beauty-table" 
                        pagination={false} 
                        loading={loading} 
                        scroll={{ x: 'max-content' }}
                        locale={{ emptyText: <EmptyState description={t('no_promos_found')} /> }}
                    />
                    {data.length > 0 && totalPages > 1 && (
                        <div className="admin-custom-pagination">
                            <Pagination 
                                page={currentPage} 
                                totalPages={totalPages} 
                                totalItems={totalItems}
                                pageSize={pageSize}
                                onPageChange={(page) => { 
                                    setCurrentPage(page); 
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
