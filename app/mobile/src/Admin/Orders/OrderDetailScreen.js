import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SHADOWS, SIZES } from '../../../constants/Theme';
import { useLanguage } from '../../../i18n/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useOrders } from '../../../hooks/useOrders';

const { width } = Dimensions.get('window');

const OrderDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { orderId } = route.params || {};
    const { t } = useLanguage();
    const { orderDetail, detailLoading, fetchOrderDetails, updateStatus } = useOrders();

    useEffect(() => {
        if (orderId) {
            fetchOrderDetails(orderId);
        }
    }, [orderId, fetchOrderDetails]);

    if (detailLoading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!orderDetail) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Ionicons name="document-text-outline" size={60} color="#e5e7eb" />
                <Text style={{ marginTop: 15, color: COLORS.textLight, fontWeight: '600' }}>{t('no_data')}</Text>
            </View>
        );
    }

    const orderData = {
        id: orderDetail.id,
        createdAt: orderDetail.orderDate ? new Date(orderDetail.orderDate).toLocaleDateString() : 'N/A',
        status: orderDetail.status,
        subtotal: orderDetail.total || 0,
        discount: 0,
        shipping: 0,
        total: orderDetail.total || 0,
        paymentMethod: orderDetail.paymentMethod || 'COD',
        address: orderDetail.address || 'N/A',
        user: { username: orderDetail.userId || t('guest') }
    };

    const isPaid = orderData.status === 'PAID' || orderData.status === 'COMPLETED';

    const renderTimelineStep = (icon, label, date, isActive, isCompleted) => {
        return (
            <View style={styles.timelineStep}>
                <View style={styles.stepIconBoxOuter}>
                    {isActive || isCompleted ? (
                        <LinearGradient
                            colors={isActive ? [COLORS.primary, COLORS.primaryHover] : ['#f3f4f6', '#e5e7eb']}
                            style={[styles.stepIconBox, isActive && styles.stepActiveShadow]}
                        >
                            <Ionicons
                                name={icon}
                                size={18}
                                color={isActive ? 'white' : COLORS.primary}
                            />
                        </LinearGradient>
                    ) : (
                        <View style={styles.stepIconBox}>
                            <Ionicons name={icon} size={18} color={COLORS.textLight} />
                        </View>
                    )}
                </View>
                <View style={styles.stepContent}>
                    <Text style={[styles.stepLabel, isActive && styles.textActive]}>{label}</Text>
                    <Text style={styles.stepDate}>{date || '---'}</Text>
                </View>
            </View>
        );
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PAID':
            case 'COMPLETED': return COLORS.success;
            case 'UNPAID':
            case 'PENDING': return COLORS.warning;
            case 'CANCELLED': return COLORS.danger;
            default: return COLORS.textSecondary;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('order_detail')}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.mainCard}>
                    <View style={styles.orderIdHeader}>
                        <View>
                            <Text style={styles.orderIdLabel}>{t('order_id')} #{orderData.id}</Text>
                            <Text style={styles.orderDate}>{t('admin_date')}: {orderData.createdAt}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(orderData.status) + '15' }]}>
                            <Text style={[styles.statusBadgeText, { color: getStatusColor(orderData.status) }]}>{t(`status_${orderData.status?.toLowerCase()}`) || orderData.status}</Text>
                        </View>
                    </View>

                    <View style={styles.actionButtonsRow}>
                        {orderData.status === 'PENDING' && (
                            <>
                                <TouchableOpacity 
                                    style={[styles.btnAction, { borderColor: COLORS.danger }]} 
                                    onPress={() => updateStatus(orderData.id, 'CANCELLED')}
                                >
                                    <Ionicons name="close-circle-outline" size={18} color={COLORS.danger} />
                                    <Text style={[styles.btnText, { color: COLORS.danger }]}>{t('cancel')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.btnAction, { backgroundColor: COLORS.success, borderColor: COLORS.success }]} 
                                    onPress={() => updateStatus(orderData.id, 'COMPLETED')}
                                >
                                    <Ionicons name="checkmark-circle-outline" size={18} color="white" />
                                    <Text style={[styles.btnText, { color: 'white' }]}>{t('confirm')}</Text>
                                </TouchableOpacity>
                            </>
                        )}
                        {orderData.status === 'UNPAID' && (
                            <>
                                <TouchableOpacity 
                                    style={[styles.btnAction, { borderColor: COLORS.danger }]} 
                                    onPress={() => updateStatus(orderData.id, 'CANCELLED')}
                                >
                                    <Ionicons name="close-circle-outline" size={18} color={COLORS.danger} />
                                    <Text style={[styles.btnText, { color: COLORS.danger }]}>{t('cancel')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.btnAction, { backgroundColor: COLORS.success, borderColor: COLORS.success }]} 
                                    onPress={() => updateStatus(orderData.id, 'PAID')}
                                >
                                    <Ionicons name="cash-outline" size={18} color="white" />
                                    <Text style={[styles.btnText, { color: 'white' }]}>{t('confirm')}</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{t('customer_info')}</Text>
                </View>
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Ionicons name="person-outline" size={18} color={COLORS.textSecondary} />
                        <Text style={styles.infoText}>{orderData.user?.username}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={18} color={COLORS.textSecondary} />
                        <Text style={styles.infoText}>{orderData.address}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="card-outline" size={18} color={COLORS.textSecondary} />
                        <Text style={styles.infoText}>{orderData.paymentMethod}</Text>
                    </View>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{t('order_info')}</Text>
                </View>

                <View style={styles.timelineCard}>
                    <View style={styles.timelineLine} />
                    {renderTimelineStep('cart-outline', t('status_pending'), orderData.createdAt, false, true)}
                    {renderTimelineStep('cash-outline', t('status_paid'), isPaid ? orderData.createdAt : '', false, isPaid)}
                    {renderTimelineStep('bicycle-outline', t('timeline_delivering'), '', orderData.status === 'PENDING', false)}
                    {renderTimelineStep('checkmark-circle-outline', t('status_completed'), orderData.status === 'COMPLETED' ? orderData.createdAt : '', false, orderData.status === 'COMPLETED')}
                </View>

                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>{t('total')}</Text>
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
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, height: Platform.OS === 'ios' ? 100 : 70, paddingTop: Platform.OS === 'ios' ? 40 : 10, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: COLORS.border, ...SHADOWS.light },
    backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '800', color: COLORS.text },
    content: { flex: 1, padding: 16 },
    mainCard: { backgroundColor: 'white', borderRadius: 24, padding: 20, marginBottom: 24, borderWidht: 1, borderColor: COLORS.border, ...SHADOWS.medium },
    orderIdHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    orderIdLabel: { fontSize: 18, fontWeight: '900', color: COLORS.text, marginBottom: 4 },
    orderDate: { fontSize: 13, color: COLORS.textLight, fontWeight: '500' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
    statusBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
    actionButtonsRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
    btnAction: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 44, borderRadius: 12, borderWidth: 1.5, gap: 8 },
    btnText: { fontSize: 13, fontWeight: '800' },
    sectionHeader: { marginBottom: 16, paddingHorizontal: 4 },
    sectionTitle: { fontSize: 18, fontWeight: '900', color: COLORS.text },
    infoCard: { backgroundColor: 'white', borderRadius: 24, padding: 20, marginBottom: 24, ...SHADOWS.light },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
    infoText: { fontSize: 14, color: COLORS.textSecondary, flex: 1, fontWeight: '500' },
    timelineCard: { backgroundColor: 'white', borderRadius: 24, padding: 24, marginBottom: 24, ...SHADOWS.light },
    timelineLine: { position: 'absolute', left: 44, top: 40, bottom: 40, width: 2, backgroundColor: COLORS.border, zIndex: 0 },
    timelineStep: { flexDirection: 'row', marginBottom: 24, alignItems: 'center' },
    stepIconBoxOuter: { width: 40, height: 40, marginRight: 20, zIndex: 1 },
    stepIconBox: { width: 40, height: 40, borderRadius: 14, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
    stepActiveShadow: { ...SHADOWS.medium, shadowColor: COLORS.primary, shadowOpacity: 0.3, borderWidth: 0 },
    stepContent: { flex: 1 },
    stepLabel: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
    stepDate: { fontSize: 12, color: COLORS.textLight, fontWeight: '500' },
    textActive: { color: COLORS.primary },
    summaryCard: { backgroundColor: '#111827', borderRadius: 28, padding: 24, marginBottom: 40, ...SHADOWS.medium },
    summaryTitle: { fontSize: 17, fontWeight: '900', color: 'white', marginBottom: 22 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
    summaryLabel: { fontSize: 14, color: '#9ca3af', fontWeight: '500' },
    summaryValue: { fontSize: 14, color: 'white', fontWeight: '700' },
    summaryValueGreen: { fontSize: 14, color: COLORS.success, fontWeight: '700' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18, paddingTop: 18, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.14)', borderStyle: 'dashed' },
    totalLabel: { fontSize: 18, fontWeight: '900', color: 'white' },
    totalValue: { fontSize: 24, fontWeight: '900', color: COLORS.primary }
});

export default OrderDetailScreen;
