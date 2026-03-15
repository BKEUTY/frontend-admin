import React, { useEffect, useRef } from 'react';
import { registerRootComponent } from 'expo';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import AppNavigator from './src/Navigation/AppNavigator';
import { LanguageProvider } from './src/i18n/LanguageContext';
import { AuthProvider } from './src/Context/AuthContext';
import { ToastProvider } from './src/Context/ToastContext';
import { registerForPushNotificationsAsync } from './src/utils/NotificationService';

const App = () => {
    const notificationListener = useRef();
    const responseListener = useRef();

    useEffect(() => {
        registerForPushNotificationsAsync();

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        });

        return () => {
            Notifications.removeNotificationSubscription(notificationListener.current);
            Notifications.removeNotificationSubscription(responseListener.current);
        };
    }, []);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <LanguageProvider>
                <AuthProvider>
                    <ToastProvider>
                        <AppNavigator />
                    </ToastProvider>
                </AuthProvider>
            </LanguageProvider>
        </GestureHandlerRootView>
    );
};

registerRootComponent(App);
