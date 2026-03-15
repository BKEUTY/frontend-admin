import React from 'react';
import { Button, ConfigProvider } from 'antd';
import './CButton.css';

/**
 * Common Styled Button for Bkeuty Web App
 * @param {string} type - 'primary' | 'secondary' | 'outline' | 'danger'
 * @param {boolean} loading - loading state
 * @param {boolean} disabled - disabled state
 * @param {React.ReactNode} icon - icon before text
 * @param {string} size - 'small' | 'middle' | 'large'
 * @param {boolean} block - width 100%
 */
const CButton = ({
    children,
    type = 'primary',
    loading = false,
    disabled = false,
    icon,
    onClick,
    size = 'middle',
    block = false,
    className = '',
    style = {},
    htmlType = 'button'
}) => {
    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: 'var(--color_main_title)',
                    borderRadius: 8,
                    controlHeight: 50,
                },
            }}
        >
            <Button
                type={type === 'outline' ? 'default' : (type === 'secondary' ? 'default' : type)}
                loading={loading}
                disabled={disabled}
                icon={icon}
                onClick={onClick}
                size={size}
                block={block}
                htmlType={htmlType}
                className={`c-button c-button-${type} ${className}`}
                style={style}
            >
                {children}
            </Button>
        </ConfigProvider>
    );
};

export default CButton;
