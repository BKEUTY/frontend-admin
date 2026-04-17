import React from 'react';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useLanguage } from '@/store/LanguageContext';
import './StatsCard.css';

const StatsCard = ({ title, value, icon, trend, trendType }) => {
    const { t } = useLanguage();

    const unit = t('admin_unit_vnd');

    const formatValue = (val) => {
        if (typeof val === 'string' && val.endsWith(unit)) {
            return {
                amount: val.slice(0, -unit.length),
                currency: unit
            };
        }
        return { amount: val, currency: null };
    };

    const { amount, currency } = formatValue(value);

    return (
        <div className="admin-stat-card-modern">
            <div className="stat-icon-wrapper">
                {icon}
            </div>
            <div className="stat-content">
                <p className="stat-label">{title}</p>
                <div className="stat-value-container">
                    <h3 className={`stat-value ${currency ? 'has-currency' : ''}`}>{amount}</h3>
                    {currency && <span className="stat-currency">{currency}</span>}
                </div>
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
