import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, notification, Typography, Tag, Space, Modal, Select, Tooltip, Row, Col, Divider, Spin } from 'antd';
import { SyncOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons';
import adminApi from '../../../api/adminApi';
import { getImageUrl } from '../../../api/axiosClient';
import { useLanguage } from '../../../i18n/LanguageContext';
import { useAuth } from '../../../Context/AuthContext';
import { EmptyState, PageWrapper, CButton } from '../../Common';
import Pagination from '../../Common/Pagination';
import './OrderList.css';

import dummyImg from '../../../Assets/Images/Products/product_dummy_5.svg';

const { Text, Title } = Typography;
const { Option } = Select;

const OrderList = () => {
    const { t } = useLanguage();
    const { isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const pageSize = 10;
    
    const [actionModalVisible, setActionModalVisible] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [newStatus, setNewStatus] = useState('');

    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [orderDetail, setOrderDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const fetchOrders = useCallback(async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const response = await adminApi.getAllOrders(currentPage, pageSize);
            setData(response.data?.content || []);
            setTotalPages(response.data?.totalPages || 0);
            setTotalItems(response.data?.totalElements || 0);
        } catch (error) {
            if (!error?.isGlobalHandled) {
                notification.error({
                    key: 'fetch_orders_error',
                    message: t('error'),
                    description: t('api_error_fetch')
                });
            }
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, isAuthenticated, t]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchOrders();
        }
    }, [fetchOrders, isAuthenticated]);

    const handleTableChange = () => {
        setCurrentPage(0);
    };

    const handleUpdateStatus = async () => {
        if (!selectedRecord || !newStatus) return;
        setLoading(true);
        try {
            await adminApi.updateOrderStatus(selectedRecord.id, newStatus);
            notification.success({ 
                key: 'update_order_status',
                message: t('success'), 
                description: t('update_info_success') 
            });
            setActionModalVisible(false);
            fetchOrders();
        } catch (error) {
            if (!error?.isGlobalHandled) {
                notification.error({ 
                    key: 'update_order_status',
                    message: t('error'), 
                    description: t('api_error_general') 
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (record) => {
        setSelectedRecord(record);
        setNewStatus(record.status);
        setActionModalVisible(true);
    };

    const handleViewDetail = async (orderId) => {
        setViewModalVisible(true);
        setDetailLoading(true);
        try {
            const response = await adminApi.getOrderById(orderId);
            setOrderDetail(response.data);
        } catch (error) {
            notification.error({
                message: t('error'),
                description: t('api_error_fetch')
            });
            setViewModalVisible(false);
        } finally {
            setDetailLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'PAID':
            case 'COMPLETED': return 'green';
            case 'UNPAID':
            case 'PENDING': return 'gold';
            case 'CANCELLED': return 'red';
            default: return 'blue';
        }
    };

    const itemColumns = [
        {
            title: t('product'),
            key: 'product',
            render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="admin-detail-image">
                        <img 
                            src={record.productVariantImage ? getImageUrl(record.productVariantImage) : dummyImg} 
                            alt={record.productVariantName} 
                            onError={(e) => { e.target.src = dummyImg }}
                        />
                    </div>
                    <Text strong>{record.productVariantName}</Text>
                </div>
            )
        },
        {
            title: t('quantity'),
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'center',
            width: 100,
            render: (qty) => <Tag>{qty}</Tag>
        },
        {
            title: t('price'),
            dataIndex: 'price',
            key: 'price',
            align: 'right',
            width: 150,
            render: (price) => <Text>{price?.toLocaleString("vi-VN")}đ</Text>
        },
        {
            title: t('admin_total'),
            key: 'total',
            align: 'right',
            width: 150,
            render: (_, record) => <Text strong className="admin-order-total">{(record.price * record.quantity)?.toLocaleString("vi-VN")}đ</Text>
        }
    ];

    const columns = [
        {
            title: t('admin_order_id'),
            dataIndex: 'id',
            key: 'id',
            width: 100,
            align: 'center',
            render: (id) => <span className="admin-table-id">#DH{id}</span>
        },
        {
            title: t('admin_customer'),
            dataIndex: 'userId',
            key: 'customer',
            width: 200,
            render: (userId) => <Text strong>{userId || t('guest')}</Text>
        },
        {
            title: t('admin_date'),
            dataIndex: 'orderDate',
            key: 'date',
            width: 150,
            render: (date) => <Text>{date ? new Date(date).toLocaleDateString('vi-VN') : '--'}</Text>
        },
        {
            title: t('payment_method'),
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            width: 150,
            render: (method) => <Tag color={method === 'Banking' ? 'blue' : 'default'}>{method}</Tag>
        },
        {
            title: t('admin_total'),
            dataIndex: 'total',
            key: 'total',
            width: 150,
            align: 'right',
            render: (total) => <Text strong className="admin-order-total">{total?.toLocaleString("vi-VN")}đ</Text>
        },
        {
            title: t('status'),
            dataIndex: 'status',
            key: 'status',
            width: 120,
            align: 'center',
            render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>
        },
        {
            title: t('admin_product_action'),
            key: 'action',
            width: 120,
            align: 'center',
            fixed: 'right',
            responsive: ['md'],
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title={t('view')}>
                        <Button
                            type="text"
                            className="admin-action-btn view-btn"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetail(record.id)}
                        />
                    </Tooltip>
                    <Tooltip title={t('edit')}>
                        <Button
                            type="text"
                            className="admin-action-btn edit-btn"
                            icon={<EditOutlined />}
                            onClick={() => openEditModal(record)}
                        />
                    </Tooltip>
                </Space>
            )
        },
    ];

    return (
        <div className="admin-order-list-container">
            <PageWrapper
                title={t('admin_orders')}
                subtitle={
                    <>
                        {t('total')} • <Text strong className="admin-subtitle-count">{totalItems}</Text> {t('orders')}
                    </>
                }
                extra={
                    <CButton
                        type="secondary"
                        icon={<SyncOutlined />}
                        onClick={() => {
                            setCurrentPage(0);
                            fetchOrders();
                        }}
                        loading={loading}
                    >
                        {t('refresh')}
                    </CButton>
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
                        onChange={handleTableChange}
                        scroll={{ x: 'max-content' }}
                        locale={{ emptyText: <EmptyState description={t('no_data')} /> }}
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
                title={`${t('edit')} - #DH${selectedRecord?.id}`}
                centered
                width={400}
                footer={[
                    <Button key="cancel" onClick={() => setActionModalVisible(false)}>
                        {t('cancel')}
                    </Button>,
                    <Button key="submit" type="primary" loading={loading} onClick={handleUpdateStatus} className="admin-save-btn">
                        {t('save')}
                    </Button>
                ]}
            >
                <div className="admin-order-modal-content">
                    <div className="admin-form-group">
                        <label>{t('status')}</label>
                        <Select
                            value={newStatus}
                            onChange={setNewStatus}
                            className="admin-status-select"
                        >
                            <Option value="UNPAID">{t('status_unpaid')}</Option>
                            <Option value="PAID">{t('status_paid')}</Option>
                            <Option value="PENDING">{t('status_pending')}</Option>
                            <Option value="COMPLETED">{t('status_completed')}</Option>
                            <Option value="CANCELLED">{t('status_cancelled')}</Option>
                        </Select>
                    </div>
                </div>
            </Modal>

            <Modal
                open={viewModalVisible}
                onCancel={() => setViewModalVisible(false)}
                title={t('order_detail')}
                centered
                width={800}
                footer={[
                    <Button key="close" type="primary" onClick={() => setViewModalVisible(false)} className="admin-save-btn">
                        {t('close')}
                    </Button>
                ]}
                className="admin-detail-modal"
            >
                <Spin spinning={detailLoading}>
                    {orderDetail && (
                        <div className="admin-order-detail-content">
                            <Row gutter={[24, 24]}>
                                <Col xs={24} md={12}>
                                    <div className="detail-card">
                                        <Title level={5}>{t('order_info')}</Title>
                                        <div className="detail-row">
                                            <Text type="secondary">{t('admin_order_id')}:</Text>
                                            <span className="admin-table-id">#DH{orderDetail.id}</span>
                                        </div>
                                        <div className="detail-row">
                                            <Text type="secondary">{t('admin_date')}:</Text>
                                            <Text strong>{new Date(orderDetail.orderDate).toLocaleDateString('vi-VN')}</Text>
                                        </div>
                                        <div className="detail-row">
                                            <Text type="secondary">{t('status')}:</Text>
                                            <Tag color={getStatusColor(orderDetail.status)}>{orderDetail.status}</Tag>
                                        </div>
                                    </div>
                                </Col>
                                <Col xs={24} md={12}>
                                    <div className="detail-card">
                                        <Title level={5}>{t('customer_info')}</Title>
                                        <div className="detail-row">
                                            <Text type="secondary">{t('admin_customer')}:</Text>
                                            <Text strong>{orderDetail.userId}</Text>
                                        </div>
                                        <div className="detail-row">
                                            <Text type="secondary">{t('payment_method')}:</Text>
                                            <Tag color={orderDetail.paymentMethod === 'Banking' ? 'blue' : 'default'}>{orderDetail.paymentMethod}</Tag>
                                        </div>
                                        <div className="detail-row">
                                            <Text type="secondary">{t('address')}:</Text>
                                            <Text>{orderDetail.address}</Text>
                                        </div>
                                    </div>
                                </Col>
                            </Row>

                            <Divider orientation="left" style={{ margin: '24px 0 16px 0' }}>{t('products')}</Divider>
                            
                            <div className="admin-detail-table-wrap">
                                <Table 
                                    columns={itemColumns} 
                                    dataSource={orderDetail.items} 
                                    pagination={false}
                                    rowKey="productVariantId"
                                    className="beauty-table mini-table"
                                />
                            </div>

                            <div className="admin-detail-summary">
                                <div>
                                    <Text type="secondary">{t('admin_total')}: </Text>
                                    <Text className="summary-total">{orderDetail.total?.toLocaleString("vi-VN")}đ</Text>
                                </div>
                            </div>
                        </div>
                    )}
                </Spin>
            </Modal>
        </div>
    );
};

export default OrderList;
