import React from 'react';
import './Skeleton.css';

const Skeleton = ({ width, height, borderRadius, style, className }) => {
    const styles = {
        width,
        height,
        borderRadius,
        ...style,
    };

    return (
        <div
            className={`skeleton-loader ${className || ''}`}
            style={styles}
        ></div>
    );
};

export default Skeleton;
