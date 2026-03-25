import React, { useState, useEffect } from 'react';
import { Form, Select, notification, InputNumber, Row, Col, DatePicker } from 'antd';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import promotionApi from '../../../api/promotionApi';
import { useLanguage } from '../../../i18n/LanguageContext';
import { PageWrapper, CButton, CInput } from '../../Common';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import './PromotionCreate.css';

const { Option } = Select;

const PromotionCreate = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { id } = useParams();
    const { state } = useLocation();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const isEdit = !!id;

    useEffect(() => {
        if (isEdit) {
            if (state?.promotion) {
                const p = state.promotion;
                form.setFieldsValue({
                    ...p,
                    dates: [dayjs(p.startAt), dayjs(p.endAt)]
                });
            } else {
                // Fetch from API if state is not available
                const fetchDetail = async () => {
                    try {
                        const res = await promotionApi.getById(id);
                        if (res.data) {
                            form.setFieldsValue({
                                ...res.data,
                                dates: [dayjs(res.data.startAt), dayjs(res.data.endAt)]
                            });
                        }
                    } catch (error) {
                        notification.error({ message: t('error'), description: t('api_error_fetch') });
                    }
                };
                fetchDetail();
            }
        }
    }, [id, isEdit, state, form, t]);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const payload = {
                title: values.title,
                description: values.description,
                discountValue: values.discountValue,
                discountType: values.discountType,
                startAt: values.dates[0].toISOString(),
                endAt: values.dates[1].toISOString(),
                status: values.status || 'INCOMING',
                promotionType: 'PRODUCT', // Default as per mobile
                maxDiscount: values.maxDiscount || 0,
                type: 'PRODUCT', // DTO polymorphic field
                categoryIds: [],
                productIds: [],
                brandIds: []
            };

            if (isEdit) {
                await promotionApi.update(id, payload);
                notification.success({ message: t('success'), description: t('promo_update_success') });
            } else {
                await promotionApi.create(payload);
                notification.success({ message: t('success'), description: t('promo_create_success') });
            }
            navigate('/admin/promotions');
        } catch (error) {
            notification.error({ message: t('error'), description: t('api_error_general') });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-promo-create-container">
            <PageWrapper
                title={isEdit ? t('edit') : t('admin_product_create')}
                extra={
                    <CButton type="secondary" icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/promotions')}>
                        {t('back')}
                    </CButton>
                }
            >
                <div className="promo-form-wrapper">
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        requiredMark={false}
                        initialValues={{
                            discountType: 'PERCENTAGE',
                            status: 'INCOMING'
                        }}
                    >
                        <Row gutter={24}>
                            <Col xs={24} md={16}>
                                <div className="promo-form-section">
                                    <Form.Item 
                                        label={t('promo_label_title')} 
                                        name="title" 
                                        rules={[{ required: true, message: t('name_required') }]}
                                    >
                                        <CInput placeholder={t('promo_placeholder_title')} />
                                    </Form.Item>

                                    <Form.Item label={t('promo_label_description')} name="description">
                                        <CInput multiline rows={4} placeholder={t('admin_placeholder_desc')} />
                                    </Form.Item>

                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item 
                                                label={t('promo_label_discount_type')} 
                                                name="discountType" 
                                                rules={[{ required: true }]}
                                            >
                                                <Select size="large">
                                                    <Option value="PERCENTAGE">Phần trăm (%)</Option>
                                                    <Option value="AMOUNT">Số tiền cố định (đ)</Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item 
                                                label={t('promo_label_discount_value')} 
                                                name="discountValue" 
                                                rules={[{ required: true }]}
                                            >
                                                <InputNumber 
                                                    style={{ width: '100%' }} 
                                                    size="large" 
                                                    min={1} 
                                                    placeholder={t('promo_placeholder_discount_value')}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item label={t('promo_label_max_discount')} name="maxDiscount">
                                                <InputNumber 
                                                    style={{ width: '100%' }} 
                                                    size="large" 
                                                    min={0} 
                                                    placeholder={t('promo_placeholder_max_discount')}
                                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item label={t('status')} name="status">
                                                <Select size="large">
                                                    <Option value="STARTING">{t('promo_status_STARTING')}</Option>
                                                    <Option value="INCOMING">{t('promo_status_INCOMING')}</Option>
                                                    <Option value="ENDED">{t('promo_status_ENDED')}</Option>
                                                    <Option value="DISABLED">{t('promo_status_DISABLED')}</Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </div>
                            </Col>

                            <Col xs={24} md={8}>
                                <div className="promo-form-section">
                                    <Form.Item 
                                        label={t('promo_col_time')} 
                                        name="dates" 
                                        rules={[{ required: true, message: t('term_required') }]}
                                    >
                                        <DatePicker.RangePicker 
                                            style={{ width: '100%' }} 
                                            size="large" 
                                            format="DD/MM/YYYY"
                                        />
                                    </Form.Item>

                                    <Form.Item label={t('promo_label_promotion_type')} name="promotionType">
                                        <Select size="large" disabled>
                                            <Option value="PRODUCT">Toàn bộ sản phẩm</Option>
                                            <Option value="CATEGORY">Theo danh mục</Option>
                                            <Option value="BRAND">Theo thương hiệu</Option>
                                        </Select>
                                    </Form.Item>

                                    <div className="promo-submit-area">
                                        <CButton 
                                            type="primary" 
                                            htmlType="submit" 
                                            block 
                                            size="large" 
                                            loading={loading}
                                            icon={<SaveOutlined />}
                                        >
                                            {isEdit ? t('update') : t('save')}
                                        </CButton>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Form>
                </div>
            </PageWrapper>
        </div>
    );
};

export default PromotionCreate;
