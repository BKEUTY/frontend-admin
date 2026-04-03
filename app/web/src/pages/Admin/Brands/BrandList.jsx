import React, { useState, useMemo } from 'react';
import { Table, Button, Typography, Tooltip, Space, Modal, Input, Form, Upload, Select, Tag } from 'antd';
import { PlusOutlined, SyncOutlined, FormOutlined, DeleteOutlined, ExclamationCircleOutlined, CloudUploadOutlined } from '@ant-design/icons';
import { useLanguage } from '../../../i18n/LanguageContext';
import { EmptyState, PageWrapper, CButton, Pagination } from '../../../Component/Common';
import { getImageUrl } from '../../../api/axiosClient';
import { useAdminBrands, useCreateBrand, useUpdateBrand, useDeleteBrand } from '../../../hooks/useAdminBrands';
import { useAuth } from '../../../Context/AuthContext';
import '../../../Component/Admin/Common/List.css';

const { Text } = Typography;
const { Search, TextArea } = Input;
const { confirm } = Modal;
const { Option } = Select;

const BrandList = () => {
    const { t } = useLanguage();
    const { isAuthenticated } = useAuth();
    const [form] = Form.useForm();
    const [inputValue, setInputValue] = useState('');
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingBrand, setEditingBrand] = useState(null);
    const pageSize = 10;

    const { brands, totalPages, totalItems, isLoading, refetchBrands } = useAdminBrands(
        { page: currentPage, size: pageSize },
        { enabled: isAuthenticated }
    );
    const { mutateAsync: createBrand, isPending: isCreating } = useCreateBrand();
    const { mutateAsync: updateBrand, isPending: isUpdating } = useUpdateBrand();
    const { mutateAsync: deleteBrand, isPending: isDeleting } = useDeleteBrand();

    const filteredBrands = useMemo(() => {
        return brands.filter(b => (b.name || '').toLowerCase().includes(searchText.toLowerCase()));
    }, [brands, searchText]);

    const handleSearch = (value) => {
        setSearchText(value);
        setCurrentPage(0);
    };

    const handleRefresh = () => {
        setInputValue('');
        setSearchText('');
        setCurrentPage(0);
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
        } catch (error) {
        }
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
                         : <div style={{background: '#f1f5f9', width: '100%', height: '100%'}}></div>}
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
                <Tag color={status === 'ACTIVE' ? 'processing' : 'error'} style={{ margin: 0, fontSize: '10px', lineHeight: '16px' }}>
                    {status === 'ACTIVE' ? t('active') : t('inactive')}
                </Tag>
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
                title={t('admin_home_brands_title')}
                subtitle={<>{t('total')} • <Text strong className="admin-subtitle-count">{totalItems}</Text> {t('brands').toLowerCase()}</>}
                extra={
                    <div className="admin-header-buttons">
                        <CButton type="secondary" icon={<SyncOutlined />} onClick={handleRefresh} loading={isLoading}>
                            {t('refresh')}
                        </CButton>
                        <CButton type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
                            {t('admin_brand_add')}
                        </CButton>
                    </div>
                }
            >
                <div className="admin-filter-bar">
                    <Search
                        placeholder={t('admin_brand_search')}
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
                        dataSource={filteredBrands}
                        rowKey="id"
                        className="beauty-table"
                        pagination={false}
                        loading={isLoading}
                        scroll={{ x: 'max-content' }}
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
                                    setCurrentPage(page); 
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
                    <Form.Item label={t('admin_brand_logo')} name="image">
                        <Upload.Dragger maxCount={1} beforeUpload={() => false}>
                            <p className="ant-upload-drag-icon"><CloudUploadOutlined /></p>
                            <p className="ant-upload-text">{t('admin_upload_hint')}</p>
                        </Upload.Dragger>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default BrandList;
