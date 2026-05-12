import React from 'react';
import { Tag } from 'antd';
import { useLanguage } from '@/store/LanguageContext';

const MembershipTag = ({ level, className }) => {
    const { t } = useLanguage();

    const config = {
        0: { color: '#64748b', bg: '#f1f5f9' },
        1: { color: '#2563eb', bg: '#eff6ff' },
        2: { color: '#d97706', bg: '#fffbeb' },
        3: { color: '#7c3aed', bg: '#f5f3ff' },
        4: { color: '#0891b2', bg: '#ecfeff' }
    };

    const { color, bg } = config[level] || config[0];
    const label = t(`membership_level_${level || 0}`);

    return (
        <Tag 
            className={className} 
            style={{ 
                fontWeight: 700, 
                borderRadius: '6px',
                color: color,
                backgroundColor: bg,
                borderColor: 'transparent',
                fontSize: '10px',
                padding: '0px 8px',
                height: '20px',
                display: 'inline-flex',
                alignItems: 'center',
                margin: 0,
                lineHeight: '1'
            }}
        >
            {label.toUpperCase()}
        </Tag>
    );
};

export default MembershipTag;
