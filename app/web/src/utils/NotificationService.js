import { notification } from 'antd';
import { getTranslation } from '../i18n/translate';

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
        title: message,
        description: description,
        duration: duration,
        placement: 'topRight',
        onClose: () => recentNotifications.delete(notificationKey)
    });
};

export const notifySuccess = (messageKey, descriptionKey) => showNotification('success', messageKey, descriptionKey);
export const notifyError = (messageKey, descriptionKey) => showNotification('error', messageKey, descriptionKey);
export const notifyInfo = (messageKey, descriptionKey) => showNotification('info', messageKey, descriptionKey);
export const notifyWarning = (messageKey, descriptionKey) => showNotification('warning', messageKey, descriptionKey);
