import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Typography, Tag, Select, Row, Col, Card, Table, Descriptions } from 'antd';
import { useLanguage } from '@/store/LanguageContext';
import { useOrderDetail, useUpdateOrderStatus } from '@/features/orders/hooks/useOrders';
import { Skeleton, PageWrapper, CButton } from '@/components/common';
import { ArrowLeftOutlined, DownloadOutlined } from '@ant-design/icons';
import { generateSlug } from '@/utils/helpers';
import OrderProgress from '@/features/orders/components/OrderProgress';
import generateInvoice from '@/utils/InvoiceService';
import './AdminOrderDetail.css';

const { Text, Title } = Typography;

export default function AdminOrderDetail() {
    const { id } = useParams();
    const { t } = useLanguage();
    const navigate = useNavigate();
    
    const { data: orderDetail, isLoading: detailLoading } = useOrderDetail(id);
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
            case 'IN_PROGRESS': return 'warning';
            case 'UNPAID': return 'processing';
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
                    <Link to={`/admin/products/${generateSlug(record.productVariantName, record.productVariantId)}`}>
                        <Text strong style={{ color: 'var(--admin-primary)', cursor: 'pointer' }}>{text}</Text>
                    </Link>
                </div>
            )
        },
        {
            title: t('price'),
            key: 'price',
            align: 'right',
            width: 180,
            render: (_, record) => (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    {record.promotionPrice < record.price ? (
                        <>
                            <Text strong style={{ color: 'var(--admin-primary)' }}>
                                {(record.promotionPrice || 0).toLocaleString('vi-VN')}đ
                            </Text>
                            <Text delete type="secondary" style={{ fontSize: '11px' }}>
                                {(record.price || 0).toLocaleString('vi-VN')}đ
                            </Text>
                        </>
                    ) : (
                        <Text>{(record.price || 0).toLocaleString('vi-VN')}đ</Text>
                    )}
                </div>
            )
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
            render: (_, record) => {
                const price = Number(record.price) || 0;
                const promotionPrice = Number(record.promotionPrice) || price;
                const quantity = Number(record.quantity) || 1;
                const effectivePrice = promotionPrice < price ? promotionPrice : price;
                return (
                    <Text strong style={{ color: '#10b981' }}>
                        {(effectivePrice * quantity).toLocaleString('vi-VN')}đ
                    </Text>
                );
            }
        }
    ];

    const subtotal = (orderDetail.items || []).reduce((sum, item) => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 1;
        return sum + (price * quantity);
    }, 0);

    const totalDiscount = (orderDetail.items || []).reduce((sum, item) => {
        const price = Number(item.price) || 0;
        const promotionPrice = Number(item.promotionPrice) || price;
        const quantity = Number(item.quantity) || 1;
        if (promotionPrice < price) {
            return sum + ((price - promotionPrice) * quantity);
        }
        return sum;
    }, 0);

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
                        <Tag color="cyan" style={{ padding: '6px 12px', fontSize: '14px', borderRadius: '8px', fontWeight: 600 }}>
                            {orderDetail.paymentMethod}
                        </Tag>
                    </div>
                </Col>
                <Col>
                    <CButton 
                        type="primary" 
                        icon={<DownloadOutlined />} 
                        onClick={() => generateInvoice(orderDetail, t)}
                    >
                        {t('invoice')}
                    </CButton>
                </Col>
            </Row>

            <OrderProgress currentStatus={orderDetail.status} />

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
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
                            <div style={{ width: '100%', maxWidth: '300px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <Text type="secondary">{t('subtotal')}</Text>
                                    <Text strong>{(subtotal).toLocaleString('vi-VN')}đ</Text> 
                                </div>
                                {totalDiscount > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                        <Text type="secondary">{t('discount')}</Text>
                                        <Text strong style={{ color: '#ef4444' }}>-{(totalDiscount).toLocaleString('vi-VN')}đ</Text> 
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <Text type="secondary">{t('shipping_fee')}</Text>
                                    <Text strong>{(orderDetail.shippingFee || 0).toLocaleString('vi-VN')}đ</Text> 
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
                                    <Text strong style={{ fontSize: '18px' }}>{t('total')}</Text>
                                    <Text strong style={{ fontSize: '26px', color: 'var(--admin-primary)' }}>
                                        {(orderDetail.total || 0).toLocaleString('vi-VN')}đ
                                    </Text>
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card title={t('order_management')} variant="outlined" className="bkeuty-admin-card shadow-card status-select-card">
                        <label className="status-control-label">{t('update_order_status')}</label>
                        <Select
                            value={orderDetail.status}
                            className={`admin-order-status-selector ${getStatusColor(orderDetail.status)}`}
                            onChange={handleStatusChange}
                            options={[
                                { value: 'UNPAID', label: t('status_unpaid') },
                                { value: 'PAID', label: t('status_paid') },
                                { value: 'IN_PROGRESS', label: t('status_in_progress') },
                                { value: 'COMPLETED', label: t('status_completed') },
                                { value: 'CANCELLED', label: t('status_cancelled') }
                            ]}
                        />
                    </Card>

                    <Card title={t('customer_info')} variant="outlined" className="bkeuty-admin-card shadow-card" style={{ marginBottom: 24 }}>
                        <Descriptions column={1} labelStyle={{ color: '#64748b', fontWeight: 500 }} contentStyle={{ fontWeight: 600 }}>
                            <Descriptions.Item label={t('username')}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <Text strong>{orderDetail.userName || t('guest')}</Text>
                                    <Text type="secondary" style={{ fontSize: '11px', fontWeight: 400 }}>ID: {orderDetail.userId || '---'}</Text>
                                </div>
                            </Descriptions.Item>
                            <Descriptions.Item label={t('order_date')}>
                                {orderDetail.orderDate ? new Date(orderDetail.orderDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '---'}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    <Card title={t('shipping_address')} variant="outlined" className="bkeuty-admin-card shadow-card">
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <div style={{ flex: 1 }}>
                                <Text style={{ color: '#334155', display: 'block', lineHeight: '1.6' }}>
                                    {orderDetail.address ? orderDetail.address.split('|')[0] : t('no_address')}
                                </Text>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
        </PageWrapper>
    );
}
