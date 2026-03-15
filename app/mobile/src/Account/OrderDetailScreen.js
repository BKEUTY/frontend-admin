import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/Theme';
import { useLanguage } from '../../i18n/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const OrderDetailScreen = () => {
    const navigation = useNavigation();
    const { t } = useLanguage();

    const orderData = {
        id: '3354654654526',
        createdAt: '10/10/2023',
        expectedDelivery: '10/10/2023',
        status_logs: [
            { title: t('order_placed_success'), desc: t('order_placed_desc'), time: '11:45 PM', icon: 'cube-outline' },
            { title: t('preparing_order'), desc: t('preparing_order_desc'), time: '11:45 PM', icon: 'construct-outline' },
            { title: t('international_processing'), desc: t('international_processing_desc'), time: '11:45 PM', icon: 'airplane-outline' }
        ],
        subtotal: 15755,
        discount: 15755,
        shipping: 30000,
        tax: 0,
        total: 46000
    };

    const renderTimelineStep = (icon, label, date, isActive, isCompleted) => {
        return (
            <View style={styles.timelineStep}>
                <View style={styles.stepIconBoxOuter}>
                    {isActive || isCompleted ? (
                        <LinearGradient
                            colors={isActive ? [COLORS.mainTitle, COLORS.mainTitleDark || '#880e4f'] : ['#f3f4f6', '#f3f4f6']}
                            style={[styles.stepIconBox, isActive && styles.stepActiveShadow]}
                        >
                            <Ionicons
                                name={icon}
                                size={18}
                                color={isActive ? 'white' : COLORS.mainTitle}
                            />
                        </LinearGradient>
                    ) : (
                        <View style={styles.stepIconBox}>
                            <Ionicons name={icon} size={18} color="#9ca3af" />
                        </View>
                    )}
                </View>
                <View style={styles.stepContent}>
                    <Text style={[styles.stepLabel, isActive && styles.textActive]}>{label}</Text>
                    <Text style={styles.stepDate}>{date}</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('order_detail')}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.mainCard}>
                    <View style={styles.orderIdHeader}>
                        <View>
                            <Text style={styles.orderIdLabel}>{t('order_id_label')} #{orderData.id}</Text>
                            <Text style={styles.orderDate}>{t('order_time')}: {orderData.createdAt}</Text>
                        </View>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusBadgeText}>ONDELIVERY</Text>
                        </View>
                    </View>

                    <View style={styles.actionButtonsRow}>
                        <TouchableOpacity style={styles.btnInvoice}>
                            <Ionicons name="document-text-outline" size={18} color="#4b5563" />
                            <Text style={styles.btnText}>{t('invoice')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1.2 }} activeOpacity={0.8}>
                            <LinearGradient
                                colors={[COLORS.mainTitle, COLORS.mainTitleDark || '#880e4f']}
                                style={styles.btnTrack}
                            >
                                <Ionicons name="navigate-outline" size={18} color="white" />
                                <Text style={[styles.btnText, { color: 'white' }]}>{t('track_order')}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{t('shipping_timeline') || 'Shipping Timeline'}</Text>
                </View>

                <View style={styles.timelineCard}>
                    <View style={styles.timelineLine} />
                    {renderTimelineStep('card-outline', t('timeline_paid'), '10/10/2023', false, true)}
                    {renderTimelineStep('cube-outline', t('timeline_shipped'), '10/10/2023', false, true)}
                    {renderTimelineStep('bicycle-outline', t('timeline_delivering'), 'Dự kiến 12/10', true, false)}
                    {renderTimelineStep('checkmark-circle-outline', t('timeline_delivered'), '---', false, false)}
                </View>

                <View style={styles.infoGrid}>
                    <View style={styles.infoCard}>
                        <View style={styles.infoIconBox}>
                            <Ionicons name="location-outline" size={20} color={COLORS.mainTitle} />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>{t('delivery_header')}</Text>
                            <Text style={styles.infoValue} numberOfLines={2}>192/4 Lý tự trọng, Ninh Kiều, Cần Thơ</Text>
                        </View>
                    </View>

                    <View style={styles.infoCard}>
                        <View style={styles.infoIconBox}>
                            <Ionicons name="card-outline" size={20} color={COLORS.mainTitle} />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>{t('payment_header')}</Text>
                            <Text style={styles.infoValue}>Visa **5678</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>{t('order_overview')}</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>{t('subtotal')}</Text>
                        <Text style={styles.summaryValue}>{orderData.subtotal.toLocaleString()}đ</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>{t('discount')}</Text>
                        <Text style={styles.summaryValueGreen}>- {orderData.discount.toLocaleString()}đ</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>{t('shipping_fee')}</Text>
                        <Text style={styles.summaryValue}>{orderData.shipping.toLocaleString()}đ</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>{t('total')}</Text>
                        <Text style={styles.totalValue}>{orderData.total.toLocaleString()}đ</Text>
                    </View>
                </View>

                <View style={{ height: 60 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        height: 56,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    mainCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 20,
        marginBottom: 24,
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        borderWidth: 1,
        borderColor: '#f9fafb',
    },
    orderIdHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    orderIdLabel: {
        fontSize: 17,
        fontWeight: '900',
        color: '#111827',
        marginBottom: 4,
    },
    orderDate: {
        fontSize: 13,
        color: '#9ca3af',
        fontWeight: '500',
    },
    statusBadge: {
        backgroundColor: '#fff7ed',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ffedd5',
    },
    statusBadgeText: {
        color: '#ea580c',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    actionButtonsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    btnInvoice: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 48,
        borderRadius: 14,
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        gap: 8,
    },
    btnTrack: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 48,
        borderRadius: 14,
        gap: 8,
    },
    btnText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#374151',
    },
    sectionHeader: {
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#111827',
    },
    timelineCard: {
        backgroundColor: '#f9fafb',
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        position: 'relative',
    },
    timelineLine: {
        position: 'absolute',
        left: 44,
        top: 40,
        bottom: 40,
        width: 2,
        backgroundColor: '#e5e7eb',
        zIndex: 0,
    },
    timelineStep: {
        flexDirection: 'row',
        marginBottom: 24,
        alignItems: 'center',
    },
    stepIconBoxOuter: {
        width: 40,
        height: 40,
        marginRight: 20,
        zIndex: 1,
    },
    stepIconBox: {
        width: 40,
        height: 40,
        borderRadius: 14,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    stepActiveShadow: {
        elevation: 5,
        shadowColor: COLORS.mainTitle,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        borderWidth: 0,
    },
    stepContent: {
        flex: 1,
    },
    stepLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 2,
    },
    stepDate: {
        fontSize: 12,
        color: '#9ca3af',
        fontWeight: '500',
    },
    textActive: {
        color: COLORS.mainTitle,
    },
    infoGrid: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 24,
    },
    infoCard: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        alignItems: 'center',
    },
    infoIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#fff1f2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoContent: {
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: '#9ca3af',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    infoValue: {
        fontSize: 13,
        fontWeight: '700',
        color: '#374151',
        textAlign: 'center',
    },
    summaryCard: {
        backgroundColor: '#111827',
        borderRadius: 24,
        padding: 24,
        marginBottom: 40,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: '900',
        color: 'white',
        marginBottom: 20,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#9ca3af',
        fontWeight: '500',
    },
    summaryValue: {
        fontSize: 14,
        color: 'white',
        fontWeight: '700',
    },
    summaryValueGreen: {
        fontSize: 14,
        color: '#10b981',
        fontWeight: '700',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        borderStyle: 'dashed',
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '900',
        color: 'white',
    },
    totalValue: {
        fontSize: 22,
        fontWeight: '900',
        color: COLORS.mainTitle,
    },
});

export default OrderDetailScreen;
