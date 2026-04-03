import React from 'react';
import { Button } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useLanguage } from '../../i18n/LanguageContext';

const LanguageToggle = ({ className, type = "text" }) => {
    const { language, changeLanguage } = useLanguage();

    const handleToggle = () => {
        changeLanguage(language === 'vi' ? 'en' : 'vi');
    };

    return (
        <Button
            type={type}
            icon={<GlobalOutlined />}
            onClick={handleToggle}
            className={className}
        >
            {language === 'vi' ? 'VI' : 'EN'}
        </Button>
    );
};

export default LanguageToggle;
