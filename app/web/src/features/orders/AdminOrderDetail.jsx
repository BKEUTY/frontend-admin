import { CButton, PageWrapper, Skeleton } from '@/components/common';
import MembershipTag from '@/components/admin/MembershipTag';
import OrderProgress from '@/features/orders/components/OrderProgress';
import { useOrderDetail, useUpdateOrderStatus } from '@/features/orders/hooks/useOrders';
import { useLanguage } from '@/store/LanguageContext';
import { generateSlug } from '@/utils/helpers';
import generateInvoice from '@/utils/InvoiceService';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Card, Col, Descriptions, Row, Select, Table, Tag, Typography } from 'antd';
import { FaCalendarAlt, FaDownload, FaStickyNote, FaTruck, FaUser, FaCreditCard, FaMapMarkedAlt } from 'react-icons/fa';
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
            let paymentStatus = null;
            let orderStatus = value;

            if (orderDetail?.paymentMethod?.toUpperCase() === 'BANK') {
                if (value === 'NOT_CONFIRMED') {
                    paymentStatus = 'UNPAID';
                    orderStatus = 'NOT_CONFIRMED';
                } else if (value === 'CONFIRMED_UNPAID') {
                    orderStatus = 'CONFIRMED';
                    paymentStatus = 'UNPAID';
                } else if (value === 'CONFIRMED_PAID') {
                    orderStatus = 'CONFIRMED';
                    paymentStatus = 'PAID';
                } else if (value === 'SUCCEEDED') {
                    paymentStatus = 'PAID';
                    orderStatus = 'SUCCEEDED';
                }
            } else { // COD
                if (value === 'NOT_CONFIRMED') {
                    paymentStatus = 'UNPAID';
                    orderStatus = 'NOT_CONFIRMED';
                } else if(value === 'CONFIRMED') {
                    paymentStatus = 'UNPAID';
                    orderStatus = 'CONFIRMED';
                } else if (value === 'SUCCEEDED') {
                    paymentStatus = 'PAID';
                }
            }
            await updateOrderStatus({ id: id, status: orderStatus, paymentStatus });
        } catch (error) {}
    };

    const getCurrentDropdownValue = () => {
        const os = orderDetail?.status?.toUpperCase();
        const ps = orderDetail?.paymentStatus?.toUpperCase();
        const isBank = orderDetail?.paymentMethod?.toUpperCase() === 'BANK';
        
        if (isBank && os === 'CONFIRMED') {
            return ps === 'PAID' ? 'CONFIRMED_PAID' : 'CONFIRMED_UNPAID';
        }
        return os;
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
            title: t('admin_product_name'),
            dataIndex: 'productVariantName',
            key: 'productVariantName',
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                        src={record.productVariantImage}
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
            width: 200,
            render: (_, record) => {
                const isPromo = record.promotionPrice && record.promotionPrice < record.price;
                const effectivePrice = isPromo ? record.promotionPrice : record.price;
                const voucherPerUnit = record.voucherDiscountAmount ? Math.round(record.voucherDiscountAmount / record.quantity) : 0;
                const finalUnitPrice = Math.max(effectivePrice - voucherPerUnit, 0);
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', width: '100%' }}>
                        {isPromo && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                <Text type="secondary" style={{ fontSize: '11px' }}>{t('original_price')}:</Text>
                                <Text delete type="secondary" style={{ fontSize: '11px' }}>
                                    {record.price.toLocaleString(locale)}{t('admin_unit_vnd')}
                                </Text>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <Text type="secondary" style={{ fontSize: '11px' }}>{isPromo ? t('promo_price') : t('price')}:</Text>
                            <Text style={{ fontSize: voucherPerUnit > 0 ? '11px' : '12px', color: voucherPerUnit > 0 ? '#94a3b8' : 'inherit', textDecoration: voucherPerUnit > 0 ? 'line-through' : 'none' }}>
                                {effectivePrice.toLocaleString(locale)}{t('admin_unit_vnd')}
                            </Text>
                        </div>
                        {voucherPerUnit > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                <Text type="secondary" style={{ fontSize: '11px' }}>{t('voucher')}:</Text>
                                <Text style={{ fontSize: '11px', fontWeight: 600, color: '#059669', background: '#ecfdf5', padding: '1px 4px', borderRadius: '4px' }}>
                                    -{voucherPerUnit.toLocaleString(locale)}{t('admin_unit_vnd')}
                                </Text>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', borderTop: '1px dashed #e2e8f0', paddingTop: '2px' }}>
                            <Text strong style={{ fontSize: '12px' }}>{t('final_price')}:</Text>
                            <Text strong style={{ color: 'var(--admin-primary)', fontSize: '12px' }}>
                                {finalUnitPrice.toLocaleString(locale)}{t('admin_unit_vnd')}
                            </Text>
                        </div>
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
                const isPromo = record.promotionPrice && record.promotionPrice < record.price;
                const effectivePrice = isPromo ? record.promotionPrice : record.price;
                const lineTotal = Math.max((effectivePrice * record.quantity) - record.voucherDiscountAmount, 0);
                return (
                    <Text strong style={{ color: '#10b981' }}>
                        {lineTotal.toLocaleString(locale)}{t('admin_unit_vnd')}
                    </Text>
                );
            }
        }
    ];

    const subtotal = (orderDetail.items || []).reduce((sum, item) => {
        const price = Number(item.price || 0);
        const promoPrice = (item.promotionPrice != null && Number(item.promotionPrice) < price) ? Number(item.promotionPrice) : price;
        return sum + (promoPrice * Number(item.quantity || 1));
    }, 0);

    const voucherDiscount = Number(orderDetail.voucherDiscountAmount) || 
                            (orderDetail.items || []).reduce((sum, item) => sum + Number(item.voucherDiscountAmount || 0), 0);
    const shippingFee = Number(orderDetail.shippingFee || 0);
    const grandTotal = subtotal - voucherDiscount + shippingFee;

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
                        <Title level={4} style={{ margin: 0, color: 'var(--admin-text-main)' }}>{t('order_detail')} #{orderDetail.orderId || id}</Title>
                        <Tag color="cyan" style={{ padding: '6px 12px', fontSize: '14px', borderRadius: '8px', fontWeight: 600 }}>
                            {orderDetail.paymentMethod}
                        </Tag>
                    </div>
                </Col>
                <Col>
                    <button
                        className="admin-btn-download"
                        onClick={() => generateInvoice(orderDetail, t, language)}
                        title={t('download_invoice')}
                    >
                        <FaDownload /> {t('invoice')}
                    </button>
                </Col>
            </Row>

            <OrderProgress 
                currentStatus={orderDetail.status} 
                shippingStatus={orderDetail.shippingStatus}
                paymentMethod={orderDetail.paymentMethod}
                paymentStatus={orderDetail.paymentStatus}
                orderDate={orderDetail.orderDate}
                estShippingDate={orderDetail.estShippingDate}
            />

            <div className="admin-info-banner">
                <div className="admin-banner-item">
                    <span className="admin-banner-label">{t('order_date')}</span>
                    <strong className="admin-banner-value">
                        {orderDetail.orderDate ? new Date(orderDetail.orderDate).toLocaleDateString('vi-VN') : '---'}
                    </strong>
                </div>
                {orderDetail.estShippingDate && (
                    <div className="admin-banner-item">
                        <span className="admin-banner-label">{t('est_shipping_date')}</span>
                        <strong className="admin-banner-value">
                            {new Date(orderDetail.estShippingDate).toLocaleDateString('vi-VN')}
                        </strong>
                    </div>
                )}
            </div>

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
                        <div className="admin-order-summary-container">
                            <div className="admin-order-summary-box">
                                <div className="admin-summary-row">
                                    <Text type="secondary">{t('subtotal')}</Text>
                                    <Text strong>{subtotal.toLocaleString(locale)}{t('admin_unit_vnd')}</Text>
                                </div>
                                {voucherDiscount > 0 && (
                                    <div className="admin-summary-row">
                                        <Text type="secondary">{t('voucher_discount')}</Text>
                                        <Text strong className="voucher-discount-text">-{voucherDiscount.toLocaleString(locale)}{t('admin_unit_vnd')}</Text>
                                    </div>
                                )}
                                <div className="admin-summary-row">
                                    <Text type="secondary">{t('shipping_fee')}</Text>
                                    <Text strong>{shippingFee.toLocaleString(locale)}{t('admin_unit_vnd')}</Text>
                                </div>
                                <div className="admin-summary-row admin-summary-total">
                                    <Text strong className="total-label">{t('grand_total')}</Text>
                                    <Text strong className="total-value">
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
                            value={getCurrentDropdownValue()}
                            className={`admin-order-status-selector ${getStatusColor(orderDetail)}`}
                            onChange={handleStatusChange}
                            options={
                                orderDetail?.paymentMethod?.toUpperCase() === 'BANK' ? [
                                    { value: 'NOT_CONFIRMED', label: t('status_order_received') },
                                    { value: 'CONFIRMED_UNPAID', label: `${t('status_awaiting_payment')}` },
                                    { value: 'CONFIRMED_PAID', label: `${t('status_shipping')} - ${t('payment_status_PAID')}` },
                                    { value: 'SUCCEEDED', label: t('order_status_SUCCEEDED') },
                                    { value: 'CANCELLED', label: t('order_status_CANCELLED') }
                                ] : [
                                    { value: 'NOT_CONFIRMED', label: t('status_order_received') },
                                    { value: 'CONFIRMED', label: t('status_shipping') },
                                    { value: 'SUCCEEDED', label: t('order_status_SUCCEEDED') },
                                    { value: 'CANCELLED', label: t('order_status_CANCELLED') }
                                ]
                            }
                        />
                    </Card>

                    <div className="admin-info-card" style={{ marginBottom: 24 }}>
                        <h3 className="admin-info-title"><FaUser /> {t('customer_info')}</h3>
                        <div className="customer-modern-info">
                            <div className="customer-main-info" style={{ border: 'none', padding: 0 }}>
                                <div className="customer-avatar-box">
                                    <FaUser />
                                </div>
                                <div className="customer-text-info">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Text strong style={{ fontSize: '16px' }}>{orderDetail.userName || t('guest')}</Text>
                                        {orderDetail.membershipLevel !== undefined && (
                                            <MembershipTag level={orderDetail.membershipLevel} />
                                        )}
                                    </div>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>ID: {orderDetail.userId || '---'}</Text>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="admin-info-card" style={{ marginBottom: 24 }}>
                        <h3 className="admin-info-title"><FaCreditCard /> {t('payment_header')}</h3>
                        <div className="admin-payment-info-box">
                            <p className="admin-font-bold">{t(`payment_method_${orderDetail.paymentMethod}`)}</p>
                            <Tag color={orderDetail.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                                {t(`payment_status_${orderDetail.paymentStatus}`)}
                            </Tag>
                        </div>
                    </div>

                    <div className="admin-info-card">
                        <h3 className="admin-info-title"><FaMapMarkedAlt /> {t('delivery_header')}</h3>
                        <div className="admin-delivery-details">
                            <p className="admin-font-bold">{orderDetail.buyerName || orderDetail.userName}</p>
                            <p>{orderDetail.buyerPhoneNumber || ''}</p>
                            <p>{orderDetail.address ? orderDetail.address.split('|')[0] : '---'}</p>
                        </div>
                    </div>

                    {orderDetail.buyerNote && (
                        <div className="admin-info-card" style={{ marginTop: 24, borderLeft: '4px solid var(--admin-primary)' }}>
                            <h3 className="admin-info-title">{t('note')}</h3>
                            <p style={{ fontStyle: 'italic', color: '#475569' }}>{orderDetail.buyerNote}</p>
                        </div>
                    )}
                </Col>
            </Row>
        </PageWrapper>
    );
}
