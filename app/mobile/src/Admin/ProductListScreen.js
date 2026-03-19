import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    Image, ActivityIndicator, RefreshControl, TextInput
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/Theme';
import { useLanguage } from '../i18n/LanguageContext';
import adminApi from '../api/adminApi';
import { getImageUrl } from '../api/axiosClient';

const ProductListScreen = ({ navigation }) => {
    const { t } = useLanguage();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchProducts = async (pageNum = 0, isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else if (pageNum === 0) setLoading(true);

        try {
            const res = await adminApi.getAllProducts(pageNum, 10);
            if (res.data) {
                if (isRefresh || pageNum === 0) {
                    setProducts(res.data.content || []);
                } else {
                    setProducts(prev => [...prev, ...(res.data.content || [])]);
                }
                setTotalPages(res.data.totalPages || 0);
                setPage(pageNum);
            }
        } catch (error) {
            console.error("Fetch products error:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchProducts(0);
        }, [])
    );

    const onRefresh = () => {
        fetchProducts(0, true);
    };

    const loadMore = () => {
        if (page < totalPages - 1 && !loading) {
            fetchProducts(page + 1);
        }
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderProductItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.productCard}
            onPress={() => navigation.navigate('AdminProductCreate', { productId: item.id })}
        >
            <View style={styles.productImageContainer}>
                {item.image ? (
                    <Image source={{ uri: getImageUrl(item.image) }} style={styles.productImage} />
                ) : (
                    <MaterialCommunityIcons name="image-off" size={30} color="#cbd5e1" />
                )}
            </View>
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.productCategory}>{item.categoryName || t('all_products')}</Text>
                <View style={styles.productMeta}>
                    <Text style={styles.productPrice}>
                        {item.variants && item.variants.length > 0 
                            ? `${item.variants[0].price.toLocaleString()}đ` 
                            : '0đ'}
                    </Text>
                    <View style={styles.stockBadge}>
                        <Text style={styles.stockText}>
                            {t('stock')}: {item.variants ? item.variants.reduce((sum, v) => sum + v.stockQuantity, 0) : 0}
                        </Text>
                    </View>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{t('products')}</Text>
                <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => navigation.navigate('AdminProductCreate')}
                >
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder={t('search')}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {loading && page === 0 ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.mainTitle} />
                </View>
            ) : (
                <FlatList
                    data={filteredProducts}
                    renderItem={renderProductItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.mainTitle]} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="package-variant" size={60} color="#e2e8f0" />
                            <Text style={styles.emptyText}>{t('no_products_found')}</Text>
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
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: 'white',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#0f172a',
    },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: COLORS.mainTitle,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: COLORS.mainTitle,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        margin: 16,
        paddingHorizontal: 16,
        borderRadius: 16,
        height: 50,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#1e293b',
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    productCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    productImageContainer: {
        width: 70,
        height: 70,
        borderRadius: 12,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        overflow: 'hidden',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 4,
    },
    productCategory: {
        fontSize: 13,
        color: '#64748b',
        marginBottom: 8,
    },
    productMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    productPrice: {
        fontSize: 15,
        fontWeight: '800',
        color: COLORS.mainTitle,
    },
    stockBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
    },
    stockText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#475569',
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
        color: '#94a3b8',
        fontWeight: '500',
    }
});

export default ProductListScreen;
