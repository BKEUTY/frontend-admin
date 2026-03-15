import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Table, Button, notification, Typography, Tooltip, Tag, Space, Modal } from 'antd';
import {
    PlusOutlined, SyncOutlined,
    FormOutlined, DeleteOutlined,
    ShoppingOutlined, EyeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import adminApi from '../../../api/adminApi';
import { getImageUrl } from '../../../api/axiosClient';
import { useLanguage } from '../../../i18n/LanguageContext';
import { useAuth } from '../../../Context/AuthContext';
import usePagination from '../../../hooks/usePagination';
import { EmptyState, PageWrapper, CButton } from '../../Common';
import './ProductList.css';
import productPlaceholder from '../../../Assets/Images/Products/product_placeholder.svg';

const { Text } = Typography;

const ProductList = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();

    const { user, isAuthenticated } = useAuth();
    const { pagination, setTotal, setCurrent } = usePagination();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);

    const fetchProducts = useCallback(async (page = 1, size = 10) => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const response = await adminApi.getAllProducts(page - 1, size);
            setData(response.data.content || []);
            setTotal(response.data.totalElements || 0);
            setCurrent(page, size);
        } catch (error) {
            console.error('Failed to fetch products', error);
        } finally {
            setLoading(false);
        }
    }, [setTotal, setCurrent, isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchProducts(pagination.current, pagination.pageSize);
        }
    }, [fetchProducts, pagination.current, pagination.pageSize, isAuthenticated]);

    const handleTableChange = (newPagination) => {
        fetchProducts(newPagination.current, newPagination.pageSize);
    };


    const handlePreview = (record) => {
        const id = record.productId || record.id;
        navigate(`/admin/products/${id}`);
    };

    const touchTimer = useRef(null);
    const isLongPressing = useRef(false);
    const [actionModalVisible, setActionModalVisible] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    const handleTouchStart = (record) => {
        isLongPressing.current = false;
        touchTimer.current = setTimeout(() => {
            isLongPressing.current = true;
            setSelectedRecord(record);
            setActionModalVisible(true);
        }, 500); // 500ms long press
    };

    const handleTouchEnd = () => {
        if (touchTimer.current) {
            clearTimeout(touchTimer.current);
        }
    };

    const handleClickRow = (record) => {
        if (!isLongPressing.current) {
            handlePreview(record);
        }
    };

    const handleEdit = (record) => {
        notification.info({ message: 'Info', description: 'Coming soon', key: 'coming_soon' });
        setActionModalVisible(false);
    };

    const handleDelete = (record) => {
        notification.info({ message: 'Info', description: 'Coming soon', key: 'coming_soon' });
        setActionModalVisible(false);
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'productId',
            key: 'id',
            width: 80,
            align: 'center',
            render: (id) => <span className="admin-table-id">#{id}</span>
        },
        {
            title: t('admin_product_image'),
            dataIndex: 'image',
            key: 'image',
            width: 120,
            align: 'center',
            render: (src) => (
                <div className="admin-table-image-wrapper">
                    <img 
                        src={src ? getImageUrl(src) : productPlaceholder} 
                        alt="p" 
                        className="admin-table-image" 
                        onError={(e) => { e.target.src = productPlaceholder }}
                    />
                </div>
            )
        },
        {
            title: t('admin_product_name'),
            dataIndex: 'name',
            key: 'name',
            width: 280,
            render: (text) => <span className="admin-table-product-name">{text}</span>
        },
        {
            title: t('admin_product_category'),
            dataIndex: 'categories',
            key: 'categories',
            width: 200,
            responsive: ['md'],
            render: (cats) => (
                <Space size={[0, 4]} wrap>
                    {Array.isArray(cats) && cats.map((c, i) => (
                        <Tag key={i} className="admin-table-tag">
                            {c}
                        </Tag>
                    ))}
                </Space>
            )
        },
        {
            title: t('admin_product_action'),
            key: 'action',
            width: 120,
            align: 'center',
            fixed: 'right',
            responsive: ['md'],
            render: (_, record) => {
                const id = record.productId || record.id;
                return (
                    <Space size="middle">
                        <Tooltip title={t('edit')}>
                            <Button
                                type="text"
                                className="admin-action-btn edit-btn"
                                icon={<FormOutlined />}
                                onClick={() => notification.info({ message: 'Info', description: 'Coming soon', key: 'coming_soon' })}
                            />
                        </Tooltip>
                        <Tooltip title={t('delete')}>
                            <Button
                                type="text"
                                className="admin-action-btn delete-btn"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => notification.info({ message: 'Info', description: 'Coming soon', key: 'coming_soon' })}
                            />
                        </Tooltip>
                    </Space>
                );
            }
        },
    ];

    return (
        <div className="admin-product-list-container">
            <PageWrapper
                title={t('admin_product_list')}
                subtitle={
                    <>
                        {t('available')} • <Text strong className="admin-subtitle-count">{pagination.total}</Text> {t('items')}
                    </>
                }
                extra={
                    <Space size="large" wrap>
                        <CButton
                            type="secondary"
                            icon={<SyncOutlined />}
                            onClick={() => fetchProducts(pagination.current, pagination.pageSize)}
                            loading={loading}
                            className="admin-btn-responsive"
                        >
                            {t('refresh')}
                        </CButton>
                        <CButton
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => navigate('/admin/products/create')}
                            className="admin-btn-responsive"
                        >
                            {t('admin_product_create')}
                        </CButton>
                    </Space>
                }
            >
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="productId"
                    className="beauty-table"
                    pagination={{
                        ...pagination,
                        showTotal: (total) => `${t('total')} ${total} ${t('items')}`,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50'],
                        locale: { items_per_page: `/ ${t('page')}` }
                    }}
                    loading={loading}
                    onChange={handleTableChange}
                    scroll={{ x: 'max-content' }}
                    locale={{
                        emptyText: (
                            <EmptyState
                                description={t('no_products_found')}
                            />
                        )
                    }}
                    onRow={(record) => ({
                        onClick: () => handleClickRow(record),
                        onTouchStart: () => handleTouchStart(record),
                        onTouchEnd: handleTouchEnd,
                        onTouchMove: handleTouchEnd,
                        onTouchCancel: handleTouchEnd,
                        style: { cursor: 'pointer' }
                    })}
                />
            </PageWrapper>

            <Modal
                open={actionModalVisible}
                onCancel={() => setActionModalVisible(false)}
                footer={null}
                title={selectedRecord ? `#${selectedRecord.productId || selectedRecord.id} - ${selectedRecord.name}` : t('admin_product_action')}
                centered
                width={320}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 20 }}>
                    <Button type="primary" size="large" icon={<FormOutlined />} onClick={() => handleEdit(selectedRecord)}>
                        {t('edit')}
                    </Button>
                    <Button danger size="large" icon={<DeleteOutlined />} onClick={() => handleDelete(selectedRecord)}>
                        {t('delete')}
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default ProductList;
