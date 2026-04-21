import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Dimensions, ActivityIndicator, Platform, TextInput } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useLanguage } from '../../../../i18n/LanguageContext';
import { COLORS, SHADOWS, SIZES } from '../../../../constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { useAdminOrders } from '../../../../hooks/useAdminOrders';

const { width } = Dimensions.get('window');

import { useDebounce } from '../../../../hooks/useDebounce';

const OrderListScreen = () => {
    const navigation = useNavigation();
    const { t } = useLanguage();
    const { orders, loading, refreshing, setRefreshing, fetchOrders, pagination } = useAdminOrders();
    const [searchInput, setSearchInput] = useState('');
    const debouncedSearch = useDebounce(searchInput, 500);

    useEffect(() => {
        if (debouncedSearch !== searchInput) return;
        fetchOrders(1, 10, false, debouncedSearch);
    }, [debouncedSearch]);

    useFocusEffect(
        React.useCallback(() => {
            fetchOrders(1, 10, false, searchInput);
        }, [fetchOrders])
    );

    const onRefresh = () => {
        fetchOrders(1, 10, true, searchInput);
    };

    const loadMore = () => {
        if (pagination.current < Math.ceil(pagination.total / pagination.pageSize) && !loading) {
            fetchOrders(pagination.current + 1, pagination.pageSize, false, searchInput);
        }
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
                <View style={styles.metaRow}>
                    <View style={styles.row}>
                        <Ionicons name="card-outline" size={16} color={COLORS.textLight} />
                        <Text style={styles.textValue}>{item.paymentMethod || 'COD'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Ionicons name="person-outline" size={16} color={COLORS.textLight} />
                        <Text style={styles.textValue}>{item.customerName || item.userId || t('guest')}</Text>
                    </View>
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

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={COLORS.textLight} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder={t('admin_search_placeholder')}
                    placeholderTextColor={COLORS.textLight}
                    value={searchInput}
                    onChangeText={setSearchInput}
                />
                {searchInput.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchInput('')} style={styles.clearIcon}>
                        <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
                    </TouchableOpacity>
                )}
            </View>
            
            {loading && !refreshing && pagination.current === 1 && (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            )}

            <FlatList
                data={orders}
                keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
                renderItem={renderOrderItem}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
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
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { 
        height: Platform.OS === 'ios' ? 100 : 70, 
        backgroundColor: 'white', 
        justifyContent: 'center', 
        alignItems: 'center', 
        paddingTop: Platform.OS === 'ios' ? 40 : 10,
        ...SHADOWS.light 
    },
    headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text },
    listContainer: { padding: 16, paddingBottom: 60 },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: { 
        backgroundColor: 'white', 
        borderRadius: 20, 
        padding: 16, 
        marginBottom: 16, 
        borderWidth: 1, 
        borderColor: COLORS.border,
        ...SHADOWS.light 
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    orderId: { fontSize: 17, fontWeight: '800', color: COLORS.text, marginBottom: 2 },
    orderDate: { fontSize: 12, color: COLORS.textLight, fontWeight: '500' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
    divider: { height: 1.5, backgroundColor: COLORS.border, marginVertical: 12, borderRadius: 1 },
    cardContent: { gap: 12 },
    metaRow: { flexDirection: 'row', gap: 20 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    textValue: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
    totalBox: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4, justifyContent: 'flex-end' },
    totalLabel: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
    totalValue: { fontSize: 18, fontWeight: '900', color: COLORS.primary },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
    emptyText: { marginTop: 15, fontSize: 16, color: COLORS.textLight, fontWeight: '600' },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        margin: 16,
        paddingHorizontal: 16,
        borderRadius: 16,
        height: 50,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.light,
    },
    searchIcon: {
        marginRight: 10,
    },
    clearIcon: {
        padding: 4,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: COLORS.text,
        fontWeight: '500',
    },
});

export default OrderListScreen;
