import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/store/LanguageContext';
import { ToolOutlined } from '@ant-design/icons';
import { CButton } from '@/components/common';
import './ErrorPage.css';

const ServerError = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();

    return (
        <div className="error-page-container error-page-500">
            <h1 className="error-code">500</h1>
            <div className="error-content">
                <ToolOutlined className="error-icon" />
                <h2 className="error-title">{t('error_500_title')}</h2>
                <p className="error-desc">{t('error_500_desc')}</p>
                <CButton type="primary" onClick={() => navigate('/')}>
                    {t('back_to_home')}
                </CButton>
            </div>
        </div>
    );
};

export default ServerError;
