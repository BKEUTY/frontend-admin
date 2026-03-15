import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../i18n/LanguageContext';

const EmptyState = ({
    icon = 'cube-outline',
    title,
    description,
    actionText,
    onAction
}) => {
    const { t } = useLanguage();

    return (
        <View style={styles.container}>
            <Ionicons name={icon} size={80} color="#ddd" />
            <Text style={styles.title}>{title || t('no_data')}</Text>
            {description && <Text style={styles.description}>{description}</Text>}

            {actionText && onAction && (
                <TouchableOpacity style={styles.button} onPress={onAction}>
                    <Text style={styles.buttonText}>{actionText}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#374151',
        marginTop: 20,
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        color: '#9ca3af',
        marginTop: 10,
        textAlign: 'center',
        lineHeight: 20,
    },
    button: {
        marginTop: 30,
        backgroundColor: '#c2185b',
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 25,
    },
    buttonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 14,
    }
});

export default EmptyState;
