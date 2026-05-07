import { notification } from 'antd';
import { getTranslation } from '@/utils/translate';

const recentNotifications = new Map();

export const showNotification = (type, messageKey, descriptionKey, duration = 3) => {
    const message = getTranslation(messageKey) || messageKey;
    const description = getTranslation(descriptionKey) || descriptionKey;

    const notificationKey = `notify_${description.replace(/\s+/g, '_')}`;

    const now = Date.now();

    const lastTime = recentNotifications.get(notificationKey);
    if (lastTime && (now - lastTime < 500)) {
        return;
    }
    recentNotifications.set(notificationKey, now);

    notification[type]({
        key: notificationKey,
        message: message,
        description: description,
        duration: duration,
        placement: 'topRight',
        className: 'admin-notification-modern',
        onClose: () => recentNotifications.delete(notificationKey)
    });
};

export const notifySuccess = (messageKey, descriptionKey) => showNotification('success', messageKey, descriptionKey);
export const notifyError = (messageKeyOrError, descriptionKey) => {
    if (messageKeyOrError && messageKeyOrError.isGlobalHandled) return;
    
    let messageKey = messageKeyOrError;
    if (messageKeyOrError instanceof Error) {
        messageKey = messageKeyOrError.message || 'error';
    }
    
    showNotification('error', messageKey, descriptionKey);
};
export const notifyInfo = (messageKey, descriptionKey) => showNotification('info', messageKey, descriptionKey);
export const notifyWarning = (messageKey, descriptionKey) => showNotification('warning', messageKey, descriptionKey);
