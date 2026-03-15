
import React, { createContext, useContext, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform, TouchableOpacity } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
    withSequence,
    withDelay
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { registerToast } from '../utils/ToastService';

const ToastContext = createContext();

const { width } = Dimensions.get('window');

const TOAST_WIDTH = width - 32;
const TOAST_HEIGHT = 80;

const Toast = () => {
    const translateY = useSharedValue(-150);
    const opacity = useSharedValue(0);
    const [toast, setToast] = React.useState({ message: '', type: 'success', description: '' });

    const show = (message, type, description) => {
        setToast({ message, type, description });
        translateY.value = withSpring(50, { damping: 15 });
        opacity.value = withTiming(1, { duration: 300 });

        setTimeout(() => {
            hide();
        }, 3000);
    };

    const hide = () => {
        translateY.value = withTiming(-150, { duration: 500 });
        opacity.value = withTiming(0, { duration: 300 });
    };

    useEffect(() => {
        registerToast({ show });
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
            opacity: opacity.value,
        };
    });

    const getIcon = () => {
        switch (toast.type) {
            case 'success': return 'checkmark-circle';
            case 'error': return 'alert-circle';
            case 'warning': return 'warning';
            case 'info': return 'information-circle';
            default: return 'notifications';
        }
    };

    const getColor = () => {
        switch (toast.type) {
            case 'success': return '#4caf50';
            case 'error': return '#ff4d4f';
            case 'warning': return '#faad14';
            case 'info': return '#1890ff';
            default: return '#333';
        }
    };

    return (
        <Animated.View style={[styles.container, animatedStyle, { borderLeftColor: getColor() }]}>
            <View style={styles.iconContainer}>
                <Ionicons name={getIcon()} size={28} color={getColor()} />
            </View>
            <View style={styles.content}>
                <Text style={styles.title}>{toast.message}</Text>
                {toast.description ? <Text style={styles.description} numberOfLines={2}>{toast.description}</Text> : null}
            </View>
            <TouchableOpacity onPress={hide} style={styles.closeButton}>
                <Ionicons name="close" size={20} color="#999" />
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 16,
        width: TOAST_WIDTH,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        paddingVertical: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.15,
        shadowRadius: 30,
        elevation: 10,
        zIndex: 9999,
        borderLeftWidth: 4,
    },
    iconContainer: {
        position: 'absolute',
        left: 20,
        top: 22,
    },
    content: {
        flex: 1,
        marginLeft: 40,
        marginRight: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 6,
    },
    description: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    closeButton: {
        padding: 4,
        marginTop: -4,
    }
});

export const ToastProvider = ({ children }) => {
    return (
        <ToastContext.Provider value={{}}>
            {children}
            <Toast />
        </ToastContext.Provider>
    );
};
