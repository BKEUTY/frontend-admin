import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../../../i18n/LanguageContext';
import { COLORS, SHADOWS } from '../../../../constants/Theme';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import { useDashboard } from '../../../../hooks/useDashboard';
import dayjs from 'dayjs';

const { width } = Dimensions.get('window');

const ReportsScreen = ({ navigation }) => {
    const { t, language } = useLanguage();
    const locale = language === 'vi' ? 'vi-VN' : 'en-US';
    const { timeRange, setTimeRange, loading, dashboardData } = useDashboard('month');

    const chartData = useMemo(() => {
        if (!dashboardData?.revenueChart || dashboardData.revenueChart.length === 0) {
            return {
                labels: ['-'],
                datasets: [{ data: [0] }]
            };
        }

        // Downsample data if there are too many points for mobile
        const rawData = dashboardData.revenueChart;
        let displayData = rawData;
        if (rawData.length > 7) {
            const step = Math.ceil(rawData.length / 7);
            displayData = rawData.filter((_, i) => i % step === 0);
        }

        return {
            labels: displayData.map(c => c.date ? dayjs(c.date).format('MM/DD') : ''),
            datasets: [
                {
                    data: displayData.map(c => Number(c.revenue || 0)),
                    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Blue
                    strokeWidth: 2
                },
                {
                    data: displayData.map(c => Number(c.profit || 0)),
                    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Green
                    strokeWidth: 2
                }
            ],
            legend: [t('revenue'), t('admin_dashboard_profit')]
        };
    }, [dashboardData, t]);

    const stats = [
        {
            label: t('admin_total_revenue'),
            value: dashboardData?.overview?.totalRevenue || 0,
            suffix: t('admin_unit_vnd'),
            icon: <MaterialCommunityIcons name="currency-usd" size={24} color={COLORS.primary} />
        },
        {
            label: t('admin_dashboard_profit'),
            value: dashboardData?.overview?.totalProfit || 0,
            suffix: t('admin_unit_vnd'),
            icon: <MaterialCommunityIcons name="trending-up" size={24} color="#10b981" />
        },
        {
            label: t('admin_total_orders'),
            value: dashboardData?.overview?.totalOrders || 0,
            suffix: ` ${t('admin_unit_order')}`,
            icon: <MaterialCommunityIcons name="shopping" size={24} color="#3b82f6" />
        },
        {
            label: t('admin_total_products_sold'),
            value: dashboardData?.overview?.totalProductsSold || 0,
            suffix: ` ${t('admin_unit_product')}`,
            icon: <MaterialCommunityIcons name="package-variant" size={24} color="#f59e0b" />
        }
    ];

    const ranges = [
        { label: t('admin_report_7_days'), value: 'week' },
        { label: t('admin_report_1_month'), value: 'month' },
        { label: t('admin_report_3_months'), value: 'quarter' },
        { label: t('admin_report_1_year'), value: 'year' }
    ];

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[COLORS.primary, COLORS.primaryHover]}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('admin_home_reports_title')}</Text>
                    <View style={{ width: 24 }} />
                </View>
            </LinearGradient>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.rangeSelector}>
                    {ranges.map((r) => (
                        <TouchableOpacity
                            key={r.value}
                            style={[styles.rangeItem, timeRange === r.value && styles.rangeItemActive]}
                            onPress={() => setTimeRange(r.value)}
                        >
                            <Text style={[styles.rangeText, timeRange === r.value && styles.rangeTextActive]}>
                                {r.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
                ) : (
                    <View style={styles.content}>
                        <View style={styles.statsGrid}>
                            {stats.map((stat, i) => (
                                <View key={i} style={styles.statCard}>
                                    <View style={styles.statIcon}>{stat.icon}</View>
                                    <View>
                                        <Text style={styles.statLabel}>{stat.label}</Text>
                                        <Text style={styles.statValue}>
                                            {stat.value.toLocaleString(locale)}{stat.suffix}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>

                        <View style={styles.chartCard}>
                            <Text style={styles.cardTitle}>{t('admin_dashboard_revenue_chart')}</Text>
                            <LineChart
                                data={chartData}
                                width={width - 40}
                                height={220}
                                chartConfig={{
                                    backgroundColor: '#ffffff',
                                    backgroundGradientFrom: '#ffffff',
                                    backgroundGradientTo: '#ffffff',
                                    decimalPlaces: 0,
                                    color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
                                    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
                                    style: { borderRadius: 16 },
                                    propsForDots: { r: '4', strokeWidth: '2', stroke: '#fff' }
                                }}
                                bezier
                                style={styles.chart}
                                withInnerLines={false}
                                withOuterLines={false}
                                withVerticalLines={false}
                            />
                        </View>

                        <TouchableOpacity 
                            style={styles.exportBtn}
                            onPress={() => Alert.alert(t('info'), t('feature_developing_desc'))}
                        >
                            <LinearGradient
                                colors={[COLORS.primary, COLORS.primaryHover]}
                                style={styles.exportBtnGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <MaterialCommunityIcons name="file-excel-outline" size={24} color="white" />
                                <Text style={styles.exportBtnText}>{t('admin_export_excel')}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 },
    headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '800', color: 'white' },
    backBtn: { padding: 4 },
    scrollView: { flex: 1 },
    rangeSelector: {
        flexDirection: 'row',
        backgroundColor: 'white',
        margin: 20,
        borderRadius: 12,
        padding: 4,
        ...SHADOWS.light
    },
    rangeItem: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
    rangeItemActive: { backgroundColor: COLORS.primary },
    rangeText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
    rangeTextActive: { color: 'white' },
    content: { paddingHorizontal: 20 },
    statsGrid: { gap: 12, marginBottom: 20 },
    statCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        ...SHADOWS.light
    },
    statIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16
    },
    statLabel: { fontSize: 13, color: '#64748b', fontWeight: '500', marginBottom: 2 },
    statValue: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
    chartCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        ...SHADOWS.light
    },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 16 },
    chart: { marginVertical: 8, borderRadius: 16 },
    exportBtn: { marginBottom: 20, borderRadius: 12, overflow: 'hidden', ...SHADOWS.medium },
    exportBtnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        gap: 10
    },
    exportBtnText: { color: 'white', fontWeight: '700', fontSize: 16 }
});

export default ReportsScreen;
