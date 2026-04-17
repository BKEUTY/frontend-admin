import React, { useEffect, useMemo } from 'react';
import { Form, Select, InputNumber, Row, Col, DatePicker } from 'antd';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import { useLanguage } from '@/store/LanguageContext';
import { PageWrapper, CButton, CInput } from '@/components/common';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useCreatePromotion, useUpdatePromotion } from '@/features/promotions/hooks/usePromotions';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { useBrands } from '@/features/brands/hooks/useBrands';
import './PromotionCreate.css';

const { Option } = Select;

const getPromotionScopeOptions = (t) => [
    { value: 'PRODUCT', label: t('promo_scope_product') },
    { value: 'CATEGORY', label: t('promo_scope_category') },
    { value: 'BRAND', label: t('promo_scope_brand') },
];

const inferScope = (data) => {
    if (data?.categoryIds?.length > 0) return 'CATEGORY';
    if (data?.brandIds?.length > 0) return 'BRAND';
    return 'PRODUCT';
};

const buildPayload = (values) => {
    const payload = {
        title: values.title,
        description: values.description,
        startAt: values.startAt.add(7, 'hour').toISOString(),
        endAt: values.endAt.add(7, 'hour').toISOString(),
        type: 'PRODUCT',
        discountType: values.discountType,
        discountValue: values.discountValue,
        maxDiscount: values.maxDiscount,
        status: values.status,
        categoryIds: values.promotionScope === 'CATEGORY' ? values.categoryIds : [],
        brandIds: values.promotionScope === 'BRAND' ? values.brandIds : [],
        productIds: [],
    };
    return payload;
};

const PromotionCreate = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { id } = useParams();
    const { state } = useLocation();
    const [form] = Form.useForm();
    const isEdit = !!id;

    const promotionScope = Form.useWatch('promotionScope', form);
    const { mutateAsync: createPromotion, isPending: isCreating } = useCreatePromotion();
    const { mutateAsync: updatePromotion, isPending: isUpdating } = useUpdatePromotion();

    const { categories } = useCategories({ size: 100 });
    const { brands } = useBrands({ size: 100 });

    const initialData = useMemo(() => state?.promotion, [state]);

    useEffect(() => {
        if (isEdit && initialData) {
            form.setFieldsValue({
                ...initialData,
                startAt: dayjs(initialData.startAt),
                endAt: dayjs(initialData.endAt),
                maxDiscount: initialData.maxDiscountValue ?? initialData.maxDiscount,
                promotionScope: inferScope(initialData),
            });
        }
    }, [isEdit, initialData, form]);

    const handleSubmit = async (values) => {
        const payload = buildPayload(values);
        try {
            if (isEdit) {
                await updatePromotion({ id, data: payload });
            } else {
                await createPromotion(payload);
            }
            navigate('/admin/promotions');
        } catch (_) { }
    };

    return (
        <PageWrapper
            title={isEdit ? t('edit') : t('admin_promotion_create')}
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
                        status: 'STARTING',
                        promotionScope: 'PRODUCT',
                        maxDiscount: 0,
                    }}
                >
                    <Row gutter={24}>
                        <Col xs={24} lg={16}>
                            <div className="promo-form-section">
                                <Form.Item label={t('promo_label_title')} name="title" rules={[{ required: true, message: t('name_required') }]}>
                                    <CInput placeholder={t('promo_placeholder_title')} />
                                </Form.Item>

                                <Form.Item label={t('promo_label_description')} name="description">
                                    <CInput multiline rows={4} placeholder={t('admin_placeholder_desc')} />
                                </Form.Item>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item label={t('promo_label_discount_type')} name="discountType" rules={[{ required: true }]}>
                                            <Select size="large">
                                                <Option value="PERCENTAGE">{t('promo_discount_type_percentage')}</Option>
                                                <Option value="AMOUNT">{t('promo_discount_type_amount')}</Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label={t('promo_label_discount_value')} name="discountValue" rules={[{ required: true }]}>
                                            <InputNumber className="w-full" size="large" min={1} />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item label={t('promo_label_max_discount')} name="maxDiscount">
                                            <InputNumber
                                                className="w-full"
                                                size="large"
                                                min={0}
                                                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                parser={(v) => v.replace(/\$\s?|(,*)/g, '')}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label={t('status')} name="status" rules={[{ required: true }]}>
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

                            <div className="promo-form-section">
                                <Form.Item label={t('promo_label_promotion_type')} name="promotionScope" rules={[{ required: true }]}>
                                    <Select size="large">
                                        {getPromotionScopeOptions(t).map(({ value, label }) => (
                                            <Option key={value} value={value}>{label}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>

                                {promotionScope === 'CATEGORY' && (
                                    <Form.Item label={t('promo_scope_category_label')} name="categoryIds" rules={[{ required: true, message: t('promo_scope_category_required') }]}>
                                        <Select mode="multiple" size="large" placeholder={t('promo_scope_category_placeholder')}>
                                            {categories.map((c) => (
                                                <Option key={c.id} value={c.id}>{c.categoryName}</Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                )}

                                {promotionScope === 'BRAND' && (
                                    <Form.Item label={t('promo_scope_brand_label')} name="brandIds" rules={[{ required: true, message: t('promo_scope_brand_required') }]}>
                                        <Select mode="multiple" size="large" placeholder={t('promo_scope_brand_placeholder')}>
                                            {brands.map((b) => (
                                                <Option key={b.id} value={b.id}>{b.name}</Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                )}
                            </div>
                        </Col>

                        <Col xs={24} lg={8}>
                            <div className="promo-form-section">
                                <Form.Item label={t('promo_col_start_time')} name="startAt" rules={[{ required: true }]}>
                                    <DatePicker className="w-full" size="large" format="DD/MM/YYYY HH:mm" showTime />
                                </Form.Item>

                                <Form.Item
                                    label={t('promo_col_end_time')}
                                    name="endAt"
                                    dependencies={['startAt']}
                                    rules={[
                                        { required: true },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || !getFieldValue('startAt') || value.isAfter(getFieldValue('startAt'))) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(new Error(t('promo_error_date')));
                                            },
                                        }),
                                    ]}
                                >
                                    <DatePicker className="w-full" size="large" format="DD/MM/YYYY HH:mm" showTime />
                                </Form.Item>

                                <div className="promo-submit-area">
                                    <CButton
                                        type="primary"
                                        htmlType="submit"
                                        block
                                        size="large"
                                        loading={isCreating || isUpdating}
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
    );
};

export default PromotionCreate;
