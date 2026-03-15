import React from 'react';
import { Input, Typography, ConfigProvider } from 'antd';
import './CInput.css';

const { Text } = Typography;
const { TextArea } = Input;

/**
 * Common Styled Input for Bkeuty Web App
 */
const CInput = ({
    label,
    placeholder,
    value,
    onChange,
    type = 'text',
    multiline = false,
    prefix,
    suffix,
    size = 'middle',
    disabled = false,
    error = false,
    errorMessage = '',
    className = '',
    style = {},
    rows = 4,
    showCount = false,
    maxLength
}) => {
    const InputComponent = multiline ? TextArea : Input;

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: 'var(--color_main_title)',
                    borderRadius: 8,
                    controlHeight: 46,
                    colorBorder: '#e2e8f0',
                },
            }}
        >
            <div className={`c-input-container ${className}`} style={style}>
                {label && <Text strong className="c-input-label">{label}</Text>}
                <InputComponent
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    type={type}
                    disabled={disabled}
                    prefix={prefix}
                    suffix={suffix}
                    size={size}
                    rows={rows}
                    showCount={showCount}
                    maxLength={maxLength}
                    status={error ? 'error' : ''}
                    className="c-input-field"
                />
                {error && errorMessage && <Text type="danger" style={{ fontSize: 12, marginTop: 4 }}>{errorMessage}</Text>}
            </div>
        </ConfigProvider>
    );
};

export default CInput;
