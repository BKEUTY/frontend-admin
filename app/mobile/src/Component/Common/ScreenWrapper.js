import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import Header from '../Header';
import Loading from './Loading';

const ScreenWrapper = ({
    children,
    loading = false,
    useScrollView = false,
    showHeader = true,
    padding = 15,
    backgroundColor = '#f8f9fa'
}) => {
    const Content = useScrollView ? ScrollView : View;

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
            <StatusBar barStyle="dark-content" backgroundColor="white" />
            {showHeader && <Header />}

            <View style={styles.container}>
                {loading ? (
                    <View style={styles.center}>
                        <Loading />
                    </View>
                ) : (
                    <Content
                        style={styles.content}
                        contentContainerStyle={useScrollView ? { padding } : undefined}
                    >
                        {!useScrollView ? <View style={{ padding, flex: 1 }}>{children}</View> : children}
                    </Content>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default ScreenWrapper;
