import { CButton, PageWrapper, Skeleton } from '@/components/common';
import OrderProgress from '@/features/orders/components/OrderProgress';
import { useOrderDetail, useUpdateOrderStatus } from '@/features/orders/hooks/useOrders';
import { useLanguage } from '@/store/LanguageContext';
import { generateSlug } from '@/utils/helpers';
import generateInvoice from '@/utils/InvoiceService';
import { ArrowLeftOutlined, DownloadOutlined } from '@ant-design/icons';
import { Card, Col, Descriptions, Row, Select, Table, Tag, Typography } from 'antd';
import { Link, useNavigate, useParams } from 'react-router-dom';
import './AdminOrderDetail.css';

const { Text, Title } = Typography;

export default function AdminOrderDetail() {
    const { id } = useParams();
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const locale = language === 'vi' ? 'vi-VN' : 'en-US';

    const { data: orderDetail, isLoading: detailLoading } = useOrderDetail(id);
    const { mutateAsync: updateOrderStatus } = useUpdateOrderStatus();

    const handleStatusChange = async (value) => {
        try {
            await updateOrderStatus({ id: id, status: value });
        } catch (error) {}
    };

    const getStatusColor = (order) => {
        const orderS = order.status?.toUpperCase();
        const payS = order.paymentStatus?.toUpperCase();
        const payM = order.paymentMethod?.toUpperCase();

        if (orderS === 'SUCCEEDED') return 'success';
        if (orderS === 'CANCELLED') return 'error';
        if (payM === 'BANK' && payS === 'UNPAID') return 'warning';
        if (orderS === 'CONFIRMED') return 'info';
        return 'default';
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
            title: t('invoice_product'),
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
                    <Link to={`/admin/products/${generateSlug(record.productVariantName, record.productVariantId)}`} state={{ productId: record.productVariantId }}>
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
            render: (_, record) => {
                const price = Number(record.price) || 0;
                const promotionPrice = Number(record.promotionPrice) || price;
                const showDiscount = promotionPrice < price && promotionPrice > 0;
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        {showDiscount ? (
                            <>
                                <Text strong style={{ color: 'var(--admin-primary)' }}>
                                    {promotionPrice.toLocaleString(locale)}{t('admin_unit_vnd')}
                                </Text>
                                <Text delete type="secondary" style={{ fontSize: '11px' }}>
                                    {price.toLocaleString(locale)}{t('admin_unit_vnd')}
                                </Text>
                            </>
                        ) : (
                            <Text>{price.toLocaleString(locale)}{t('admin_unit_vnd')}</Text>
                        )}
                    </div>
                );
            }
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
            key: 'itemTotal',
            align: 'right',
            width: 150,
            render: (_, record) => {
                const price = Number(record.price) || 0;
                const promotionPrice = (record.promotionPrice !== null && record.promotionPrice !== undefined) ? Number(record.promotionPrice) : price;
                const effectivePrice = (promotionPrice > 0 && promotionPrice < price) ? promotionPrice : price;
                const quantity = Number(record.quantity) || 1;
                return (
                    <Text strong style={{ color: '#10b981' }}>
                        {(effectivePrice * quantity).toLocaleString(locale)}{t('admin_unit_vnd')}
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
        const hasPromotion = item.promotionPrice !== null && item.promotionPrice !== undefined;
        const promotionPrice = hasPromotion ? Number(item.promotionPrice) : price;
        const quantity = Number(item.quantity) || 1;
        if (hasPromotion && promotionPrice < price) {
            return sum + ((price - promotionPrice) * quantity);
        }
        return sum;
    }, 0);

    const grandTotal = (Number(orderDetail.total) || 0) + (Number(orderDetail.shippingFee) || 0);

    return (
        <PageWrapper noCard>
            <div className="admin-pd-breadcrumb">
                <Link to="/admin/orders">{t('admin_home_orders_title')}</Link>
                <span className="admin-pd-divider">/</span>
                <span className="admin-pd-current">{t('invoice_order')} #{id}</span>
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
                        onClick={() => generateInvoice(orderDetail, t, language)}
                    >
                        {t('download_invoice')}
                    </CButton>
                </Col>
            </Row>

            <OrderProgress 
                currentStatus={orderDetail.status} 
                shippingStatus={orderDetail.shippingStatus}
                paymentMethod={orderDetail.paymentMethod}
                paymentStatus={orderDetail.paymentStatus}
            />

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
                                    <Text strong>{(subtotal).toLocaleString(locale)}{t('admin_unit_vnd')}</Text>
                                </div>
                                {totalDiscount > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                        <Text type="secondary">{t('discount')}</Text>
                                        <Text strong style={{ color: '#ef4444' }}>-{(totalDiscount).toLocaleString(locale)}{t('admin_unit_vnd')}</Text>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <Text type="secondary">{t('shipping_fee')}</Text>
                                    <Text strong>{(orderDetail.shippingFee || 0).toLocaleString(locale)}{t('admin_unit_vnd')}</Text>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
                                    <Text strong style={{ fontSize: '18px' }}>{t('grand_total')}</Text>
                                    <Text strong style={{ fontSize: '26px', color: 'var(--admin-primary)' }}>
                                        {grandTotal.toLocaleString(locale)}{t('admin_unit_vnd')}
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
                            className={`admin-order-status-selector ${getStatusColor(orderDetail)}`}
                            onChange={handleStatusChange}
                            options={[
                                { 
                                    value: 'NOT_CONFIRMED', 
                                    label: t('status_order_received')
                                },
                                { 
                                    value: 'CONFIRMED', 
                                    label: (orderDetail.paymentMethod?.toUpperCase() === 'BANK' && orderDetail.paymentStatus?.toUpperCase() === 'UNPAID')
                                        ? `${t('status_shipping')} (${t('status_awaiting_payment')})`
                                        : t('status_shipping')
                                },
                                { value: 'SUCCEEDED', label: t('order_status_SUCCEEDED') },
                                { value: 'CANCELLED', label: t('order_status_CANCELLED') }
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
