import React, { useState, useRef, useMemo } from 'react';
import { Table, Button, Typography, Tooltip, Tag, Space, Modal, Input, Select, Form, InputNumber } from 'antd';
import { PlusOutlined, SyncOutlined, FormOutlined, DeleteOutlined, ExclamationCircleOutlined, StarFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../../../api/axiosClient';
import { useLanguage } from '../../../i18n/LanguageContext';
import { usePublicProducts } from '../../../hooks/usePublicProducts';
import { useAdminProducts } from '../../../hooks/useAdminProducts';
import { EmptyState, PageWrapper, CButton, Skeleton, Pagination } from '../../../Component/Common';
import { generateSlug } from '../../../utils/helpers';
import '../../../Component/Admin/Common/List.css';

import dummy1 from '../../../Assets/Images/Products/product_dummy_1.jpg';
import dummy2 from '../../../Assets/Images/Products/product_dummy_2.jpg';
import dummy3 from '../../../Assets/Images/Products/product_dummy_3.jpg';
import dummy4 from '../../../Assets/Images/Products/product_dummy_4.jpg';
import dummy5 from '../../../Assets/Images/Products/product_dummy_5.svg';

const dummyImages = [dummy1, dummy2, dummy3, dummy4, dummy5];
const getRandomImage = () => dummyImages[Math.floor(Math.random() * dummyImages.length)];
const { Text } = Typography;
const { Search, TextArea } = Input;
const { confirm } = Modal;

const ProductList = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [editForm] = Form.useForm();

    const [selectedCategories, setSelectedCategories] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [sortOption, setSortOption] = useState('default');
    const [statusFilter, setStatusFilter] = useState(undefined);
    const [searchText, setSearchText] = useState('');
    const [inputValue, setInputValue] = useState('');
    const pageSize = 10;

    const queryParams = useMemo(() => {
        const params = { page: currentPage, size: pageSize };
        if (selectedCategories.length > 0) params.categoryId = selectedCategories.join(',');
        if (sortOption !== 'default') params.sort = sortOption;
        if (statusFilter) params.status = statusFilter;
        if (searchText) params.search = searchText;
        return params;
    }, [currentPage, pageSize, selectedCategories, sortOption, statusFilter, searchText]);

    const { products, totalPages, totalItems, isLoading, refetchProducts, categories } = usePublicProducts(queryParams);
    const { deleteVariant, isDeleting, updateVariant, isUpdatingVariant } = useAdminProducts();

    const touchTimer = useRef(null);
    const isLongPressing = useRef(false);
    const [actionModalVisible, setActionModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    const tableData = useMemo(() => products.map(p => ({
        ...p,
        hasDiscount: p.originPrice > 0 && p.discountPrice > 0 && p.discountPrice < p.originPrice,
    })), [products]);

    const categoryOptions = useMemo(() =>
        categories.map(cat => ({ label: cat.categoryName, value: cat.id })),
        [categories]);

    const sortOptions = [
        { label: t('sort_default'), value: 'default' },
        { label: t('sort_price_asc'), value: 'price_asc' },
        { label: t('sort_price_desc'), value: 'price_desc' },
        { label: t('sort_stock_asc'), value: 'stock_asc' },
        { label: t('sort_stock_desc'), value: 'stock_desc' },
        { label: t('sort_rating_asc'), value: 'rating_asc' },
        { label: t('sort_rating_desc'), value: 'rating_desc' },
        { label: t('sort_reviews_asc'), value: 'reviews_asc' },
        { label: t('sort_reviews_desc'), value: 'reviews_desc' },
    ];

    const statusOptions = [
        { label: t('active'), value: 'ACTIVE' },
        { label: t('inactive'), value: 'INACTIVE' }
    ];

    const handlePreview = (record) => {
        const slug = generateSlug(record.variantName, record.productId);
        navigate(`/admin/products/${slug}`, {
            state: { productId: record.productId }
        });
    };

    const handleTouchStart = (record) => {
        isLongPressing.current = false;
        touchTimer.current = setTimeout(() => {
            isLongPressing.current = true;
            setSelectedRecord(record);
            setActionModalVisible(true);
        }, 500);
    };

    const handleTouchEnd = () => {
        if (touchTimer.current) clearTimeout(touchTimer.current);
    };

    const handleClickRow = (record) => {
        if (!isLongPressing.current) handlePreview(record);
    };

    const handleEditClick = (record) => {
        setSelectedRecord(record);
        editForm.setFieldsValue({
            price: record.discountPrice,
            stockQuantity: record.stock,
            status: record.status,
            description: record.description
        });
        setEditModalVisible(true);
        setActionModalVisible(false);
    };

    const handleEditSubmit = async (values) => {
        await updateVariant({
            id: selectedRecord.productId,
            productVariantName: selectedRecord.variantName,
            price: values.price,
            stockQuantity: values.stockQuantity,
            status: values.status,
            description: values.description,
            productImageUrl: selectedRecord.imageUrl || ''
        });
        setEditModalVisible(false);
        refetchProducts();
    };

    const handleDeleteClick = (record) => {
        setSelectedRecord(record);
        setActionModalVisible(false);
        confirm({
            title: `${t('confirm_delete_title')} ${record.variantName}`,
            icon: <ExclamationCircleOutlined />,
            content: t('confirm_delete_message'),
            okText: t('delete'),
            okType: 'danger',
            cancelText: t('cancel'),
            onOk: async () => {
                await deleteVariant(record.productId);
                refetchProducts();
            }
        });
    };

    const handleSearch = (value) => {
        setSearchText(value);
        setCurrentPage(0);
    };

    const handleCategorySelect = (value) => {
        setSelectedCategories(value ? [value] : []);
        setCurrentPage(0);
    };

    const handleSortChange = (value) => {
        setSortOption(value);
        setCurrentPage(0);
    };

    const handleStatusChange = (value) => {
        setStatusFilter(value);
        setCurrentPage(0);
    };

    const handleResetFilters = () => {
        setCurrentPage(0);
        setSortOption('default');
        setStatusFilter(undefined);
        setSearchText('');
        setInputValue('');
        setSelectedCategories([]);
        refetchProducts();
    };

    const columns = [
        {
            title: t('admin_variant_id'),
            dataIndex: 'productId',
            key: 'productId',
            width: 90,
            align: 'center',
            render: (id) => <span className="admin-table-id">#{id}</span>
        },
        {
            title: t('admin_product_image'),
            dataIndex: 'imageUrl',
            key: 'imageUrl',
            width: 80,
            align: 'center',
            render: (src) => {
                const imageSrc = src ? getImageUrl(src) : getRandomImage();
                return (
                    <div className="admin-table-image-wrapper">
                        <img src={imageSrc} alt="product" className="admin-table-image" onError={(e) => { e.target.src = getRandomImage(); }} />
                    </div>
                );
            }
        },
        {
            title: t('admin_product_name'),
            dataIndex: 'variantName',
            key: 'variantName',
            width: 220,
            render: (variantName) => <span className="admin-table-product-name">{variantName}</span>
        },
        {
            title: t('admin_product_brand'),
            dataIndex: 'brand',
            key: 'brand',
            width: 120,
            render: (brand) => <Text strong className="admin-table-brand">{brand}</Text>
        },
        {
            title: t('admin_product_category'),
            dataIndex: 'categories',
            key: 'categories',
            width: 180,
            responsive: ['md'],
            render: (cats) => (
                <Space size={[0, 4]} wrap>
                    {Array.isArray(cats) && cats.map((c, i) => (
                        <Tag key={i} className="admin-table-tag">{typeof c === 'object' ? c.categoryName : c}</Tag>
                    ))}
                </Space>
            )
        },
        {
            title: t('admin_label_price'),
            dataIndex: 'discountPrice',
            key: 'discountPrice',
            width: 150,
            render: (discountPrice, record) => (
                <div className="admin-price-wrapper">
                    {record.hasDiscount && (
                        <div className="admin-old-price-row">
                            <Text delete className="admin-old-price">
                                {record.originPrice.toLocaleString('vi-VN')}đ
                            </Text>
                        </div>
                    )}
                    <Text className={`admin-current-price ${record.hasDiscount ? 'is-sale' : ''}`}>
                        {discountPrice.toLocaleString('vi-VN')}đ
                    </Text>
                </div>
            )
        },
        {
            title: t('reviews'),
            key: 'reviews',
            width: 100,
            align: 'center',
            render: (_, record) => (
                <Space size="small" align="center">
                    <Text strong>{Number(record.averageRating || 0).toFixed(1)}</Text>
                    <StarFilled style={{ color: '#f59e0b', fontSize: '12px' }} />
                </Space>
            )
        },
        {
            title: t('admin_label_stock'),
            dataIndex: 'stock',
            key: 'stock',
            width: 90,
            align: 'center',
            render: (stock) => (
                <span className={`admin-status-badge ${stock > 0 ? 'success' : 'danger'}`}>
                    {stock}
                </span>
            )
        },
        {
            title: t('status'),
            dataIndex: 'status',
            key: 'status',
            width: 110,
            align: 'center',
            render: (status) => (
                <span className={`admin-status-badge ${status === 'ACTIVE' ? 'success' : 'danger'}`}>
                    {status === 'ACTIVE' ? t('active') : t('inactive')}
                </span>
            )
        },
        {
            title: t('actions_col'),
            key: 'action',
            width: 100,
            align: 'center',
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title={t('edit')}>
                        <Button type="text" className="admin-action-btn edit-btn" icon={<FormOutlined />}
                            onClick={(e) => { e.stopPropagation(); handleEditClick(record); }} />
                    </Tooltip>
                    <Tooltip title={t('delete')}>
                        <Button type="text" className="admin-action-btn delete-btn" icon={<DeleteOutlined />} loading={isDeleting && selectedRecord?.productId === record.productId}
                            onClick={(e) => { e.stopPropagation(); handleDeleteClick(record); }} />
                    </Tooltip>
                </Space>
            )
        },
    ];

    return (
        <div className="admin-list-container">
            <PageWrapper
                title={t('admin_home_products_title')}
                subtitle={<>{t('total')} • <Text strong className="admin-subtitle-count">{totalItems}</Text> {t('product_items').toLowerCase()}</>}
                extra={
                    <div className="admin-header-buttons">
                        <CButton type="secondary" icon={<SyncOutlined />} onClick={handleResetFilters} loading={isLoading} className="admin-btn-responsive">
                            {t('refresh')}
                        </CButton>
                        <CButton type="primary" icon={<PlusOutlined />} onClick={() => navigate('/admin/products/create')} className="admin-btn-responsive">
                            {t('admin_product_create')}
                        </CButton>
                    </div>
                }
            >
                <div className="admin-filter-bar">
                    <Search
                        placeholder={t('admin_search_products')}
                        allowClear
                        onSearch={handleSearch}
                        className="admin-toolbar-search"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                    <Select
                        showSearch
                        allowClear
                        placeholder={t('categories')}
                        options={categoryOptions}
                        onChange={handleCategorySelect}
                        className="admin-toolbar-select"
                        filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                        value={selectedCategories.length === 1 ? selectedCategories[0] : undefined}
                    />
                    <Select
                        allowClear
                        placeholder={t('status')}
                        options={statusOptions}
                        onChange={handleStatusChange}
                        className="admin-toolbar-select"
                        value={statusFilter}
                    />
                    <Select
                        placeholder={t('sort_default')}
                        options={sortOptions}
                        onChange={handleSortChange}
                        className="admin-toolbar-select"
                        value={sortOption}
                    />
                </div>

                <div className="admin-table-wrapper">
                    {isLoading && products.length === 0 ? (
                        <div style={{ padding: 24 }}>
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} width="100%" height="60px" borderRadius="8px" style={{ marginBottom: 16 }} />
                            ))}
                        </div>
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={tableData}
                            rowKey="productId"
                            className="beauty-table"
                            pagination={false}
                            loading={isLoading}
                            scroll={{ x: 'max-content' }}
                            locale={{ emptyText: <EmptyState description={t('no_products_found')} /> }}
                            onRow={(record) => ({
                                onClick: () => handleClickRow(record),
                                onTouchStart: () => handleTouchStart(record),
                                onTouchEnd: handleTouchEnd,
                                onTouchMove: handleTouchEnd,
                                onTouchCancel: handleTouchEnd,
                                className: "admin-table-row-pointer"
                            })}
                        />
                    )}
                    {products.length > 0 && totalPages > 1 && (
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

            <Modal
                open={actionModalVisible}
                onCancel={() => setActionModalVisible(false)}
                footer={null}
                title={selectedRecord ? `#${selectedRecord.productId} - ${selectedRecord.variantName}` : t('admin_product_action')}
                centered
                width={320}
            >
                <div className="admin-modal-action-wrap">
                    <Button type="primary" block size="large" icon={<FormOutlined />} onClick={() => handleEditClick(selectedRecord)}>{t('edit')}</Button>
                    <Button danger block size="large" icon={<DeleteOutlined />} onClick={() => handleDeleteClick(selectedRecord)}>{t('delete')}</Button>
                </div>
            </Modal>

            <Modal
                open={editModalVisible}
                onCancel={() => setEditModalVisible(false)}
                title={`${t('edit')} ${selectedRecord?.variantName}`}
                onOk={() => editForm.submit()}
                confirmLoading={isUpdatingVariant}
                centered
                destroyOnHidden
                okText={t('save')}
                cancelText={t('cancel')}
            >
                <Form form={editForm} layout="vertical" onFinish={handleEditSubmit} className="admin-edit-modal-form">
                    <Form.Item name="price" label={t('admin_label_price')} rules={[{ required: true }]}>
                        <InputNumber
                            min={0}
                            style={{ width: '100%' }}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        />
                    </Form.Item>
                    <Form.Item name="stockQuantity" label={t('admin_label_stock')} rules={[{ required: true }]}>
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item name="description" label={t('admin_label_desc')}>
                        <TextArea rows={3} placeholder={t('admin_placeholder_desc')} />
                    </Form.Item>

                    <Form.Item name="status" label={t('status')} rules={[{ required: true }]}>
                        <Select options={statusOptions} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ProductList;
