import React from 'react';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import './StatsCard.css';

const StatsCard = ({ title, value, icon, trend, trendType }) => {
    return (
        <div className="beauty-card stat-card">
            <div className="stat-card-content">
                <div className="stat-card-left">
                    <div className="card-icon-wrapper">
                        {icon}
                    </div>
                    <div className="card-stat-label">{title}</div>
                    <div className="card-stat-value">{value}</div>
                </div>
                {trend && (
                    <div className={`trend-pill ${trendType === 'up' ? 'trend-up' : 'trend-down'}`}>
                        {trendType === 'up' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatsCard;
