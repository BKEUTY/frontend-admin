import React from 'react';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useLanguage } from '@/store/LanguageContext';
import './StatsCard.css';

const StatsCard = ({ title, value, icon, trend, trendType }) => {
    const { t } = useLanguage();
    return (
        <div className="admin-stat-card-modern">
            <div className="stat-icon-wrapper">
                {icon}
            </div>
            <div className="stat-content">
                <p className="stat-label">{title}</p>
                <h3 className="stat-value">{value}</h3>
                {trend !== undefined && (
                    <div className={`stat-trend ${trendType}`}>
                        {trendType === 'up' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                        <span>{Math.abs(trend)}%</span>
                        <small>{t('vs_last_period')}</small>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatsCard;
