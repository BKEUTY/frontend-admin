import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import './Loading.css';

const Loading = ({ size = 'large', tip, fullscreen = false }) => {
    const antIcon = <LoadingOutlined style={{ fontSize: size === 'large' ? 48 : 24 }} spin />;

    if (fullscreen) {
        return (
            <div className="loading-fullscreen">
                <Spin indicator={antIcon} tip={tip} size={size} />
            </div>
        );
    }

    return (
        <div className="loading-container">
            <Spin indicator={antIcon} tip={tip} size={size} />
        </div>
    );
};

export default Loading;
