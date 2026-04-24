import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/store/LanguageContext';
import { WarningOutlined } from '@ant-design/icons';
import { CButton, ScrollToTop } from '@/components/common';
import './ErrorPage.css';

const NotFound = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();

    return (
        <div className="error-page-container">
            <ScrollToTop />
            <h1 className="error-code">404</h1>
            <div className="error-content">
                <WarningOutlined className="error-icon" />
                <h2 className="error-title">{t('error_404_title')}</h2>
                <p className="error-desc">{t('error_404_desc')}</p>
                <CButton type="primary" onClick={() => navigate('/')}>
                    {t('back_to_home')}
                </CButton>
            </div>
        </div>
    );
};

export default NotFound;
