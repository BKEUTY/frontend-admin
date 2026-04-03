import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Typography, Tag, Select, Row, Col, Card, Table, Descriptions } from 'antd';
import { useLanguage } from '../../../i18n/LanguageContext';
import { useAdminOrderDetail, useUpdateOrderStatus } from '../../../hooks/useAdminOrders';
import { Skeleton, PageWrapper, CButton } from '../../../Component/Common';
import { ArrowLeftOutlined } from '@ant-design/icons';
import './AdminOrderDetail.css';

const { Text, Title } = Typography;

export default function AdminOrderDetail() {
    const { id } = useParams();
    const { t } = useLanguage();
    const navigate = useNavigate();
    
    const { data: orderDetail, isLoading: detailLoading } = useAdminOrderDetail(id);
    const { mutateAsync: updateOrderStatus } = useUpdateOrderStatus();

    const handleStatusChange = async (value) => {
        try {
            await updateOrderStatus({ id: id, status: value });
        } catch (error) {}
    };

    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'PAID':
            case 'COMPLETED': return 'success';
            case 'UNPAID':
            case 'PENDING': return 'warning';
            case 'CANCELLED': return 'error';
            default: return 'default';
        }
    };

    if (detailLoading || !orderDetail) {
        return (
            <PageWrapper noCard>
                <Skeleton width="30%" height="20px" className="admin-mb15" />
                <Skeleton width="100%" height="200px" className="admin-mb30" />
                <Skeleton width="100%" height="300px" />
            </PageWrapper>
        );
    }

    const columns = [
        {
            title: t('product'),
            dataIndex: 'productVariantName',
            key: 'productVariantName',
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img 
                        src={record.productVariantImage || 'https://via.placeholder.com/50'} 
                        alt="product" 
                        style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '8px', border: '1px solid #eee' }} 
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/50'; }}
                    />
                    <Text strong>{text}</Text>
                </div>
            )
        },
        {
            title: t('price'),
            dataIndex: 'price',
            key: 'price',
            align: 'right',
            width: 150,
            render: (price) => <Text>{(price || 0).toLocaleString('vi-VN')}đ</Text>
        },
        {
            title: t('quantity'),
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'center',
            width: 100,
            render: (quantity) => <Text>{quantity}</Text>
        },
        {
            title: t('total'),
            key: 'subtotal',
            align: 'right',
            width: 150,
            render: (_, record) => (
                <Text strong style={{ color: '#10b981' }}>
                    {((record.price || 0) * (record.quantity || 1)).toLocaleString('vi-VN')}đ
                </Text>
            )
        }
    ];

    return (
        <PageWrapper noCard>
            <div className="admin-pd-breadcrumb">
                <Link to="/admin/orders">{t('admin_home_orders_title')}</Link>
                <span className="admin-pd-divider">/</span>
                <span className="admin-pd-current">Order #{id}</span>
            </div>

            <Row justify="space-between" align="middle" className="admin-mb30">
                <Col>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <CButton type="outline" icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/orders')} />
                        <Title level={4} style={{ margin: 0, color: 'var(--admin-text-main)' }}>{t('order_detail')} #{orderDetail.id || id}</Title>
                        <Tag color="cyan" style={{ padding: '4px 12px', fontSize: '14px', borderRadius: '6px' }}>{orderDetail.paymentMethod}</Tag>
                    </div>
                </Col>
                <Col>
                    <Select
                        value={orderDetail.status}
                        style={{ width: 140 }}
                        onChange={handleStatusChange}
                        options={[
                            { value: 'PENDING', label: t('status_pending') },
                            { value: 'UNPAID', label: t('status_unpaid') },
                            { value: 'PAID', label: t('status_paid') },
                            { value: 'COMPLETED', label: t('status_completed') },
                            { value: 'CANCELLED', label: t('status_cancelled') }
                        ]}
                        className={`status-select ${getStatusColor(orderDetail.status)}`}
                    />
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                    <Card title={t('order_items')} variant="outlined" className="bkeuty-admin-card shadow-card">
                        <Table 
                            columns={columns} 
                            dataSource={orderDetail.items || []} 
                            pagination={false}
                            rowKey={(record, idx) => record.productVariantId || idx}
                            scroll={{ x: 'max-content' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                            <div style={{ width: '300px' }}>
                                <Row justify="space-between" style={{ marginBottom: 12 }}>
                                    <Text type="secondary">{t('shipping_fee')}</Text>
                                    <Text>0đ</Text> 
                                </Row>
                                <Row justify="space-between" align="middle">
                                    <Text strong style={{ fontSize: '16px' }}>{t('total')}</Text>
                                    <Text strong style={{ fontSize: '24px', color: 'var(--admin-primary)' }}>
                                        {(orderDetail.total || 0).toLocaleString('vi-VN')}đ
                                    </Text>
                                </Row>
                            </div>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card title={t('customer_info')} variant="outlined" className="bkeuty-admin-card shadow-card" style={{ marginBottom: 24 }}>
                        <Descriptions column={1} labelStyle={{ color: '#6b7280' }}>
                            <Descriptions.Item label={t('username')}>
                                <Text strong>{orderDetail.userId}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label={t('order_date')}>
                                {orderDetail.orderDate ? new Date(orderDetail.orderDate).toLocaleDateString('vi-VN') : '---'}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    <Card title={t('shipping_address')} variant="outlined" className="bkeuty-admin-card shadow-card">
                        <Text style={{ color: '#334155' }}>{orderDetail.address}</Text>
                    </Card>
                </Col>
            </Row>
        </PageWrapper>
    );
}
