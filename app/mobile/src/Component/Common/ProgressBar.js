import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const ProgressBar = ({ progress = 0.3, color = '#c2185b', height = 6, animated = true }) => {
    const progressAnimation = new Animated.Value(0);

    useEffect(() => {
        if (animated) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(progressAnimation, {
                        toValue: 1,
                        duration: 2000,
                        useNativeDriver: false,
                    }),
                    Animated.timing(progressAnimation, {
                        toValue: 0,
                        duration: 0,
                        useNativeDriver: false,
                    })
                ])
            ).start();
        }
    }, [animated]);

    const widthInterpolated = progressAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%']
    });

    return (
        <View style={[styles.container, { height }]}>
            <Animated.View
                style={[
                    styles.progressBar,
                    {
                        width: animated ? widthInterpolated : `${progress * 100}%`,
                        backgroundColor: color
                    }
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: '#f0f0f0',
        borderRadius: 100,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 100,
    }
});

export default ProgressBar;
