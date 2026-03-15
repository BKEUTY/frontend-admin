import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/Theme';
import { getImageUrl } from '../../api/axiosClient';

const { width } = Dimensions.get('window');
const GRID_WIDTH = (width - 45) / 2;

const ProductCard = ({
    item,
    onPress,
    onAddToCart,
    layout = 'grid',
    showRating = true,
    showAddToCart = true
}) => {
    const isGrid = layout === 'grid';
    const cardStyle = isGrid ? styles.gridCard : styles.horizontalCard;
    const imageStyle = isGrid ? styles.gridImageContainer : styles.horizontalImageContainer;

    return (
        <TouchableOpacity
            style={cardStyle}
            onPress={onPress}
            activeOpacity={0.9}
        >
            <View style={imageStyle}>
                {item.image ? (
                    <Image 
                        source={{ uri: getImageUrl(item.image) }} 
                        style={styles.image} 
                        resizeMode="cover" 
                    />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Ionicons name="image-outline" size={40} color="#e5e7eb" />
                    </View>
                )}

                <View style={styles.badgeContainer}>
                    {item.tag && (
                        <LinearGradient
                            colors={['#ef4444', '#b91c1c']}
                            style={styles.tagBadge}
                        >
                            <Text style={styles.tagText}>{item.tag}</Text>
                        </LinearGradient>
                    )}
                    {item.discount && (
                        <LinearGradient
                            colors={['#ec4899', '#be185d']}
                            style={styles.discountBadge}
                        >
                            <Text style={styles.discountText}>-{item.discount}%</Text>
                        </LinearGradient>
                    )}
                </View>
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.brandText}>{item.brand || 'BKEUTY'}</Text>
                <Text style={styles.nameText} numberOfLines={2}>{item.name}</Text>

                {showRating && (
                    <View style={styles.ratingRow}>
                        {[...Array(5)].map((_, i) => (
                            <Ionicons key={i} name="star" size={10} color="#ffc107" />
                        ))}
                        <Text style={styles.ratingCount}>({item.ratingCount || 100})</Text>
                    </View>
                )}

                <View style={styles.priceRow}>
                    <View>
                        {item.oldPrice && <Text style={styles.oldPriceText}>{item.oldPrice}</Text>}
                        <Text style={styles.priceText}>
                            {item.minPrice ? `${item.minPrice.toLocaleString("vi-VN")}đ` : (item.price || '0đ')}
                        </Text>
                    </View>

                    {showAddToCart && onAddToCart && (
                        <TouchableOpacity style={styles.addToCartBtn} onPress={() => onAddToCart(item)}>
                            <Ionicons name="add" size={20} color="white" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    gridCard: {
        width: GRID_WIDTH,
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        overflow: 'hidden',
    },
    gridImageContainer: {
        width: '100%',
        height: 160,
        backgroundColor: '#f9f9f9',
        position: 'relative',
    },
    horizontalCard: {
        width: 160,
        marginRight: 15,
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#eee',
        padding: 0,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        overflow: 'hidden',
    },
    horizontalImageContainer: {
        width: '100%',
        height: 120,
        backgroundColor: '#f5f5f5',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f5f5f5',
    },
    badgeContainer: {
        position: 'absolute',
        top: 8,
        left: 8,
        right: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    tagBadge: {
        backgroundColor: '#d32f2f',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    tagText: {
        color: 'white',
        fontSize: 9,
        fontWeight: 'bold',
    },
    discountBadge: {
        backgroundColor: '#ff4081',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 'auto',
    },
    discountText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    infoContainer: {
        padding: 10,
        flex: 1,
        justifyContent: 'space-between',
    },
    brandText: {
        fontSize: 10,
        color: '#9ca3af',
        fontWeight: '700',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    nameText: {
        fontWeight: '600',
        fontSize: 13,
        marginBottom: 6,
        color: '#111827',
        height: 36,
        lineHeight: 18,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 2,
    },
    ratingCount: {
        fontSize: 10,
        color: '#9ca3af',
        marginLeft: 4,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 'auto',
    },
    oldPriceText: {
        fontSize: 11,
        color: '#999',
        textDecorationLine: 'line-through',
        marginBottom: 2,
    },
    priceText: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.mainTitle,
    },
    addToCartBtn: {
        backgroundColor: COLORS.mainTitle,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.mainTitle,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
});

export default ProductCard;
