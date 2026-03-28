import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TextInput, ScrollView,
    TouchableOpacity, Alert, Platform, ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../../../constants/Theme';
import { useLanguage } from '../../../../i18n/LanguageContext';
import { useAdminPromotions } from '../../../../hooks/useAdminPromotions';

const PromotionCreateScreen = ({ navigation, route }) => {
    const { t } = useLanguage();
    const promotionId = route.params?.promotionId;
    const { createPromotion, updatePromotion, promotions, loading } = useAdminPromotions();

    const [form, setForm] = useState({
        title: '',
        description: '',
        discountValue: '',
        discountType: 'PERCENTAGE',
        maxDiscount: '0',
        startAt: new Date().toISOString().split('T')[0],
        endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        type: 'PRODUCT',
        status: 'INCOMING'
    });

    useEffect(() => {
        if (promotionId && promotions.length > 0) {
            const promo = promotions.find(p => p.id === promotionId);
            if (promo) {
                setForm({
                    title: promo.title,
                    description: promo.description,
                    discountValue: promo.discountValue.toString(),
                    discountType: promo.discountType,
                    maxDiscount: promo.maxDiscount.toString(),
                    startAt: (promo.startAt || "").split('T')[0],
                    endAt: (promo.endAt || "").split('T')[0],
                    type: promo.type || 'PRODUCT',
                    status: promo.status || 'INCOMING'
                });
            }
        }
    }, [promotionId, promotions]);

    const handleSave = async () => {
        if (!form.title || !form.discountValue) {
            Alert.alert(t('error'), 'Vui lòng điền đầy đủ các trường bắt buộc');
            return;
        }

        const data = {
            ...form,
            discountValue: parseInt(form.discountValue),
            maxDiscount: parseInt(form.maxDiscount),
            startAt: form.startAt + 'T00:00:00',
            endAt: form.endAt + 'T23:59:59',
            categoryIds: [],
            productIds: [],
            brandIds: []
        };

        let result;
        if (promotionId) {
            result = await updatePromotion(promotionId, data);
        } else {
            result = await createPromotion(data);
        }

        if (result) {
            navigation.goBack();
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {promotionId ? t('edit') : t('create_account') || 'Tạo mới'} {t('promotions')}
                </Text>
            </View>

            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>{t('promo_col_name')} *</Text>
                    <TextInput
                        style={styles.input}
                        value={form.title}
                        onChangeText={(val) => setForm({ ...form, title: val })}
                        placeholder="Nhập tên chương trình"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>{t('description')}</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={form.description}
                        onChangeText={(val) => setForm({ ...form, description: val })}
                        placeholder="Nhập mô tả chi tiết"
                        multiline
                    />
                </View>

                <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                        <Text style={styles.label}>{t('promo_col_discount')} *</Text>
                        <TextInput
                            style={styles.input}
                            value={form.discountValue}
                            onChangeText={(val) => setForm({ ...form, discountValue: val.replace(/[^0-9]/g, '') })}
                            placeholder="Giá trị"
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                        <Text style={styles.label}>Loại</Text>
                        <View style={styles.typeSelector}>
                            <TouchableOpacity 
                                style={[styles.typeBtn, form.discountType === 'PERCENTAGE' && styles.typeBtnActive]}
                                onPress={() => setForm({...form, discountType: 'PERCENTAGE'})}
                            >
                                <Text style={[styles.typeBtnText, form.discountType === 'PERCENTAGE' && styles.typeBtnTextActive]}>%</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.typeBtn, form.discountType === 'AMOUNT' && styles.typeBtnActive]}
                                onPress={() => setForm({...form, discountType: 'AMOUNT'})}
                            >
                                <Text style={[styles.typeBtnText, form.discountType === 'AMOUNT' && styles.typeBtnTextActive]}>VNĐ</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Giảm tối đa (đ)</Text>
                    <TextInput
                        style={styles.input}
                        value={form.maxDiscount}
                        onChangeText={(val) => setForm({ ...form, maxDiscount: val.replace(/[^0-9]/g, '') })}
                        placeholder="0 nếu không giới hạn"
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                        <Text style={styles.label}>Ngày bắt đầu</Text>
                        <TextInput
                            style={styles.input}
                            value={form.startAt}
                            onChangeText={(val) => setForm({ ...form, startAt: val })}
                            placeholder="YYYY-MM-DD"
                        />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                        <Text style={styles.label}>Ngày kết thúc</Text>
                        <TextInput
                            style={styles.input}
                            value={form.endAt}
                            onChangeText={(val) => setForm({ ...form, endAt: val })}
                            placeholder="YYYY-MM-DD"
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Áp dụng cho</Text>
                    <TextInput
                        style={styles.input}
                        value={form.promotionType}
                        onChangeText={(val) => setForm({ ...form, promotionType: val })}
                        placeholder="ALL, CATEGORY_ID, v.v."
                    />
                </View>

                <TouchableOpacity 
                    style={styles.saveBtn} 
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.saveBtnText}>{t('save')}</Text>
                    )}
                </TouchableOpacity>
                <View style={{height: 40}} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1e293b',
    },
    formContainer: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        color: '#64748b',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    input: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 12,
        fontSize: 15,
        color: '#1e293b',
        backgroundColor: '#f8fafc',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
    },
    typeSelector: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        overflow: 'hidden',
    },
    typeBtn: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    typeBtnActive: {
        backgroundColor: COLORS.primary || '#c2185b',
    },
    typeBtnText: {
        fontWeight: '700',
        color: '#64748b',
    },
    typeBtnTextActive: {
        color: 'white',
    },
    saveBtn: {
        backgroundColor: COLORS.primary || '#c2185b',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 10,
        ...SHADOWS.medium,
    },
    saveBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '800',
    }
});

export default PromotionCreateScreen;
