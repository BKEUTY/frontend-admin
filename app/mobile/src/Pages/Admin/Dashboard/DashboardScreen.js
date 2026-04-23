import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity, Platform, useWindowDimensions, Modal, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useLanguage } from '../../../../i18n/LanguageContext';
import { COLORS, SHADOWS, SIZES } from '../../../../constants/Theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useDashboard } from '../../../../hooks/useDashboard';
import { BarChart } from 'react-native-chart-kit';

const DashboardScreen = ({ navigation }) => {
    const { t, language } = useLanguage();
    const { width } = useWindowDimensions();
    const locale = language === 'vi' ? 'vi-VN' : 'en-US';
    const { loading, dashboardData, refresh } = useDashboard('month');

    useFocusEffect(
        React.useCallback(() => {
            refresh();
        }, [refresh])
    );

    const stats = [
        {
            title: t('admin_dashboard_sales'),
            value: (dashboardData?.overview?.totalRevenue || 0).toLocaleString(locale) + ' ' + t('admin_unit_vnd'),
            icon: 'currency-usd',
            iconLib: MaterialCommunityIcons,
            colors: [COLORS.primary, COLORS.primaryHover],
            bgLight: '#fce7f3'
        },
        {
            title: t('admin_dashboard_orders'),
            value: (dashboardData?.overview?.totalOrders || 0).toString(),
            icon: 'shopping-bag',
            iconLib: FontAwesome5,
            colors: ['#2980b9', '#3498db'],
            bgLight: '#dbeafe'
        },
        {
            title: t('admin_dashboard_users'),
            value: (dashboardData?.overview?.totalRegisteredCustomers || 0).toString(),
            icon: 'account-group',
            iconLib: MaterialCommunityIcons,
            colors: ['#059669', '#10b981'],
            bgLight: '#d1fae5'
        },
        {
            title: t('admin_dashboard_products'),
            value: (dashboardData?.overview?.totalProductsSold || 0).toString(),
            icon: 'package-variant-closed',
            iconLib: MaterialCommunityIcons,
            colors: ['#d97706', '#f59e0b'],
            bgLight: '#fef3c7'
        }
    ];

    const chartData = {
        labels: dashboardData?.topPerformers?.topProducts?.slice(0, 3).map(p => p.name.substring(0, 5) + '...') || [],
        datasets: [{
            data: dashboardData?.topPerformers?.topProducts?.slice(0, 3).map(p => Number(p.quantity || 0)) || [0]
        }]
    };

    const renderStatCard = (item, index) => {
        const IconLib = item.iconLib;
        const isTablet = width > 600;
        const cardWidth = isTablet ? (width - 48) / 4 : (width - 48) / 2;

        return (
            <TouchableOpacity
                key={index}
                style={[styles.statCard, { width: cardWidth }]}
                activeOpacity={0.9}
            >
                <View style={[styles.iconWrapper, { backgroundColor: item.bgLight }]}>
                    <IconLib name={item.icon} size={24} color={item.colors[0]} />
                </View>

                <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>{item.value}</Text>
                <Text style={styles.statLabel} numberOfLines={1}>{item.title}</Text>
            </TouchableOpacity>
        );
    };

    const renderProductItem = ({ item }) => (
        <TouchableOpacity
            style={styles.productItem}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('AdminOrders')} // Redirect to orders since recentOrders has order context
        >
            <View style={styles.productIcon}>
                <MaterialCommunityIcons name="receipt" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>#{item.id}</Text>
                <Text style={styles.customerName}>{item.customerName}</Text>
            </View>
            <View style={styles.productMeta}>
                <Text style={styles.productPrice}>{(item.total + item.shippingFee).toLocaleString(locale)} đ</Text>
                <View style={styles.statusPill}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <LinearGradient
                colors={[COLORS.primary, COLORS.primaryHover]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.headerGradient}
            >
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerSubtitle}>{t('welcome')}, Admin</Text>
                        <Text style={styles.headerTitle}>{t('dashboard')}</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.reportBtn} 
                        onPress={() => navigation.navigate('AdminReports')}
                    >
                        <MaterialCommunityIcons name="chart-box-outline" size={28} color="white" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <View style={styles.contentContainer}>
                {loading ? (
                    <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
                ) : (
                    <>
                        <View style={styles.statsGrid}>
                            {stats.map((item, index) => renderStatCard(item, index))}
                        </View>

                        <View style={styles.chartCard}>
                            <Text style={styles.cardTitle}>{t('admin_best_product')}</Text>
                            <BarChart
                                data={chartData}
                                width={width - 56}
                                height={220}
                                chartConfig={{
                                    backgroundColor: '#ffffff',
                                    backgroundGradientFrom: '#ffffff',
                                    backgroundGradientTo: '#ffffff',
                                    decimalPlaces: 0,
                                    color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
                                    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
                                    style: { borderRadius: 16 },
                                }}
                                verticalLabelRotation={0}
                                style={{ marginVertical: 8, borderRadius: 16 }}
                                showValuesOnTopOfBars
                                fromZero
                            />
                        </View>

                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>{t('admin_recent_orders')}</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('AdminOrders')}>
                                <Text style={styles.seeAllText}>{t('view_all')}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.tableCard}>
                            {dashboardData?.recentOrders?.length > 0 ? (
                                <FlatList
                                    data={dashboardData.recentOrders.slice(0, 5)}
                                    renderItem={renderProductItem}
                                    keyExtractor={item => item.id}
                                    scrollEnabled={false}
                                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                                />
                            ) : (
                                <View style={styles.emptyContainer}>
                                    <MaterialCommunityIcons name="receipt" size={48} color="#e2e8f0" />
                                    <Text style={styles.emptyText}>{t('no_orders')}</Text>
                                </View>
                            )}
                        </View>
                    </>
                )}
            </View>
            <View style={{ height: 100 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    headerGradient: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 40,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginBottom: 4 },
    headerTitle: { fontSize: 28, fontWeight: '800', color: '#ffffff' },
    reportBtn: { padding: 4 },
    contentContainer: { padding: 20, marginTop: -30 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginBottom: 24 },
    statCard: { backgroundColor: 'white', borderRadius: 24, padding: 16, ...SHADOWS.light, marginBottom: 8 },
    iconWrapper: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    statValue: { fontSize: 18, fontWeight: '900', color: COLORS.text, marginBottom: 4 },
    statLabel: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
    chartCard: { backgroundColor: 'white', borderRadius: 24, padding: 16, marginBottom: 24, ...SHADOWS.light },
    cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
    seeAllText: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
    tableCard: { backgroundColor: 'white', borderRadius: 20, padding: 8, ...SHADOWS.medium },
    productItem: { padding: 16, flexDirection: 'row', alignItems: 'center' },
    productIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#fce7f3', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    productInfo: { flex: 1 },
    productName: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
    customerName: { fontSize: 12, color: COLORS.textSecondary },
    productMeta: { alignItems: 'flex-end' },
    productPrice: { fontSize: 14, fontWeight: '700', color: COLORS.primary, marginBottom: 4 },
    statusPill: { backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    statusText: { color: COLORS.textSecondary, fontSize: 10, fontWeight: '700' },
    separator: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 16 },
    emptyContainer: { padding: 40, alignItems: 'center', justifyContent: 'center', minHeight: 150 },
    emptyText: { marginTop: 12, fontSize: 14, color: COLORS.textLight, fontWeight: '500' },
});

export default DashboardScreen;
