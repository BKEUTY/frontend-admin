import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity, Platform, useWindowDimensions, Modal, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useLanguage } from '../../../../i18n/LanguageContext';
import { COLORS, SHADOWS, SIZES } from '../../../../constants/Theme';
import { LinearGradient } from 'expo-linear-gradient';
import adminApi from '../../../../api/adminApi';
import { useFocusEffect } from '@react-navigation/native';

const DashboardScreen = ({ navigation }) => {
    const { t } = useLanguage();
    const { width } = useWindowDimensions();

    const [isLoading, setIsLoading] = useState(true);
    const [statsData, setStatsData] = useState({
        products: 0,
        users: 0,
        orders: 0,
        revenue: '0 đ'
    });
    const [topProducts, setTopProducts] = useState([]);

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const [stats, prodRes] = await Promise.all([
                adminApi.getStats(),
                adminApi.getAllProducts(0, 5)
            ]);
            
            setStatsData({
                ...stats,
                revenue: '40,689,000 đ' // Still mock revenue as backend doesn't support it yet
            });

            if (prodRes.data && prodRes.data.content) {
                setTopProducts(prodRes.data.content.map(p => ({
                    id: p.id,
                    name: p.name,
                    category: p.categoryName || 'Common',
                    price: p.variants && p.variants.length > 0 ? `${p.variants[0].price.toLocaleString()} đ` : '0 đ',
                    sold: Math.floor(Math.random() * 500) + 100 // Mock sold count for now
                })));
            }
        } catch (error) {
            console.error("Dashboard fetch error", error);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchStats();
        }, [])
    );

    const stats = [
        {
            title: t('admin_dashboard_sales'),
            value: statsData.revenue,
            icon: 'currency-usd',
            iconLib: MaterialCommunityIcons,
            trend: 8.5,
            trendType: 'up',
            colors: [COLORS.primary, COLORS.primaryHover],
            bgLight: '#fce7f3'
        },
        {
            title: t('admin_dashboard_orders'),
            value: statsData.orders.toString(),
            icon: 'shopping-bag',
            iconLib: FontAwesome5,
            trend: 5.2,
            trendType: 'up',
            colors: ['#2980b9', '#3498db'],
            bgLight: '#dbeafe'
        },
        {
            title: t('admin_dashboard_users'),
            value: statsData.users.toString(),
            icon: 'account-group',
            iconLib: MaterialCommunityIcons,
            trend: 12,
            trendType: 'up',
            colors: ['#059669', '#10b981'],
            bgLight: '#d1fae5'
        },
        {
            title: t('admin_dashboard_products'),
            value: statsData.products.toString(),
            icon: 'package-variant-closed',
            iconLib: MaterialCommunityIcons,
            trend: 3.4,
            trendType: 'up',
            colors: ['#d97706', '#f59e0b'],
            bgLight: '#fef3c7'
        }
    ];

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

                <View style={[styles.trendPill, item.trendType === 'up' ? styles.trendUp : styles.trendDown]}>
                    <Ionicons
                        name={item.trendType === 'up' ? 'trending-up' : 'trending-down'}
                        size={14}
                        color={item.trendType === 'up' ? COLORS.success : COLORS.danger}
                    />
                    <Text style={[styles.trendText, { color: item.trendType === 'up' ? COLORS.success : COLORS.danger }]}>
                        {Math.abs(item.trend)}%
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    const [actionModalVisible, setActionModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const handleLongPressProduct = (product) => {
        setSelectedProduct(product);
        setActionModalVisible(true);
    };

    const handleEditProduct = () => {
        setActionModalVisible(false);
    };

    const handleDeleteProduct = () => {
        setActionModalVisible(false);
    };

    const renderProductItem = ({ item }) => (
        <TouchableOpacity
            style={styles.productItem}
            activeOpacity={0.7}
            onLongPress={() => handleLongPressProduct(item)}
            delayLongPress={500}
        >
            <View style={styles.productIcon}>
                <MaterialCommunityIcons name="package-variant-closed" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                <View style={styles.categoryPill}>
                    <Text style={styles.categoryText}>{item.category}</Text>
                </View>
            </View>
            <View style={styles.productMeta}>
                <Text style={styles.productPrice}>{item.price}</Text>
                <Text style={styles.productSold}>{t('admin_product_sold')}: {item.sold}</Text>
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
                    <TouchableOpacity style={styles.profileBtn}>
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>A</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <View style={styles.contentContainer}>
                <View style={styles.statsGrid}>
                    {stats.map((item, index) => renderStatCard(item, index))}
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{t('admin_top_products')}</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('AdminProducts')}>
                        <Text style={styles.seeAllText}>{t('view_all')}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.tableCard}>
                    {isLoading ? (
                        <View style={{ padding: 40 }}>
                             <ActivityIndicator size="small" color={COLORS.primary} />
                        </View>
                    ) : topProducts.length > 0 ? (
                        <FlatList
                            data={topProducts}
                            renderItem={renderProductItem}
                            keyExtractor={item => item.id}
                            scrollEnabled={false}
                            ItemSeparatorComponent={() => <View style={styles.separator} />}
                        />
                    ) : (
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="package-variant-closed" size={48} color="#e2e8f0" />
                            <Text style={styles.emptyText}>{t('no_products_found')}</Text>
                        </View>
                    )}
                </View>
            </View>
            <View style={{ height: 100 }} />

            <Modal
                visible={actionModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setActionModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setActionModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {selectedProduct ? `${t('admin_product_action')}: ${selectedProduct.name}` : t('admin_product_action')}
                            </Text>
                            <TouchableOpacity onPress={() => setActionModalVisible(false)}>
                                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <TouchableOpacity style={styles.modalActionBtn} onPress={handleEditProduct}>
                                <View style={[styles.modalActionIcon, { backgroundColor: '#eff6ff' }]}>
                                    <FontAwesome5 name="edit" size={18} color={COLORS.info} />
                                </View>
                                <Text style={styles.modalActionText}>{t('edit')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.modalActionBtn, styles.modalActionBtnDanger]} onPress={handleDeleteProduct}>
                                <View style={[styles.modalActionIcon, { backgroundColor: '#fef2f2' }]}>
                                    <MaterialCommunityIcons name="delete-outline" size={20} color={COLORS.danger} />
                                </View>
                                <Text style={[styles.modalActionText, { color: COLORS.danger }]}>{t('delete')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    headerGradient: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 40,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
        marginBottom: 4,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#ffffff',
    },
    avatarPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    avatarText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 18,
    },
    contentContainer: {
        padding: 20,
        marginTop: -30,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 20,
        ...SHADOWS.light,
        marginBottom: 8,
    },
    iconWrapper: {
        width: 52,
        height: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    statValue: {
        fontSize: 22,
        fontWeight: '900',
        color: COLORS.text,
        marginBottom: 4,
        letterSpacing: -0.5,
    },
    statLabel: {
        fontSize: 13,
        color: COLORS.textSecondary,
        fontWeight: '600',
        marginBottom: 12,
    },
    trendPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 10,
        alignSelf: 'flex-start',
    },
    trendUp: {
        backgroundColor: '#f0fdf4',
    },
    trendDown: {
        backgroundColor: '#fef2f2',
    },
    trendText: {
        fontSize: 12,
        fontWeight: '800',
        marginLeft: 4,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
    },
    seeAllText: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '600',
    },
    tableCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 8,
        ...SHADOWS.medium,
    },
    productItem: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    productIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#fce7f3',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 4,
    },
    categoryPill: {
        backgroundColor: COLORS.border,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    categoryText: {
        color: COLORS.textSecondary,
        fontSize: 11,
        fontWeight: '600',
    },
    productMeta: {
        alignItems: 'flex-end',
    },
    productPrice: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.primary,
        marginBottom: 2,
    },
    productSold: {
        fontSize: 11,
        color: COLORS.textLight,
        fontWeight: '600',
    },
    separator: {
        height: 1,
        backgroundColor: COLORS.border,
        marginHorizontal: 16,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 14,
        color: COLORS.textLight,
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 24,
        width: '100%',
        maxWidth: 340,
        padding: 24,
        ...SHADOWS.medium,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
        flex: 1,
        marginRight: 12,
    },
    modalBody: {
        gap: 12,
    },
    modalActionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: COLORS.background,
        borderRadius: 16,
    },
    modalActionBtnDanger: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#fee2e2',
    },
    modalActionIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    modalActionText: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.text,
    },
});

export default DashboardScreen;
