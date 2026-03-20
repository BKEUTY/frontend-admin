import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
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
import Pagination from '../../Common/Pagination';
import './ProductList.css';

import dummy1 from '../../../Assets/Images/Products/product_dummy_1.jpg';
import dummy2 from '../../../Assets/Images/Products/product_dummy_2.jpg';
import dummy3 from '../../../Assets/Images/Products/product_dummy_3.jpg';
import dummy4 from '../../../Assets/Images/Products/product_dummy_4.jpg';
import dummy5 from '../../../Assets/Images/Products/product_dummy_5.svg';

const dummyImages = [dummy1, dummy2, dummy3, dummy4, dummy5];
const getRandomImage = () => dummyImages[Math.floor(Math.random() * dummyImages.length)];

const { Text } = Typography;

const ProductList = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const pageSize = 10;

    const fetchCategories = useCallback(async () => {
        try {
            const response = await adminApi.getAllCategories();
            setCategories(response.data || []);
        } catch (error) {
            console.error(error);
        }
    }, []);

    const fetchProducts = useCallback(async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const response = await adminApi.getAllVariantsPaginated(currentPage, pageSize, selectedCategories);
            const items = response.data?.content || [];
            
            const mappedData = items.map(v => ({
                ...v,
                originalVariantId: v.id,
                parentId: v.productId,
                productVariantName: v.productVariantName,
                categories: v.categories
            }));

            setData(mappedData);
            setTotalPages(response.data?.totalPages || 0);
            setTotalItems(response.data?.totalElements || 0);
        } catch (error) {
            if (!error?.isGlobalHandled) {
                notification.error({
                    key: 'fetch_products_error',
                    message: t('error'),
                    description: t('api_error_fetch')
                });
            }
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, currentPage, pageSize, selectedCategories, t]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchCategories();
        }
    }, [isAuthenticated, fetchCategories]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchProducts();
        }
    }, [fetchProducts, isAuthenticated]);

    const handlePreview = (record) => {
        navigate(`/admin/products/${record.parentId || record.id}`);
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
        notification.info({ 
            key: 'info_coming_soon',
            message: t('info'), 
            description: t('coming_soon') 
        });
        setActionModalVisible(false);
    };

    const handleDelete = () => {
        notification.info({ 
            key: 'info_coming_soon',
            message: t('info'), 
            description: t('coming_soon') 
        });
        setActionModalVisible(false);
    };

    const handleTableChange = (pagination, filters, sorter) => {
        if (filters.categories && filters.categories.length > 0) {
            setSelectedCategories(filters.categories);
        } else {
            setSelectedCategories([]);
        }
        setCurrentPage(0);
    };

    const categoryFilters = useMemo(() => {
        return categories.map(cat => ({ text: cat.categoryName, value: cat.id }));
    }, [categories]);

    const columns = [
        {
            title: t('admin_variant_id'),
            key: 'originalVariantId',
            width: 120,
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
            render: (src) => {
                const imgSource = src ? getImageUrl(src) : getRandomImage();
                return (
                    <div className="admin-table-image-wrapper">
                        <img 
                            src={imgSource} 
                            alt={t('product')} 
                            className="admin-table-image" 
                            onError={(e) => { e.target.src = getRandomImage() }}
                        />
                    </div>
                );
            }
        },
        {
            title: t('admin_product_name'),
            dataIndex: 'productVariantName',
            key: 'name',
            width: 250,
            render: (text) => <span className="admin-table-product-name">{text}</span>
        },
        {
            title: t('admin_product_category'),
            dataIndex: 'categories',
            key: 'categories',
            width: 200,
            responsive: ['md'],
            filters: categoryFilters,
            filterMultiple: true,
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
            width: 100,
            align: 'center',
            fixed: 'right',
            render: (_, record) => {
                return (
                    <Space size="small">
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
                        {t('available')} • <Text strong className="admin-subtitle-count">{totalItems}</Text> {t('items')}
                    </>
                }
                extra={
                    <Space size="large" wrap className="admin-space-btn">
                        <CButton
                            type="secondary"
                            icon={<SyncOutlined />}
                            onClick={() => {
                                setCurrentPage(0);
                                fetchProducts();
                            }}
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
                <div className="admin-table-wrapper">
                    <Table
                        columns={columns}
                        dataSource={data}
                        rowKey="id"
                        className="beauty-table"
                        pagination={false}
                        loading={loading}
                        scroll={{ x: 'max-content' }}
                        onChange={handleTableChange}
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
                    
                    {data.length > 0 && totalPages > 1 && (
                        <div className="admin-custom-pagination">
                            <Pagination 
                                page={currentPage} 
                                totalPages={totalPages} 
                                onPageChange={(page) => {
                                    setCurrentPage(page);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }} 
                            />
                        </div>
                    )}
                </div>
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
