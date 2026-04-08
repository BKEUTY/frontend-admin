import React, { useState, useEffect } from 'react';
import { Table, Button, Tooltip, Space, Modal, Input, Form } from 'antd';
import { PlusOutlined, SyncOutlined, FormOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useLanguage } from '../../../i18n/LanguageContext';
import { EmptyState, PageWrapper, CButton, Pagination } from '../../../Component/Common';
import { useAdminCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../../../hooks/useAdminCategories';
import { useAuth } from '../../../Context/AuthContext';
import { useQueryParams } from '../../../hooks/useQueryParams';
import { useDebounce } from '../../../hooks/useDebounce';
import '../../../Component/Admin/Common/List.css';

const { Search } = Input;
const { confirm } = Modal;

const CategoryList = () => {
    const { t } = useLanguage();
    const { isAuthenticated } = useAuth();
    const [form] = Form.useForm();
    const [query, setQuery] = useQueryParams();

    const searchTerm = query.search || '';
    const currentPage = query.page ? Number(query.page) - 1 : 0;
    const pageSize = 10;

    const [searchInput, setSearchInput] = useState(searchTerm);
    const debouncedSearch = useDebounce(searchInput, 500);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const { categories, totalPages, totalItems, isLoading, refetchCategories } = useAdminCategories(
        { page: currentPage, size: pageSize, search: searchTerm },
        { enabled: isAuthenticated }
    );
    const { mutateAsync: createCategory, isPending: isCreating } = useCreateCategory();
    const { mutateAsync: updateCategory, isPending: isUpdating } = useUpdateCategory();
    const { mutateAsync: deleteCategory, isPending: isDeleting } = useDeleteCategory();

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
        refetchCategories();
    };

    const openModal = (category = null) => {
        setEditingCategory(category);
        if (category) {
            form.setFieldsValue({ name: category.categoryName });
        } else {
            form.resetFields();
        }
        setIsModalVisible(true);
    };

    const handleSubmit = async (values) => {
        const payload = { categoryName: values.name };

        try {
            if (editingCategory) {
                await updateCategory({ id: editingCategory.id, data: payload });
            } else {
                await createCategory(payload);
            }
            setIsModalVisible(false);
            refetchCategories();
        } catch (error) {}
    };

    const handleDelete = (category) => {
        confirm({
            title: `${t('confirm_delete_title')} ${category.categoryName}`,
            icon: <ExclamationCircleOutlined />,
            content: t('confirm_delete_message'),
            okText: t('delete'),
            okType: 'danger',
            cancelText: t('cancel'),
            onOk: async () => {
                await deleteCategory(category.id);
                refetchCategories();
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
            title: t('admin_category_name'),
            dataIndex: 'categoryName',
            key: 'categoryName',
            render: (name) => <span className="admin-table-product-name">{name}</span>
        },
        {
            title: t('actions_col'),
            key: 'action',
            width: 120,
            align: 'center',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title={t('edit')}>
                        <Button type="text" className="admin-action-btn edit-btn" icon={<FormOutlined />} onClick={() => openModal(record)} />
                    </Tooltip>
                    <Tooltip title={t('delete')}>
                        <Button type="text" className="admin-action-btn delete-btn" icon={<DeleteOutlined />} loading={isDeleting} onClick={() => handleDelete(record)} />
                    </Tooltip>
                </Space>
            )
        },
    ];

    return (
        <div className="admin-list-container">
            <PageWrapper
                title={t('admin_home_categories_title')}
                subtitle={<>{t('total')} • <strong className="admin-subtitle-count">{totalItems}</strong> {t('categories').toLowerCase()}</>}
                extra={
                    <div className="admin-header-buttons">
                        <CButton type="secondary" icon={<SyncOutlined />} onClick={handleRefresh} loading={isLoading}>
                            {t('refresh')}
                        </CButton>
                        <CButton type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
                            {t('admin_category_add')}
                        </CButton>
                    </div>
                }
            >
                <div className="admin-filter-bar">
                    <Search
                        placeholder={t('admin_category_search')}
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
                        dataSource={categories}
                        rowKey="id"
                        className="beauty-table"
                        pagination={false}
                        loading={isLoading}
                        scroll={{ x: 'max-content' }}
                        locale={{ emptyText: <EmptyState description={t('admin_category_not_found')} /> }}
                    />
                    {categories.length > 0 && totalPages > 1 && (
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

            <Modal
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                title={editingCategory ? `${t('admin_category_edit')} ${editingCategory.categoryName}` : t('admin_category_add')}
                onOk={() => form.submit()}
                confirmLoading={isSubmitting}
                centered
                destroyOnHidden
                okText={t('save')}
                cancelText={t('cancel')}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit} className="admin-edit-modal-form">
                    <Form.Item name="name" label={t('admin_category_name')} rules={[{ required: true, message: t('admin_error_name_required') }]}>
                        <Input placeholder={t('admin_category_name_placeholder')} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CategoryList;
