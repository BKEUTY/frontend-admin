import React from 'react';
import { Empty, Button } from 'antd';
import { useLanguage } from '@/store/LanguageContext';
import './EmptyState.css';

const EmptyState = ({
    image,
    title,
    description,
    actionText,
    onAction,
    icon
}) => {
    const { t } = useLanguage();

    return (
        <div className="empty-state-container">
            <Empty
                image={image || Empty.PRESENTED_IMAGE_SIMPLE}
                styles={{ image: { height: 120 } }}
                description={
                    <div className="empty-state-content">
                        {icon && <div className="empty-state-icon">{icon}</div>}
                        <h3 className="empty-state-title">
                            {title || t('no_data')}
                        </h3>
                        <p className="empty-state-description">
                            {description || t('admin_report_no_data')}
                        </p>
                    </div>
                }
            >
                {actionText && onAction && (
                    <Button type="primary" onClick={onAction}>
                        {actionText}
                    </Button>
                )}
            </Empty>
        </div>
    );
};

export default EmptyState;
