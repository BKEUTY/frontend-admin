import React from 'react';
import { Form, Input, Button, Typography } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/store/LanguageContext';
import auth_bg from '@/assets/images/banners/auth_background.png';
import './Auth.css';

const { Title, Text } = Typography;

const ForgotPassword = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();

    const onFinish = (values) => {
        console.log('Forgot password request:', values);
        // Implementation here
    };

    return (
        <div className="auth-container">
            <div className="auth-image-side" style={{ backgroundImage: `url(${auth_bg})` }}>
                <div className="auth-image-overlay">
                    <div className="auth-brand-section">
                        <h1 className="auth-brand-logo">BKEUTY</h1>
                        <p className="auth-brand-tagline">ADMIN PORTAL</p>
                    </div>
                </div>
            </div>

            <div className="auth-form-side">
                <div className="auth-form-container">
                    <div className="auth-header">
                        <Button 
                            type="text" 
                            icon={<ArrowLeftOutlined />} 
                            onClick={() => navigate('/login')}
                            style={{ padding: 0, marginBottom: 20 }}
                        >
                            {t('back_to_login')}
                        </Button>
                        <Title level={2} className="auth-title">
                            {t('forgot_password')}
                        </Title>
                        <Text className="auth-subtitle">
                            {t('forgot_password_subtitle')}
                        </Text>
                    </div>

                    <Form
                        layout="vertical"
                        size="large"
                        onFinish={onFinish}
                        className="auth-form"
                    >
                        <Form.Item
                            name="email"
                            label={t('email')}
                            rules={[
                                { required: true, message: t('email_required') },
                                { type: 'email', message: t('email_invalid') }
                            ]}
                        >
                            <Input prefix={<MailOutlined style={{ color: '#94a3b8' }} />} placeholder="admin@bkeuty.com" />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" block className="auth-submit-btn">
                                {t('send_reset_link')}
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
