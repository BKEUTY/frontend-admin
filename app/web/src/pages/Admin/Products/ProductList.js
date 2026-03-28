import React, { useState, useRef, useMemo } from 'react';
import { Table, Button, notification, Typography, Tooltip, Tag, Space, Modal, Input, Select } from 'antd';
import { PlusOutlined, SyncOutlined, FormOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../../../api/axiosClient';
import { useLanguage } from '../../../i18n/LanguageContext';
import { usePublicProducts } from '../../../hooks/usePublicProducts';
import { EmptyState, PageWrapper, CButton, Skeleton, Pagination } from '../../../Component/Common';
import './ProductList.css';

import dummy1 from '../../../Assets/Images/Products/product_dummy_1.jpg';
import dummy2 from '../../../Assets/Images/Products/product_dummy_2.jpg';
import dummy3 from '../../../Assets/Images/Products/product_dummy_3.jpg';
import dummy4 from '../../../Assets/Images/Products/product_dummy_4.jpg';
import dummy5 from '../../../Assets/Images/Products/product_dummy_5.svg';

const dummyImages = [dummy1, dummy2, dummy3, dummy4, dummy5];
const getRandomImage = () => dummyImages[Math.floor(Math.random() * dummyImages.length)];
const { Text } = Typography;
const { Search } = Input;

const ProductList = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();

    const [selectedCategories, setSelectedCategories] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [sortOption, setSortOption] = useState('default');
    const [searchText, setSearchText] = useState('');
    const [inputValue, setInputValue] = useState('');
    const pageSize = 10;

    const queryParams = useMemo(() => {
        const params = { page: currentPage, size: pageSize };
        if (selectedCategories.length > 0) params.categoryId = selectedCategories.join(',');
        if (sortOption !== 'default') params.sort = sortOption;
        if (searchText) params.search = searchText;
        return params;
    }, [currentPage, pageSize, selectedCategories, sortOption, searchText]);

    const { products, totalPages, totalItems, isLoading, refetchProducts, categories } = usePublicProducts(queryParams);

    const touchTimer = useRef(null);
    const isLongPressing = useRef(false);
    const [actionModalVisible, setActionModalVisible] = useState(false);
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
    ];

    const handlePreview = (record) => {
        navigate(`/admin/products/${record.variantName}`, {
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

    const handleEdit = () => {
        notification.info({ key: 'info', message: t('info'), description: t('coming_soon') });
        setActionModalVisible(false);
    };

    const handleDelete = () => {
        notification.info({ key: 'info', message: t('info'), description: t('coming_soon') });
        setActionModalVisible(false);
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

    const handleResetFilters = () => {
        setCurrentPage(0);
        setSortOption('default');
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
            width: 100,
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
            render: (variantName) => <span className="admin-table-product-name">{variantName}</span>
        },
        {
            title: t('admin_product_brand'),
            dataIndex: 'brand',
            key: 'brand',
            width: 120,
            render: (brand) => (
                <Text strong className="admin-table-brand">{brand}</Text>
            )
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
            render: (discountPrice, record) => {
                return (
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
                );
            }
        },
        {
            title: t('admin_label_stock'),
            dataIndex: 'stock',
            key: 'stock',
            width: 100,
            align: 'center',
            render: (stock) => <Tag color={stock > 0 ? 'green' : 'red'}>{stock}</Tag>
        },
        {
            title: t('admin_product_action'),
            key: 'action',
            width: 100,
            align: 'center',
            fixed: 'right',
            responsive: ['md'],
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title={t('edit')}>
                        <Button type="text" className="admin-action-btn edit-btn" icon={<FormOutlined />}
                            onClick={(e) => { e.stopPropagation(); setSelectedRecord(record); handleEdit(); }} />
                    </Tooltip>
                    <Tooltip title={t('delete')}>
                        <Button type="text" className="admin-action-btn delete-btn" icon={<DeleteOutlined />}
                            onClick={(e) => { e.stopPropagation(); setSelectedRecord(record); handleDelete(); }} />
                    </Tooltip>
                </Space>
            )
        },
    ];

    return (
        <div className="admin-product-list-container">
            <PageWrapper
                title={t('admin_product_list')}
                subtitle={<>{t('total')} • <Text strong className="admin-subtitle-count">{totalItems}</Text> {t('product_items')}</>}
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
                <div className="admin-filter-bar" style={{ flexWrap: 'wrap' }}>
                    <Search
                        placeholder={t('admin_search_products') || 'Tìm kiếm sản phẩm...'}
                        allowClear
                        onSearch={handleSearch}
                        className="admin-toolbar-search"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                    <Select
                        showSearch
                        allowClear
                        placeholder={t('categories') || 'Danh mục'}
                        options={categoryOptions}
                        onChange={handleCategorySelect}
                        className="admin-toolbar-select"
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        value={selectedCategories.length === 1 ? selectedCategories[0] : undefined}
                    />
                    <Select
                        placeholder="Sắp xếp"
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
                            rowKey="key"
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
                    <Button type="primary" size="large" icon={<FormOutlined />} onClick={handleEdit}>{t('edit')}</Button>
                    <Button danger size="large" icon={<DeleteOutlined />} onClick={handleDelete}>{t('delete')}</Button>
                </div>
            </Modal>
        </div>
    );
};

export default ProductList;