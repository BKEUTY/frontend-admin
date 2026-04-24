import React, { useState, useCallback, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, RefreshControl, TextInput, Platform
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../../../constants/Theme';
import { useLanguage } from '../../../../i18n/LanguageContext';
import { useAdminPromotions } from '../../../../hooks/useAdminPromotions';
import productApi from '../../../../api/productApi';

import { useDebounce } from '../../../../hooks/useDebounce';

const PromotionListScreen = ({ navigation }) => {
    const { t } = useLanguage();
    const [searchInput, setSearchInput] = useState('');
    const debouncedSearch = useDebounce(searchInput, 500);
    const [metadata, setMetadata] = useState({ brandNames: {}, categoryNames: {}, productNames: {} });
    const { promotions, loading, refreshing, fetchPromotions } = useAdminPromotions();

    useEffect(() => {
        const load = async () => {
            const data = await fetchPromotions(1, false, debouncedSearch);
            if (data && data.length > 0) {
                fetchMetadata(data);
            }
        };
        load();
    }, [debouncedSearch]);

    const fetchMetadata = async (promoList) => {
        const productIds = new Set();
        const categoryIds = new Set();
        const brandIds = new Set();

        promoList.forEach(p => {
            if (p.productIds) p.productIds.forEach(id => productIds.add(id));
            if (p.categoryIds) p.categoryIds.forEach(id => categoryIds.add(id));
            if (p.brandIds) p.brandIds.forEach(id => brandIds.add(id));
        });

        if (productIds.size > 0 || categoryIds.size > 0 || brandIds.size > 0) {
            try {
                const metaRes = await productApi.getPromotionMetadata({
                    productIds: Array.from(productIds),
                    categoryIds: Array.from(categoryIds),
                    brandIds: Array.from(brandIds)
                });
                if (metaRes.data) {
                    setMetadata(metaRes.data);
                }
            } catch (err) {
                console.error('Metadata fetch error:', err);
            }
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchPromotions(1, false, searchInput);
        }, [])
    );

    const onRefresh = () => {
        fetchPromotions(1, true, searchInput);
    };

    // API search is now used instead of local filter
    const filteredPromotions = promotions;

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('vi-VN').format(val) + 'đ';
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN');
    };

    const renderPromotionItem = ({ item }) => {
        const isStarting = item.status === 'STARTING';
        const isIncoming = item.status === 'INCOMING';
        const isEnded = item.status === 'ENDED' || item.status === 'DISABLED';

        return (
            <TouchableOpacity
                style={styles.promoCard}
                onPress={() => navigation.navigate('AdminPromotionCreate', { promotionId: item.id })}
                activeOpacity={0.7}
            >
                <View style={styles.promoInfo}>
                    <View style={styles.titleRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.promoId}>ID: #{item.id}</Text>
                            <Text style={styles.promoTitle} numberOfLines={1}>{item.title}</Text>
                        </View>
                        <View style={[
                            styles.statusBadge,
                            isStarting && styles.statusStarting,
                            isIncoming && styles.statusIncoming,
                            isEnded && styles.statusEnded
                        ]}>
                            <Text style={[
                                styles.statusText,
                                isStarting && styles.statusTextStarting,
                                isIncoming && styles.statusTextIncoming,
                                isEnded && styles.statusTextEnded
                            ]}>
                                {t(`promo_status_${item.status}`)}
                            </Text>
                        </View>
                    </View>
                    
                    <Text style={styles.promoDesc} numberOfLines={2}>{item.description}</Text>
                    
                    {(item.brandIds?.length > 0 || item.categoryIds?.length > 0) && (
                        <View style={styles.scopeRow}>
                            {item.brandIds?.map(id => (
                                <View key={`b-${id}`} style={styles.scopeBadge}>
                                    <Text style={styles.scopeText}>{metadata.brandNames[id] || id}</Text>
                                </View>
                            ))}
                            {item.categoryIds?.map(id => (
                                <View key={`c-${id}`} style={[styles.scopeBadge, { backgroundColor: '#f0fdf4' }]}>
                                    <Text style={[styles.scopeText, { color: '#15803d' }]}>{metadata.categoryNames[id] || id}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    <View style={styles.promoDetails}>
                        <View style={styles.detailItem}>
                            <MaterialCommunityIcons name="ticket-percent" size={16} color={COLORS.primary} />
                            <Text style={styles.detailText}>
                                {item.discountType === 'PERCENTAGE' ? `${item.discountValue}%` : formatCurrency(item.discountValue)}
                            </Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
                            <Text style={styles.detailText}>{formatDate(item.startAt)} - {formatDate(item.endAt)}</Text>
                        </View>
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{t('promotions')}</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('AdminPromotionCreate')}
                    activeOpacity={0.8}
                >
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <View style={styles.filterBar}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={18} color={COLORS.textLight} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={t('promo_search_placeholder')}
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
                <TouchableOpacity style={styles.filterButton}>
                    <Ionicons name="funnel-outline" size={20} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {loading && !refreshing ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredPromotions}
                    renderItem={renderPromotionItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="ticket-outline" size={60} color="#e2e8f0" />
                            <Text style={styles.emptyText}>{t('no_promos_found')}</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background || '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 20,
        backgroundColor: 'white',
        ...SHADOWS.light,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.text || '#1e293b',
    },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: COLORS.primary || '#c2185b',
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    filterBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        gap: 12,
        marginBottom: 8
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 16,
        borderRadius: 16,
        height: 48,
        borderWidth: 1,
        borderColor: COLORS.border || '#e2e8f0',
        ...SHADOWS.light,
    },
    filterButton: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border || '#e2e8f0',
        ...SHADOWS.light
    },
    searchIcon: {
        marginRight: 8,
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
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    promoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border || '#e2e8f0',
        ...SHADOWS.light,
    },
    promoInfo: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    promoTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text || '#1e293b',
        flex: 1,
        marginRight: 8,
    },
    promoId: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.primary,
        marginBottom: 2
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusStarting: {
        backgroundColor: '#ecfdf5',
    },
    statusIncoming: {
        backgroundColor: '#eff6ff',
    },
    statusEnded: {
        backgroundColor: '#f1f5f9',
    },
    statusText: {
        fontSize: 10,
        fontWeight: '800',
    },
    statusTextStarting: {
        color: '#059669',
    },
    statusTextIncoming: {
        color: '#2563eb',
    },
    statusTextEnded: {
        color: '#64748b',
    },
    promoDesc: {
        fontSize: 13,
        color: COLORS.textSecondary || '#64748b',
        marginBottom: 12,
        lineHeight: 18,
    },
    promoDetails: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    detailText: {
        fontSize: 12,
        color: COLORS.text || '#1e293b',
        fontWeight: '600',
        marginLeft: 4,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 15,
        color: COLORS.textLight || '#94a3b8',
        fontWeight: '500',
    }
});

export default PromotionListScreen;
