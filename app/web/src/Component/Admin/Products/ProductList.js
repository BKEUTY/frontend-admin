import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Table, Button, notification, Typography, Tooltip, Tag, Space, Modal } from 'antd';
import {
    PlusOutlined, SyncOutlined,
    FormOutlined, DeleteOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import adminApi from '../../../api/adminApi';
import { getImageUrl } from '../../../api/axiosClient';
import { useLanguage } from '../../../i18n/LanguageContext';
import { useAuth } from '../../../Context/AuthContext';
import { EmptyState, PageWrapper, CButton } from '../../Common';
import { generateSlug } from '../../../utils/helpers';
import productPlaceholder from '../../../Assets/Images/Products/product_placeholder.svg';
import './ProductList.css';

const { Text } = Typography;

const ProductList = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);

    const fetchProducts = useCallback(async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const response = await adminApi.getAllProducts(0, 1000);
            const parentProducts = response.data.content || [];

            const variantsPromises = parentProducts.map(p => adminApi.getVariants(p.id || p.productId).catch(() => ({ data: [] })));
            const variantsResponses = await Promise.all(variantsPromises);

            const flattenedVariants = [];
            parentProducts.forEach((parent, index) => {
                const pid = parent.id || parent.productId;
                const variants = variantsResponses[index].data || [];
                
                if (variants.length > 0) {
                    variants.forEach(v => {
                        const displayName = v.productVariantName || parent.name;
                        flattenedVariants.push({
                            ...v,
                            id: generateSlug(displayName, pid, v.id),
                            originalVariantId: v.id,
                            parentId: pid,
                            productVariantName: displayName,
                            categories: parent.categories
                        });
                    });
                } else {
                    flattenedVariants.push({
                        id: generateSlug(parent.name, pid, 0),
                        originalVariantId: 0,
                        parentId: pid,
                        productVariantName: parent.name,
                        productImageUrl: parent.image,
                        price: parent.minPrice !== undefined ? parent.minPrice : (parent.price || 0),
                        stockQuantity: parent.stockQuantity || parent.totalStock || 0,
                        categories: parent.categories,
                        isParentOnly: true
                    });
                }
            });

            setData(flattenedVariants);
        } catch (error) {
            notification.error({
                message: t('error'),
                description: t('api_error_fetch')
            });
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, t]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchProducts();
        }
    }, [fetchProducts, isAuthenticated]);

    const handlePreview = (record) => {
        navigate(`/admin/products/${record.id}`);
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
        }, 500);
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

    const handleEdit = () => {
        notification.info({ message: 'Info', description: 'Coming soon' });
        setActionModalVisible(false);
    };

    const handleDelete = () => {
        notification.info({ message: 'Info', description: 'Coming soon' });
        setActionModalVisible(false);
    };

    const categoryFilters = Array.from(
        new Set(data.flatMap(item => item.categories?.map(c => typeof c === 'object' ? c.categoryName : c) || []))
    ).map(cat => ({ text: cat, value: cat }));

    const columns = [
        {
            title: 'Variant ID',
            key: 'originalVariantId',
            width: 100,
            align: 'center',
            render: (_, record) => (
                <span className="admin-table-id">
                    #{record.originalVariantId || record.parentId}
                </span>
            )
        },
        {
            title: t('admin_product_image'),
            dataIndex: 'productImageUrl',
            key: 'image',
            width: 100,
            align: 'center',
            render: (src) => (
                <div className="admin-table-image-wrapper">
                    <img 
                        src={src ? getImageUrl(src) : productPlaceholder} 
                        alt="product" 
                        className="admin-table-image" 
                        onError={(e) => { e.target.src = productPlaceholder }}
                    />
                </div>
            )
        },
        {
            title: t('admin_product_name'),
            dataIndex: 'productVariantName',
            key: 'name',
            width: 300,
            render: (text) => <span className="admin-table-product-name">{text}</span>
        },
        {
            title: t('admin_product_category'),
            dataIndex: 'categories',
            key: 'categories',
            width: 200,
            responsive: ['md'],
            filters: categoryFilters,
            onFilter: (value, record) => {
                const cats = record.categories?.map(c => typeof c === 'object' ? c.categoryName : c) || [];
                return cats.includes(value);
            },
            render: (cats) => (
                <Space size={[0, 4]} wrap>
                    {Array.isArray(cats) && cats.map((c, i) => (
                        <Tag key={i} className="admin-table-tag">
                            {typeof c === 'object' ? c.categoryName : c}
                        </Tag>
                    ))}
                </Space>
            )
        },
        {
            title: t('admin_label_price'),
            dataIndex: 'price',
            key: 'price',
            width: 120,
            sorter: (a, b) => (a.price || 0) - (b.price || 0),
            render: (price) => <Text strong>{price?.toLocaleString("vi-VN")}đ</Text>
        },
        {
            title: t('admin_label_stock'),
            dataIndex: 'stockQuantity',
            key: 'stock',
            width: 100,
            align: 'center',
            sorter: (a, b) => (a.stockQuantity || 0) - (b.stockQuantity || 0),
            render: (stock) => <Tag color={stock > 0 ? 'green' : 'red'}>{stock}</Tag>
        },
        {
            title: t('admin_product_action'),
            key: 'action',
            width: 120,
            align: 'center',
            fixed: 'right',
            responsive: ['md'],
            render: (_, record) => {
                return (
                    <Space size="middle">
                        <Tooltip title={t('edit')}>
                            <Button
                                type="text"
                                className="admin-action-btn edit-btn"
                                icon={<FormOutlined />}
                                onClick={(e) => { e.stopPropagation(); setSelectedRecord(record); handleEdit(); }}
                            />
                        </Tooltip>
                        <Tooltip title={t('delete')}>
                            <Button
                                type="text"
                                className="admin-action-btn delete-btn"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={(e) => { e.stopPropagation(); setSelectedRecord(record); handleDelete(); }}
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
                        {t('available')} • <Text strong className="admin-subtitle-count">{data.length}</Text> {t('items')}
                    </>
                }
                extra={
                    <Space size="large" wrap className="admin-space-btn">
                        <CButton
                            type="secondary"
                            icon={<SyncOutlined />}
                            onClick={fetchProducts}
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
                    rowKey="id"
                    className="beauty-table"
                    pagination={{
                        showTotal: (total) => `${t('total')} ${total} ${t('items')}`,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50'],
                        defaultPageSize: 10,
                        locale: { items_per_page: `/ ${t('page')}` }
                    }}
                    loading={loading}
                    scroll={{ x: 'max-content' }}
                    locale={{
                        emptyText: <EmptyState description={t('no_products_found')} />
                    }}
                    onRow={(record) => ({
                        onClick: () => handleClickRow(record),
                        onTouchStart: () => handleTouchStart(record),
                        onTouchEnd: handleTouchEnd,
                        onTouchMove: handleTouchEnd,
                        onTouchCancel: handleTouchEnd,
                        className: "admin-table-row-pointer"
                    })}
                />
            </PageWrapper>

            <Modal
                open={actionModalVisible}
                onCancel={() => setActionModalVisible(false)}
                footer={null}
                title={selectedRecord ? `#${selectedRecord.originalVariantId || selectedRecord.parentId} - ${selectedRecord.productVariantName}` : t('admin_product_action')}
                centered
                width={320}
            >
                <div className="admin-modal-action-wrap">
                    <Button type="primary" size="large" icon={<FormOutlined />} onClick={handleEdit}>
                        {t('edit')}
                    </Button>
                    <Button danger size="large" icon={<DeleteOutlined />} onClick={handleDelete}>
                        {t('delete')}
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default ProductList;
