import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Typography } from 'antd';
import { MailOutlined, LockOutlined, GlobalOutlined } from '@ant-design/icons';
import { useLanguage } from '@/store/LanguageContext';
import { useAuth } from '@/store/AuthContext';
import { notifyError, notifySuccess } from '@/services/NotificationService';
import { ScrollToTop } from '@/components/common';
import auth_bg from '@/assets/images/banners/auth_background.png';
import './Auth.css';

const { Title, Text } = Typography;

const Login = () => {
    const navigate = useNavigate();
    const { t, language, changeLanguage } = useLanguage();
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            await login(values.email, values.password);
            notifySuccess('success', t('login_success'));
            navigate('/admin');
        } catch (error) {
            const apiMsg = error.response?.data;
            const isInvalid = error.response?.status === 401 || apiMsg === 'invalid_credentials';
            const displayMsg = (typeof apiMsg === 'string' && apiMsg.length > 5) ? (t(apiMsg) || apiMsg) : t(isInvalid ? 'api_error_wrong_credentials' : 'admin_error_general');

            notifyError('error', displayMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <ScrollToTop />
            <div className="auth-image-side" style={{ backgroundImage: `url(${auth_bg})` }}>
                <div className="auth-image-overlay">
                    <div className="auth-brand-section">
                        <h1 className="auth-brand-logo">BKEUTY</h1>
                        <p className="auth-brand-tagline">ADMIN PORTAL</p>
                    </div>
                </div>
            </div>

            <div className="auth-form-side">
                <div className="auth-lang-switch">
                    <Button
                        type="text"
                        icon={<GlobalOutlined />}
                        onClick={() => changeLanguage(language === 'en' ? 'vi' : 'en')}
                    >
                        {language === 'vi' ? 'Tiếng Việt' : 'English'}
                    </Button>
                </div>

                <div className="auth-form-container">
                    <div className="auth-header">
                        <Title level={2} className="auth-title">
                            {t('admin_login_title')}
                        </Title>
                        <Text className="auth-subtitle">
                            {t('admin_login_subtitle')}
                        </Text>
                    </div>

                    <Form
                        name="admin_login"
                        onFinish={onFinish}
                        layout="vertical"
                        size="large"
                        className="auth-form"
                    >
                        <Form.Item
                            name="email"
                            label={t('email') || 'Email'}
                            rules={[
                                { required: true, message: t('email_required') },
                                { type: 'email', message: t('email_invalid') }
                            ]}
                        >
                            <Input
                                prefix={<MailOutlined style={{ color: '#94a3b8' }} />}
                                placeholder="admin@bkeuty.com"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label={t('password')}
                            rules={[{ required: true, message: t('password_required') }]}
                        >
                            <Input.Password
                                prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
                                placeholder="••••••••"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                block
                                className="auth-submit-btn"
                            >
                                {t('login')}
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default Login;
