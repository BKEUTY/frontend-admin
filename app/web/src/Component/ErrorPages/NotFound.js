import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import { FaExclamationTriangle } from 'react-icons/fa';
import './ErrorPage.css';

const NotFound = () => {
    const { t } = useLanguage();

    return (
        <div className="error-page-container">
            <h1 className="error-code">404</h1>
            <div className="error-content">
                <FaExclamationTriangle className="error-icon" />
                <h2 className="error-title">{t('error_404_title')}</h2>
                <p className="error-desc">{t('error_404_desc')}</p>
                <Link to="/" className="error-btn">{t('back_to_home')}</Link>
            </div>
        </div>
    );
};

export default NotFound;
