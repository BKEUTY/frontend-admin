import React from 'react';
import { Tag } from 'antd';
import { useLanguage } from '@/store/LanguageContext';

const MembershipTag = ({ level, className }) => {
    const { t } = useLanguage();

    const levelClass = `membership-level-${level || 0}`;
    const label = t(`membership_level_${level || 0}`);

    return (
        <Tag className={`${className} membership-tag-luxury ${levelClass}`}>
            {label.toUpperCase()}
        </Tag>
    );
};

export default MembershipTag;
