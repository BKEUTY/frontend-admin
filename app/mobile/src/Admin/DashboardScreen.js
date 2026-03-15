import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity, Platform, useWindowDimensions, Modal } from 'react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useLanguage } from '../../i18n/LanguageContext';
import { COLORS } from '../../constants/Theme';
import { LinearGradient } from 'expo-linear-gradient';

const DashboardScreen = () => {
    const { t } = useLanguage();
    const { width } = useWindowDimensions();

    const stats = [
        {
            title: t('admin_dashboard_sales'),
            value: '40,689,000 đ',
            icon: 'currency-usd',
            iconLib: MaterialCommunityIcons,
            trend: 8.5,
            trendType: 'up',
            colors: ['#c2185b', '#e91e63'],
            bgLight: '#fce7f3'
        },
        {
            title: t('admin_dashboard_orders'),
            value: '1,250',
            icon: 'shopping-bag',
            iconLib: FontAwesome5,
            trend: 5.2,
            trendType: 'up',
            colors: ['#2980b9', '#3498db'],
            bgLight: '#dbeafe'
        },
        {
            title: t('admin_dashboard_appointments'),
            value: '600',
            icon: 'calendar-check',
            iconLib: MaterialCommunityIcons,
            trend: 12,
            trendType: 'up',
            colors: ['#059669', '#10b981'],
            bgLight: '#d1fae5'
        },
        {
            title: t('admin_dashboard_users'),
            value: '128',
            icon: 'account-group',
            iconLib: MaterialCommunityIcons,
            trend: 2.4,
            trendType: 'down',
            colors: ['#d97706', '#f59e0b'],
            bgLight: '#fef3c7'
        }
    ];

    const products = [
        { id: '1', name: 'Anti-Aging Cream', category: 'Skincare', price: '1,200,000 đ', sold: 342 },
        { id: '2', name: 'Matte Lipstick', category: 'Makeup', price: '450,000 đ', sold: 215 },
        { id: '3', name: 'Vitamin C Serum', category: 'Skincare', price: '890,000 đ', sold: 189 },
        { id: '4', name: 'Rose Water Toner', category: 'Toner', price: '320,000 đ', sold: 156 },
        { id: '5', name: 'Sunscreen SPF 50', category: 'Sunscreen', price: '550,000 đ', sold: 120 },
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
                        color={item.trendType === 'up' ? '#059669' : '#dc2626'}
                    />
                    <Text style={[styles.trendText, { color: item.trendType === 'up' ? '#059669' : '#dc2626' }]}>
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
        // navigation.navigate('AdminProductCreate', { productId: selectedProduct.id });
    };

    const handleDeleteProduct = () => {
        setActionModalVisible(false);
        // Handle delete logic
    };

    const renderProductItem = ({ item }) => (
        <TouchableOpacity
            style={styles.productItem}
            activeOpacity={0.7}
            onLongPress={() => handleLongPressProduct(item)}
            delayLongPress={500}
        >
            <View style={styles.productIcon}>
                <MaterialCommunityIcons name="package-variant-closed" size={24} color={COLORS.mainTitle} />
            </View>
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                <View style={styles.categoryPill}>
                    <Text style={styles.categoryText}>{item.category}</Text>
                </View>
            </View>
            <View style={styles.productMeta}>
                <Text style={styles.productPrice}>{item.price}</Text>
                <Text style={styles.productSold}>{t('sold_count')}: {item.sold}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <LinearGradient
                colors={[COLORS.mainTitle, '#e91e63']}
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
                    <TouchableOpacity>
                        <Text style={styles.seeAllText}>{t('view_all')}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.tableCard}>
                    {products.length > 0 ? (
                        <FlatList
                            data={products}
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
                                <Ionicons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <TouchableOpacity style={styles.modalActionBtn} onPress={handleEditProduct}>
                                <View style={[styles.modalActionIcon, { backgroundColor: '#eff6ff' }]}>
                                    <FontAwesome5 name="edit" size={18} color="#3b82f6" />
                                </View>
                                <Text style={styles.modalActionText}>{t('edit')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.modalActionBtn, styles.modalActionBtnDanger]} onPress={handleDeleteProduct}>
                                <View style={[styles.modalActionIcon, { backgroundColor: '#fef2f2' }]}>
                                    <MaterialCommunityIcons name="delete-outline" size={20} color="#ef4444" />
                                </View>
                                <Text style={[styles.modalActionText, { color: '#ef4444' }]}>{t('delete')}</Text>
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
        backgroundColor: '#f8f9fa',
    },
    headerGradient: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 30,
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
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    avatarText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 18,
    },
    contentContainer: {
        padding: 20,
        marginTop: -20,
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
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 4,
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
        fontSize: 24,
        fontWeight: '900',
        color: '#0f172a',
        marginBottom: 6,
        letterSpacing: -0.5,
    },
    statLabel: {
        fontSize: 14,
        color: '#64748b',
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
    trendLabel: {
        fontSize: 10,
        marginLeft: 4,
        color: '#94a3b8',
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
        color: '#1a1a1a',
    },
    seeAllText: {
        fontSize: 14,
        color: COLORS.mainTitle,
        fontWeight: '600',
    },
    tableCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    productItem: {
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
    },
    productIcon: {
        width: 40,
        height: 40,
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
        color: '#1e293b',
        marginBottom: 4,
    },
    categoryPill: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    categoryText: {
        color: '#64748b',
        fontSize: 11,
        fontWeight: '600',
    },
    productMeta: {
        alignItems: 'flex-end',
    },
    productPrice: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.mainTitle,
        marginBottom: 2,
    },
    productSold: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '500',
    },
    separator: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginHorizontal: 18,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 220,
        backgroundColor: '#fafafa',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        borderStyle: 'dashed',
    },
    emptyText: {
        marginTop: 12,
        fontSize: 14,
        color: '#94a3b8',
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
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
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
        backgroundColor: '#f8fafc',
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
        color: '#334155',
    },
});

export default DashboardScreen;
