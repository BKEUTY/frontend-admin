import React from 'react';
import { Button, ConfigProvider } from 'antd';
import './CButton.css';

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
    const isAntdDefault = type === 'secondary' || type === 'outline';

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: 'var(--color_main_title)',
                    colorPrimaryHover: 'var(--color_main_title_hover)',
                    borderRadius: 12,
                    controlHeight: size === 'large' ? 54 : 46,
                    fontFamily: 'var(--inter_font)',
                },
            }}
        >
            <Button
                type={isAntdDefault ? 'default' : (type === 'danger' ? 'primary' : type)}
                danger={type === 'danger'}
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
