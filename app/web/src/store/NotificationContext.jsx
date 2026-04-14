import React, { createContext, useContext, useCallback } from 'react';
import { notification } from 'antd';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotification must be used within a NotificationProvider');
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [api, contextHolder] = notification.useNotification();

    const showNotification = useCallback((message, type = 'success', description = '') => {
        api[type]({
            message,
            description,
            placement: 'topRight',
            duration: 3,
        });
    }, [api]);

    return (
        <NotificationContext.Provider value={showNotification}>
            {contextHolder}
            {children}
        </NotificationContext.Provider>
    );
};
