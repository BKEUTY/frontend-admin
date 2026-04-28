import { CButton, EmptyState, PageWrapper, Pagination, Skeleton } from '@/components/common';
import { useProducts } from '@/features/products/hooks/useProducts';
import { usePublicProducts } from '@/features/products/hooks/usePublicProducts';
import { useDebounce } from '@/hooks/useDebounce';
import useQueryParams from '@/hooks/useQueryParams';
import { getImageUrl } from '@/services/axiosClient';
import { useLanguage } from '@/store/LanguageContext';
import { generateSlug } from '@/utils/helpers';
import { DeleteOutlined, ExclamationCircleOutlined, FormOutlined, PlusOutlined, StarFilled, SyncOutlined, FilterOutlined, SortAscendingOutlined } from '@ant-design/icons';
import { Form, Input, InputNumber, Modal, Select, Space, Table, Tag, Tooltip, Typography } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '@/admin-list.css';

import dummy1 from '@/assets/images/products/product_dummy_1.jpg';
import dummy2 from '@/assets/images/products/product_dummy_2.jpg';
import dummy3 from '@/assets/images/products/product_dummy_3.jpg';
import dummy4 from '@/assets/images/products/product_dummy_4.jpg';
import dummy5 from '@/assets/images/products/product_dummy_5.svg';

const dummyImages = [dummy1, dummy2, dummy3, dummy4, dummy5];
const getRandomImage = () => dummyImages[Math.floor(Math.random() * dummyImages.length)];
const { Text } = Typography;
const { Search, TextArea } = Input;
const { confirm } = Modal;

const ProductList = () => {
    const { t, language } = useLanguage();
    const locale = language === 'vi' ? 'vi-VN' : 'en-US';
    const navigate = useNavigate();
    const [editForm] = Form.useForm();
    const [query, setQuery] = useQueryParams();

    const currentPage = query.page ? Number(query.page) : 1;
    const sortOption = query.sort || 'default';
    const statusFilter = query.status || undefined;
    const searchText = query.search || '';
    const selectedCategoryId = query.categoryId ? Number(query.categoryId) : undefined;
    const pageSize = 10;
    const [searchInput, setSearchInput] = useState(searchText);
    const debouncedSearch = useDebounce(searchInput, 500);

    const queryParams = useMemo(() => {
        const params = { page: currentPage, size: pageSize };
        if (selectedCategoryId) params.categoryId = selectedCategoryId;
        if (sortOption !== 'default') params.sort = sortOption;
        if (statusFilter) params.status = statusFilter;
        if (searchText) params.search = searchText;
        return params;
    }, [currentPage, pageSize, selectedCategoryId, sortOption, statusFilter, searchText]);

    const { products, totalPages, totalItems, isLoading, refetchProducts, categories } = usePublicProducts(queryParams);
    const { deleteVariant, isDeleting, updateVariant, isUpdatingVariant } = useProducts();

    const touchTimer = useRef(null);
    const isLongPressing = useRef(false);
    const [actionModalVisible, setActionModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    useEffect(() => {
        if (!searchText) setSearchInput('');
    }, [searchText]);

    useEffect(() => {
        if (debouncedSearch !== searchInput) return;

        const cleanSearch = String(debouncedSearch ?? '').trim();
        if (cleanSearch !== searchText) {
            setQuery({ search: cleanSearch || null, page: 1 });
        }
    }, [debouncedSearch, searchInput, searchText, setQuery]);

    const tableData = useMemo(() => products.map(p => ({
        ...p,
        hasDiscount: p.discountPrice < p.originPrice,
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
        { label: t('sort_sold_asc'), value: 'sold_asc' },
        { label: t('sort_sold_desc'), value: 'sold_desc' },
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
            stockQuantity: record.stockQuantity,
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

    const handleCategorySelect = (value) => {
        setQuery({ categoryId: value || null, page: 1 });
    };

    const handleSortChange = (value) => {
        setQuery({ sort: value === 'default' ? null : value, page: 1 });
    };

    const handleStatusChange = (value) => {
        setQuery({ status: value || null, page: 1 });
    };

    const handleSearch = (value) => {
        setQuery({ search: value?.trim() || null, page: 1 });
    };

    const handleResetFilters = () => {
        setQuery({ page: null, sort: null, status: null, search: null, categoryId: null });
        setSearchInput('');
        refetchProducts();
    };

    const columns = [
        {
            title: t('admin_variant_id'),
            dataIndex: 'productId',
            key: 'productId',
            width: 80,
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
            width: 250,
            ellipsis: true,
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
                                {record.originPrice.toLocaleString(locale)}{t('admin_unit_vnd')}
                            </Text>
                        </div>
                    )}
                    <Text className={`admin-current-price ${record.hasDiscount ? 'is-sale' : ''}`}>
                        {discountPrice.toLocaleString(locale)}{t('admin_unit_vnd')}
                    </Text>
                </div>
            )
        },
        {
            title: t('reviews'),
            key: 'reviews',
            width: 110,
            align: 'center',
            render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                    <Text strong style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        {Number(record.averageRating).toFixed(1)}
                        <StarFilled style={{ color: '#f59e0b', fontSize: '12px', marginTop: '-1px' }} />
                    </Text>
                    <Text type="secondary" strong>({record.reviewCount})</Text>
                </div>
            )
        },
        {
            title: t('admin_label_stock'),
            dataIndex: 'stockQuantity',
            key: 'stockQuantity',
            width: 80,
            align: 'right',
            render: (stockQuantity) => (
                <span className={`admin-status-badge ${stockQuantity > 0 ? 'success' : 'danger'}`} style={{ marginLeft: 'auto' }}>
                    {stockQuantity}
                </span>
            )
        },
        {
            title: t('admin_label_sold'),
            dataIndex: 'sold',
            key: 'sold',
            width: 80,
            align: 'right',
            render: (sold) => (
                <span className="admin-sold-badge" style={{ marginLeft: 'auto' }}>
                    {sold || 0}
                </span>
            )
        },
        {
            title: t('status'),
            dataIndex: 'status',
            key: 'status',
            width: 140,
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
                        <CButton type="text" className="admin-action-btn edit-btn" icon={<FormOutlined />}
                            onClick={(e) => { e.stopPropagation(); handleEditClick(record); }} />
                    </Tooltip>
                    <Tooltip title={t('delete')}>
                        <CButton type="text" className="admin-action-btn delete-btn" icon={<DeleteOutlined />} loading={isDeleting && selectedRecord?.productId === record.productId}
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
                subtitle={<>{t('total')} • <Text strong className="admin-subtitle-count">{totalItems}</Text> {t('admin_unit_product')}</>}
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
                    <div className="admin-filter-left">
                        <Search
                            placeholder={t('admin_search_products')}
                            allowClear
                            className="admin-toolbar-search"
                            value={searchInput}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSearchInput(val);
                                if (!val) {
                                    setQuery({ search: null, page: 1 });
                                }
                            }}
                            onSearch={handleSearch}
                        />
                        <div className="admin-filter-group">
                            <FilterOutlined style={{ color: '#94a3b8', fontSize: '16px' }} />
                            <Select
                                showSearch
                                allowClear
                                placeholder={t('categories')}
                                options={categoryOptions}
                                onChange={handleCategorySelect}
                                className="admin-toolbar-select"
                                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                                value={selectedCategoryId}
                                style={{ minWidth: 160 }}
                            />
                        </div>
                    </div>
                    <div className="admin-toolbar-right">
                        <div className="admin-filter-group">
                            <FilterOutlined style={{ color: '#94a3b8', fontSize: '16px' }} />
                            <Select
                                allowClear
                                placeholder={t('status')}
                                options={statusOptions}
                                onChange={handleStatusChange}
                                className="admin-toolbar-select"
                                value={statusFilter}
                                style={{ minWidth: 160 }}
                            />
                        </div>
                        <div className="admin-filter-group">
                            <SortAscendingOutlined style={{ color: '#94a3b8', fontSize: '16px' }} />
                            <Select
                                placeholder={t('sort_default')}
                                options={sortOptions}
                                onChange={handleSortChange}
                                className="admin-toolbar-select"
                                value={sortOption}
                                style={{ minWidth: 200 }}
                            />
                        </div>
                    </div>
                </div>

                <div className="admin-table-wrapper">
                    {isLoading && products.length === 0 ? (
                        <div style={{ padding: 24 }}>
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} width="100%" height="60px" borderRadius="16px" style={{ marginBottom: 16 }} />
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
                                    setQuery({ page: page });
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
                title={selectedRecord ? `#${selectedRecord.productId} - ${selectedRecord.variantName}` : t('actions_col')}
                centered
                width={320}
            >
                <div className="admin-modal-action-wrap" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <CButton type="primary" block size="large" icon={<FormOutlined />} onClick={() => handleEditClick(selectedRecord)}>{t('edit')}</CButton>
                    <CButton danger block size="large" icon={<DeleteOutlined />} onClick={() => handleDeleteClick(selectedRecord)}>{t('delete')}</CButton>
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
