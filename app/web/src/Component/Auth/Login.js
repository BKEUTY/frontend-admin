import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Checkbox, Typography } from 'antd';
import { MailOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone, GlobalOutlined } from '@ant-design/icons';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../Context/AuthContext';
import { notifyError, notifySuccess } from '../../utils/NotificationService';
import './Auth.css';
import auth_bg from '../../Assets/Images/Banners/auth_background.png';

const { Title, Text } = Typography;

const Login = () => {
    const navigate = useNavigate();
    const { t, language, changeLanguage } = useLanguage();
    const [loading, setLoading] = useState(false);
    const { login, logout } = useAuth();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const user = await login(values.email, values.password);
            
            if (user?.user_role === 'ADMIN') {
                notifySuccess('success', t('login_success'));
                navigate('/admin');
            } else {
                await logout();
                notifyError('error', t('error_403'));
            }
        } catch (error) {
            const errorRaw = error.response?.data;
            let descriptionKey = 'api_error_login';

            if (errorRaw === 'Wrong credentials') {
                descriptionKey = 'api_error_wrong_credentials';
            } else if (error.response?.status === 401) {
                descriptionKey = 'api_error_invalid_credentials';
            }

            notifyError('error', descriptionKey);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container admin-mode">
            <div className="auth-image-side" style={{ backgroundImage: `url(${auth_bg})` }}>
                <div className="auth-image-overlay">
                    <div className="auth-brand-section">
                        <h1 className="auth-brand-logo">BKEUTY</h1>
                        <p className="auth-brand-tagline">Nâng tầm vẻ đẹp của bạn</p>
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
                <div className="auth-mobile-logo">
                    <h1>BKEUTY</h1>
                    <p>Nâng tầm vẻ đẹp của bạn</p>
                </div>
                <div className="auth-form-container">
                    <div className="auth-header">
                        <div className="admin-badge">ADMIN PORTAL</div>
                        <Title level={2} className="auth-title">
                            {t('welcome_back')}
                        </Title>
                        <Text className="auth-subtitle">
                            {t('login_subtitle')}
                        </Text>
                    </div>

                    <Form
                        name="login"
                        onFinish={onFinish}
                        layout="vertical"
                        size="large"
                        className="auth-form"
                    >
                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                { required: true, message: t('email_required') },
                                { type: 'email', message: t('email_invalid') }
                            ]}
                        >
                            <Input
                                prefix={<MailOutlined />}
                                placeholder={t('email_placeholder')}
                                autoComplete="email"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label={t('password')}
                            rules={[{ required: true, message: t('password_required') }]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder={t('password')}
                                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                autoComplete="current-password"
                            />
                        </Form.Item>

                        <Form.Item>
                            <div className="auth-options">
                                <Checkbox>{t('remember_me')}</Checkbox>
                                <Link to="/forgot-password" className="auth-link">
                                    {t('forgot_password')}
                                </Link>
                            </div>
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
