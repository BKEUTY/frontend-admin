import React, { createContext, useContext, useCallback } from 'react';
import { notification } from 'antd';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {

    const showNotification = useCallback((message, type = 'success', description = '') => {
        notification[type]({
            message: message,
            description: description,
            placement: 'topRight',
            duration: 3,
        });
    }, []);

    return (
        <NotificationContext.Provider value={showNotification}>
            {children}
        </NotificationContext.Provider>
    );
};
