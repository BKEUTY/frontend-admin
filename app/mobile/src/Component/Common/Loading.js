import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { COLORS } from '../../constants/Theme';

const Loading = ({
    size = 'large',
    color = COLORS.mainTitle || '#c2185b',
    text,
    overlay = false
}) => {
    const containerStyle = overlay ? styles.overlay : styles.container;

    return (
        <View style={containerStyle}>
            <ActivityIndicator size={size} color={color} />
            {text && <Text style={styles.text}>{text}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
    text: {
        marginTop: 10,
        fontSize: 14,
        color: '#666',
    }
});

export default Loading;
