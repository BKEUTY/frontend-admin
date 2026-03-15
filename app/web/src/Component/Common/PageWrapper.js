import React from 'react';
import { Card } from 'antd';
import './PageWrapper.css';

const PageWrapper = ({
    title,
    subtitle,
    extra,
    children,
    loading = false,
    className = "",
    noCard = false
}) => {
    return (
        <div className={`page-wrapper-container ${className}`}>
            {(title || subtitle || extra) && (
                <div className="page-header">
                    <div className="header-content">
                        {title && <h2 className="page-title">{title}</h2>}
                        {subtitle && <div className="page-subtitle-wrapper"><span className="page-subtitle">{subtitle}</span></div>}
                    </div>
                    {extra && <div className="header-extra">{extra}</div>}
                </div>
            )}

            <div className="page-content">
                {noCard ? children : (
                    <Card variant="borderless" className="beauty-card" loading={loading} styles={{ body: { padding: 0 } }}>
                        {children}
                    </Card>
                )}
            </div>
        </div>
    );
};

export default PageWrapper;
