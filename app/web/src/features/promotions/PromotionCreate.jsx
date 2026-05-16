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

const getPromotionTypeOptions = (t) => [
    { value: 'ProductPromotion', label: t('promo_type_productpromotion') },
    { value: 'VoucherPromotion', label: t('promo_type_voucherpromotion') },
    { value: 'UserPromotion', label: t('promo_type_userpromotion') },
];

const getPromotionScopeOptions = (t) => [
    { value: 'PRODUCT', label: t('promo_scope_product') },
    { value: 'CATEGORY', label: t('promo_scope_category') },
    { value: 'BRAND', label: t('promo_scope_brand') },
];

const inferScope = (data) => {
    if (data?.promotionType === 'VoucherPromotion') return 'VOUCHER';
    if (data?.promotionType === 'UserPromotion') return 'USER';
    if (data?.categoryIds?.length > 0) return 'CATEGORY';
    if (data?.brandIds?.length > 0) return 'BRAND';
    return 'PRODUCT';
};

const buildPayload = (values) => {
    const isVoucher = values.promotionType === 'VoucherPromotion' || values.promotionType === 'VOUCHER';
    const isUser = values.promotionType === 'UserPromotion' || values.promotionType === 'USER';
    const isProduct = values.promotionType === 'ProductPromotion' || values.promotionType === 'PRODUCT';
    
    // Map frontend promotionType to backend type discriminator
    let type = 'PRODUCT';
    if (isVoucher) type = 'VOUCHER';
    else if (isUser) type = 'USER';

    const payload = {
        title: values.title,
        description: values.description,
        startAt: values.startAt.add(7, 'hour').toISOString(),
        endAt: values.endAt.add(7, 'hour').toISOString(),
        promotionType: values.promotionType, // Keep for backward compatibility or display
        type: type, // Backend strategy factory uses this
        discountType: values.discountType,
        discountValue: values.discountValue,
        maxDiscount: values.maxDiscount,
        status: values.status,
        
        // Product Promotion fields
        categoryIds: isProduct && values.promotionScope === 'CATEGORY' ? values.categoryIds : [],
        brandIds: isProduct && values.promotionScope === 'BRAND' ? values.brandIds : [],
        productIds: [],
        
        // Voucher Promotion fields
        code: isVoucher ? values.code : null,
        totalQuantity: isVoucher ? values.totalQuantity : null,
        remainingQuantity: isVoucher ? (values.remainingQuantity ?? values.totalQuantity) : null,
        minOrderValue: isVoucher ? values.minOrderValue : null,
        usageLimitPerUser: isVoucher ? values.usageLimitPerUser : null,

        // User Promotion fields
        birthdayMonth: isUser ? values.birthdayMonth : [],
        membershipLevels: isUser ? values.membershipLevels : [],
        userIds: isUser ? (values.userIds ? values.userIds.split(',').map(id => id.trim()) : []) : [],
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

    const promotionType = Form.useWatch('promotionType', form);
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
                userIds: initialData.userIds?.join(', '),
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
            title={isEdit ? t('admin_promotion_edit') : t('admin_promotion_create')}
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
                        promotionType: 'ProductPromotion',
                        discountType: 'PERCENTAGE',
                        status: 'STARTING',
                        promotionScope: 'PRODUCT',
                        maxDiscount: 0,
                    }}
                >
                    <Row gutter={24}>
                        <Col xs={24} lg={16}>
                            <div className="promo-form-section">
                                <Form.Item label={t('promo_label_promotion_type')} name="promotionType" rules={[{ required: true }]}>
                                    <Select 
                                        size="large"
                                        onChange={(val) => {
                                            if (val === 'ProductPromotion') {
                                                form.setFieldsValue({ promotionScope: 'PRODUCT', categoryIds: [], brandIds: [] });
                                            } else if (val === 'VoucherPromotion') {
                                                form.setFieldsValue({ promotionScope: 'VOUCHER' });
                                            } else if (val === 'UserPromotion') {
                                                form.setFieldsValue({ promotionScope: 'USER' });
                                            }
                                        }}
                                    >
                                        {getPromotionTypeOptions(t).map(({ value, label }) => (
                                            <Option key={value} value={value}>{label}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>

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
                                {promotionType === 'ProductPromotion' && (
                                    <>
                                        <Form.Item label={t('promo_label_promotion_scope')} name="promotionScope" rules={[{ required: true }]}>
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
                                    </>
                                )}

                                {(promotionType === 'VOUCHER' || promotionType === 'VoucherPromotion') && (
                                    <div className="voucher-fields">
                                        <Form.Item label={t('promo_col_code')} name="code" rules={[{ required: true, message: t('code_required') }]}>
                                            <CInput placeholder={t('promo_placeholder_code')} />
                                        </Form.Item>
                                        
                                        <Row gutter={16}>
                                            <Col span={8}>
                                                <Form.Item label={t('promo_col_total_qty')} name="totalQuantity" rules={[{ required: true }]}>
                                                    <InputNumber className="w-full" size="large" min={1} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={8}>
                                                <Form.Item label={t('promo_label_min_order')} name="minOrderValue">
                                                    <InputNumber className="w-full" size="large" min={0} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={8}>
                                                <Form.Item label={t('promo_label_usage_limit')} name="usageLimitPerUser" initialValue={1}>
                                                    <InputNumber className="w-full" size="large" min={1} />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </div>
                                )}

                                {promotionType === 'UserPromotion' && (
                                    <div className="user-promo-fields">
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Form.Item label={t('promo_label_birthday')} name="birthdayMonth">
                                                    <Select mode="multiple" size="large" placeholder={t('months')}>
                                                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                                            <Option key={m} value={m}>{t('month')} {m}</Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item label={t('promo_label_membership')} name="membershipLevels">
                                                    <Select mode="multiple" size="large">
                                                        <Option value={0}>{t('membership_level_0')}</Option>
                                                        <Option value={1}>{t('membership_level_1')}</Option>
                                                        <Option value={2}>{t('membership_level_2')}</Option>
                                                        <Option value={3}>{t('membership_level_3')}</Option>
                                                        <Option value={4}>{t('membership_level_4')}</Option>
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Form.Item label={t('promo_label_user_ids')} name="userIds">
                                            <CInput placeholder={t('promo_placeholder_user_ids')} />
                                        </Form.Item>
                                    </div>
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
