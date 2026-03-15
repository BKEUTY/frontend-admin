import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import { FaTools } from 'react-icons/fa';
import './ErrorPage.css';

const ServerError = () => {
    const { t } = useLanguage();

    return (
        <div className="error-page-container error-page-500">
            <h1 className="error-code">500</h1>
            <div className="error-content">
                <FaTools className="error-icon" />
                <h2 className="error-title">{t('error_500_title')}</h2>
                <p className="error-desc">{t('error_500_desc')}</p>
                <Link to="/" className="error-btn">{t('back_to_home')}</Link>
            </div>
        </div>
    );
};

export default ServerError;
