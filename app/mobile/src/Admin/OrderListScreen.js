import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Dimensions, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../i18n/LanguageContext';
import { COLORS } from '../constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { useOrders } from '../hooks/useOrders';

const { width } = Dimensions.get('window');

const OrderListScreen = () => {
    const navigation = useNavigation();
    const { t } = useLanguage();
    const { orders, loading, refreshing, setRefreshing, fetchOrders, pagination } = useOrders();

    useEffect(() => {
        fetchOrders(0, 10);
    }, [fetchOrders]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders(0, 10);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PAID':
            case 'COMPLETED': return '#10b981';
            case 'UNPAID':
            case 'PENDING': return '#f59e0b';
            case 'CANCELLED': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const renderOrderItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
        >
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.orderId}>#{item.id}</Text>
                    <Text style={styles.orderDate}>{item.orderDate ? new Date(item.orderDate).toLocaleDateString() : 'N/A'}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{t(`status_${item.status?.toLowerCase()}`) || item.status}</Text>
                </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.cardContent}>
                <View style={styles.row}>
                    <Ionicons name="card-outline" size={16} color="#6b7280" />
                    <Text style={styles.textValue}>{item.paymentMethod || 'COD'}</Text>
                </View>
                <View style={styles.row}>
                    <Ionicons name="person-outline" size={16} color="#6b7280" />
                    <Text style={styles.textValue}>{item.userId || t('guest')}</Text>
                </View>
                <View style={styles.totalBox}>
                    <Text style={styles.totalLabel}>{t('total')}:</Text>
                    <Text style={styles.totalValue}>{item.total?.toLocaleString()}đ</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{t('orders')}</Text>
            </View>
            
            {loading && !refreshing && (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color={COLORS.mainTitle} />
                </View>
            )}

            <FlatList
                data={orders}
                keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
                renderItem={renderOrderItem}
                contentContainerStyle={styles.listContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.mainTitle]} />}
                ListEmptyComponent={
                    !loading && (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="documents-outline" size={60} color="#e5e7eb" />
                            <Text style={styles.emptyText}>{t('no_orders') || t('no_data')}</Text>
                        </View>
                    )
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    header: { height: 60, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
    listContainer: { padding: 15, paddingBottom: 40 },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 15, elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, borderWidth: 1, borderColor: '#f3f4f6' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    orderId: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 2 },
    orderDate: { fontSize: 12, color: '#9ca3af' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
    divider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 12 },
    cardContent: { gap: 8 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    textValue: { fontSize: 13, color: '#4b5563', fontWeight: '500' },
    totalBox: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 4 },
    totalLabel: { fontSize: 12, color: '#6b7280' },
    totalValue: { fontSize: 16, fontWeight: 'bold', color: COLORS.mainTitle },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
    emptyText: { marginTop: 15, fontSize: 16, color: '#9ca3af', fontWeight: '500' }
});

export default OrderListScreen;
