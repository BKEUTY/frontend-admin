import '@/admin-list.css';
import { CButton, EmptyState, PageWrapper, Pagination } from '@/components/common';
import { useBrands, useCreateBrand, useDeleteBrand, useUpdateBrand } from '@/features/brands/hooks/useBrands';
import { useDebounce } from '@/hooks/useDebounce';
import useQueryParams from '@/hooks/useQueryParams';
import { getImageUrl } from '@/services/axiosClient';
import { useAuth } from '@/store/AuthContext';
import { useLanguage } from '@/store/LanguageContext';
import { DeleteOutlined, ExclamationCircleOutlined, FormOutlined, PlusOutlined, SortAscendingOutlined, SyncOutlined, SearchOutlined, DownOutlined } from '@ant-design/icons';
import { Form, Input, Modal, Select, Space, Table, Tooltip, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';

const { Text } = Typography;
const { Search, TextArea } = Input;
const { confirm } = Modal;
const { Option } = Select;

const BrandList = () => {
    const { t } = useLanguage();
    const { isAuthenticated } = useAuth();
    const [form] = Form.useForm();
    const [query, setQuery] = useQueryParams();

    const searchTerm = query.search || '';
    const currentPage = query.page ? Number(query.page) : 1;
    const pageSize = 10;

    const [searchInput, setSearchInput] = useState(searchTerm);
    const debouncedSearch = useDebounce(searchInput, 500);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingBrand, setEditingBrand] = useState(null);

    const queryParams = useMemo(() => ({
        page: currentPage,
        size: pageSize,
        search: searchTerm
    }), [currentPage, pageSize, searchTerm]);

    const { brands, totalPages, totalItems, isLoading, refetchBrands } = useBrands(
        queryParams,
        { enabled: isAuthenticated }
    );
    const { mutateAsync: createBrand, isPending: isCreating } = useCreateBrand();
    const { mutateAsync: updateBrand, isPending: isUpdating } = useUpdateBrand();
    const { mutateAsync: deleteBrand, isPending: isDeleting } = useDeleteBrand();

    useEffect(() => {
        if (!searchTerm) setSearchInput('');
    }, [searchTerm]);

    useEffect(() => {
        if (debouncedSearch !== searchInput) return;

        const cleanSearch = String(debouncedSearch ?? '').trim();
        if (cleanSearch !== searchTerm) {
            setQuery({ search: cleanSearch || null, page: 1 });
        }
    }, [debouncedSearch, searchInput, searchTerm, setQuery]);

    const handleRefresh = () => {
        setQuery({ search: null, page: null });
        setSearchInput('');
        refetchBrands();
    };

    const openModal = (brand = null) => {
        setEditingBrand(brand);
        if (brand) {
            form.setFieldsValue({
                brandName: brand.name,
                description: brand.description,
                image: brand.image,
                brandStatus: brand.brandStatus
            });
        } else {
            form.resetFields();
            form.setFieldsValue({ brandStatus: 'ACTIVE' });
        }
        setIsModalVisible(true);
    };

    const handleSubmit = async (values) => {
        const payload = {
            brandName: values.brandName,
            description: values.description || '',
            image: values.image || '',
        };

        if (editingBrand) {
            payload.brandStatus = values.brandStatus;
        }

        try {
            if (editingBrand) {
                await updateBrand({ id: editingBrand.id, data: payload });
            } else {
                await createBrand(payload);
            }
            setIsModalVisible(false);
            refetchBrands();
        } catch (error) { }
    };

    const handleDelete = (brand) => {
        confirm({
            title: `${t('confirm_delete_title')} ${brand.name}`,
            icon: <ExclamationCircleOutlined />,
            content: t('confirm_delete_message'),
            okText: t('delete'),
            okType: 'danger',
            cancelText: t('cancel'),
            onOk: async () => {
                await deleteBrand(brand.id);
                refetchBrands();
            }
        });
    };

    const isSubmitting = isCreating || isUpdating;

    const columns = [
        {
            title: t('admin_product_id'),
            dataIndex: 'id',
            key: 'id',
            width: 80,
            align: 'center',
            render: (id) => <span className="admin-table-id">#{id}</span>
        },
        {
            title: t('admin_brand_logo'),
            dataIndex: 'image',
            key: 'image',
            width: 100,
            align: 'center',
            render: (src) => (
                <div className="admin-table-image-wrapper">
                    {src ? <img src={getImageUrl(src)} alt="brand" className="admin-table-image" />
                        : <div style={{ background: '#f1f5f9', width: '100%', height: '100%' }}></div>}
                </div>
            )
        },
        {
            title: t('admin_brand_name'),
            dataIndex: 'name',
            key: 'name',
            width: 250,
            render: (name) => <span className="admin-table-product-name">{name}</span>
        },
        {
            title: t('admin_label_desc'),
            dataIndex: 'description',
            key: 'description',
            render: (desc) => <Text style={{ color: '#64748b' }}>{desc}</Text>
        },
        {
            title: t('status'),
            dataIndex: 'brandStatus',
            key: 'brandStatus',
            width: 120,
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
            width: 120,
            align: 'center',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title={t('edit')}>
                        <CButton type="text" className="admin-action-btn edit-btn" icon={<FormOutlined />} onClick={(e) => { e.stopPropagation(); openModal(record); }} />
                    </Tooltip>
                    <Tooltip title={t('delete')}>
                        <CButton type="text" className="admin-action-btn delete-btn" icon={<DeleteOutlined />} loading={isDeleting} onClick={(e) => { e.stopPropagation(); handleDelete(record); }} />
                    </Tooltip>
                </Space>
            )
        },
    ];

    const sortOptions = [
        { label: t('sort_default'), value: 'default' },
        { label: t('sort_name_asc'), value: 'name_asc' },
        { label: t('sort_name_desc'), value: 'name_desc' },
        { label: t('status'), value: 'status_asc' },
    ];

    return (
        <div className="admin-list-container">
            <PageWrapper
                title={t('admin_home_brands_title')}
                subtitle={<>{t('total')} • <Text strong className="admin-subtitle-count">{totalItems}</Text> {t('brands').toLowerCase()}</>}
                extra={
                    <div className="admin-header-buttons">
                        <CButton type="secondary" icon={<SyncOutlined />} onClick={handleRefresh} loading={isLoading} className="admin-btn-responsive">
                            {t('refresh')}
                        </CButton>
                        <CButton type="primary" icon={<PlusOutlined />} onClick={() => openModal()} className="admin-btn-responsive">
                            {t('admin_brand_add')}
                        </CButton>
                    </div>
                }
            >
                <div className="admin-filter-bar">
                    <div className="admin-filter-left">
                        <Input
                            placeholder={t('admin_brand_search')}
                            allowClear
                            value={searchInput}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSearchInput(val);
                                if (!val) {
                                    setQuery({ search: null, page: 1 });
                                }
                            }}
                            onPressEnter={() => setQuery({ search: searchInput?.trim() || null, page: 1 })}
                            className="admin-toolbar-search admin-unified-input"
                            suffix={<SearchOutlined style={{ color: 'var(--admin-primary)', fontSize: '18px', cursor: 'pointer' }} onClick={() => setQuery({ search: searchInput?.trim() || null, page: 1 })} />}
                        />
                    </div>
                    <div className="admin-toolbar-right">
                        <div className="admin-select-wrapper">
                            <Select
                                placeholder={t('sort_default')}
                                onChange={(val) => setQuery({ sort: val === 'default' ? null : val, page: 1 })}
                                className="admin-toolbar-select admin-custom-select"
                                value={query.sort || 'default'}
                                suffixIcon={
                                    <div className="admin-select-suffix">
                                        <SortAscendingOutlined style={{ color: 'var(--admin-primary)', fontSize: '16px' }} />
                                        <DownOutlined style={{ fontSize: '12px', opacity: 0.6 }} />
                                    </div>
                                }
                                variant="borderless"
                                options={sortOptions}
                            />
                        </div>
                    </div>
                </div>

                <div className="admin-table-wrapper">
                    <Table
                        columns={columns}
                        dataSource={brands}
                        rowKey="id"
                        className="beauty-table"
                        pagination={false}
                        loading={isLoading}
                        scroll={{ x: 'max-content' }}
                        onRow={(record) => ({
                            onClick: () => openModal(record),
                            className: "admin-table-row-pointer"
                        })}
                        locale={{ emptyText: <EmptyState description={t('admin_brand_not_found')} /> }}
                    />
                    {brands.length > 0 && totalPages > 1 && (
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
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                title={editingBrand ? `${t('admin_brand_edit')} ${editingBrand.name}` : t('admin_brand_add')}
                onOk={() => form.submit()}
                confirmLoading={isSubmitting}
                centered
                destroyOnHidden
                okText={t('save')}
                cancelText={t('cancel')}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit} className="admin-edit-modal-form">
                    <Form.Item name="brandName" label={t('admin_brand_name')} rules={[{ required: true, message: t('admin_error_name_required') }]}>
                        <Input placeholder={t('admin_brand_name_placeholder')} />
                    </Form.Item>
                    <Form.Item name="description" label={t('admin_label_desc')}>
                        <TextArea rows={4} placeholder={t('admin_placeholder_desc')} />
                    </Form.Item>
                    <Form.Item name="brandStatus" label={t('status')} rules={[{ required: true }]}>
                        <Select disabled={!editingBrand}>
                            <Option value="ACTIVE">{t('active')}</Option>
                            <Option value="INACTIVE">{t('inactive')}</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default BrandList;
