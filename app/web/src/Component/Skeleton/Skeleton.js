import React from 'react';
import './Skeleton.css';

const Skeleton = ({ width, height, borderRadius = '4px', className = '' }) => {
    const style = {
        width,
        height,
        borderRadius,
    };

    return <div className={`skeleton ${className}`} style={style}></div>;
};

export default Skeleton;
