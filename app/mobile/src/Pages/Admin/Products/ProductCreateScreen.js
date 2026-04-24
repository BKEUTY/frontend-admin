import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState, useEffect } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView, Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Modal
} from 'react-native';
import { CButton, CInput } from '../../../../Component/Common';
import adminApi from '../../../../api/adminApi';
import { COLORS, SHADOWS, SIZES } from '../../../../constants/Theme';
import { useLanguage } from '../../../../i18n/LanguageContext';

const ProductCreateScreen = ({ navigation }) => {
    const { t } = useLanguage();
    const [currentStep, setCurrentStep] = useState(0);
    const [isPreview, setIsPreview] = useState(false);

    const [name, setName] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);

    const [optionTypes, setOptionTypes] = useState([
        { name: t('admin_product_color'), values: [] }
    ]);
    const [newOptionValue, setNewOptionValue] = useState('');
    const [activeOptionIndex, setActiveOptionIndex] = useState(null);

    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(false);

    const selectedCategoryName = categories.find(c => c.id === selectedCategoryId)?.categoryName || t('admin_placeholder_categories');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await adminApi.getAllCategories();
                if (res.data) setCategories(res.data);
            } catch (err) {
                console.error("Fetch categories error:", err);
            }
        };
        fetchCategories();
    }, []);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleNext = async () => {
        if (currentStep === 0) {
            if (!name) {
                Alert.alert(t('error'), t('admin_error_name_required'));
                return;
            }
            if (!selectedCategoryId) {
                Alert.alert(t('error'), t('admin_error_category_required'));
                return;
            }
            setCurrentStep(1);
        } else if (currentStep === 1) {
            setCurrentStep(2);
        } else if (currentStep === 2) {
            const validOptions = optionTypes.filter(o => o.name && o.values.length > 0);
            if (validOptions.length === 0) {
                Alert.alert(t('error'), t("admin_error_at_least_one_option"));
                return;
            }
            generateVariants(validOptions);
            setCurrentStep(3);
        } else {
            if (isPreview) {
                Alert.alert(t('info'), t('admin_preview_mode_msg'));
                return;
            }
            saveProduct();
        }
    };

    const saveProduct = async () => {
        setLoading(true);
        try {
            const productRes = await adminApi.createProduct({
                name,
                productCategories: selectedCategoryId ? [selectedCategoryId] : [],
                description,
                status: 'ACTIVE'
            });
            const productId = productRes.data.id;

            if (image) {
                await adminApi.uploadProductImage(image, productId);
            }

            const validOptions = optionTypes.filter(o => o.name && o.values.length > 0);
            for (const opt of validOptions) {
                await adminApi.createOption({
                    productId,
                    optionName: opt.name,
                    optionValues: opt.values
                });
            }

            const variantsRes = await adminApi.getVariants(productId);
            const backendVariants = variantsRes.data;

            const updates = backendVariants.map(bv => {
                const userVar = variants.find(v => bv.productVariantName.includes(v.value));
                if (userVar) {
                    return adminApi.updateVariant({
                        id: bv.id,
                        productVariantName: bv.productVariantName,
                        price: parseFloat(userVar.price) || 0,
                        stockQuantity: parseInt(userVar.stock) || 0,
                        status: 'ACTIVE'
                    });
                }
                return null;
            }).filter(u => u !== null);

            await Promise.all(updates);

            Alert.alert(t('success'), t('admin_msg_create_success'));
            navigation.goBack();
        } catch (err) {
            console.error("Save product error:", err);
            Alert.alert(t('error'), t('admin_error_create'));
        } finally {
            setLoading(false);
        }
    };

    const generateVariants = (options) => {
        if (!options || options.length === 0) return;

        const generateCombinations = (opts, index = 0, currentCombo = []) => {
            if (index === opts.length) {
                return [currentCombo.join(' - ')];
            }
            const currentOptionValues = opts[index].values;
            let combos = [];
            for (let val of currentOptionValues) {
                combos = combos.concat(generateCombinations(opts, index + 1, [...currentCombo, val]));
            }
            return combos;
        };

        const variantSuffixes = generateCombinations(options);
        const generated = variantSuffixes.map((suffix, index) => ({
            id: Date.now() + index,
            name: `${name ? name + ' - ' : ''}${suffix}`,
            price: '0',
            stock: '0',
            value: suffix
        }));

        setVariants(generated);
    };

    const handleVariantChange = (id, field, value) => {
        setVariants(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
    };

    const addOptionType = () => {
        setOptionTypes([...optionTypes, { name: '', values: [] }]);
    };

    const removeOptionType = (index) => {
        const newTypes = [...optionTypes];
        newTypes.splice(index, 1);
        setOptionTypes(newTypes);
    };

    const updateOptionName = (index, text) => {
        const newTypes = [...optionTypes];
        newTypes[index].name = text;
        setOptionTypes(newTypes);
    };

    const addOptionValue = (index) => {
        if (!newOptionValue.trim()) return;
        const newTypes = [...optionTypes];
        newTypes[index].values.push(newOptionValue.trim());
        setOptionTypes(newTypes);
        setNewOptionValue('');
    };

    const removeOptionValue = (typeIndex, valIndex) => {
        const newTypes = [...optionTypes];
        newTypes[typeIndex].values.splice(valIndex, 1);
        setOptionTypes(newTypes);
    };

    const renderGeneralStep = () => (
        <View>
            <View style={styles.card}>
                <Text style={styles.cardTitle}>
                    <Ionicons name="information-circle" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
                    {t('admin_section_general')}
                </Text>
                <CInput
                    label={t('admin_label_name')}
                    placeholder={t('admin_placeholder_product_name')}
                    value={name}
                    onChangeText={setName}
                />
                
                <TouchableOpacity
                    style={styles.categoryPickerTrigger}
                    onPress={() => setCategoryModalVisible(true)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.inputLabel}>{t('admin_label_category')}</Text>
                    <View style={styles.pickerInner}>
                        <Ionicons name="list" size={18} color={COLORS.primary} style={{ marginRight: 10 }} />
                        <Text style={[styles.pickerValue, !selectedCategoryId && { color: COLORS.textLight }]}>
                            {selectedCategoryName}
                        </Text>
                        <Ionicons name="chevron-down" size={18} color={COLORS.textLight} />
                    </View>
                </TouchableOpacity>

                <Modal
                    visible={categoryModalVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setCategoryModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.pickerModalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>{t('admin_label_category')}</Text>
                                <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                                    <Ionicons name="close" size={24} color={COLORS.textSecondary} />
                                </TouchableOpacity>
                            </View>
                            <ScrollView style={{ maxHeight: 400 }}>
                                {categories.map(cat => (
                                    <TouchableOpacity
                                        key={cat.id}
                                        style={styles.categoryItem}
                                        onPress={() => {
                                            setSelectedCategoryId(cat.id);
                                            setCategoryModalVisible(false);
                                        }}
                                    >
                                        <Text style={[styles.categoryItemText, selectedCategoryId === cat.id && styles.categoryItemTextActive]}>
                                            {cat.categoryName}
                                        </Text>
                                        {selectedCategoryId === cat.id && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>

                <CInput
                    label={t('admin_label_desc')}
                    placeholder={t('admin_placeholder_desc')}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                />
            </View>
        </View>
    );

    const renderMediaStep = () => (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>
                <Ionicons name="image" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
                {t('admin_section_media')}
            </Text>
            <TouchableOpacity style={styles.uploadBox} onPress={pickImage} activeOpacity={0.8}>
                {image ? (
                    <>
                        <Image source={{ uri: image }} style={styles.previewImage} />
                        <TouchableOpacity style={styles.removeImageBtn} onPress={() => setImage(null)}>
                            <Ionicons name="close-circle" size={24} color={COLORS.danger} />
                        </TouchableOpacity>
                    </>
                ) : (
                    <View style={styles.uploadPlaceholder}>
                        <View style={styles.uploadIconCircle}>
                            <Ionicons name="cloud-upload-outline" size={28} color={COLORS.primary} />
                        </View>
                        <Text style={styles.uploadText}>{t('admin_btn_upload')}</Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );

    const renderOptionsStep = () => (
        <View>
            <Text style={styles.sectionDesc}>{t('admin_msg_options_desc')}</Text>
            {optionTypes.map((opt, index) => (
                <View key={index} style={styles.card}>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.cardTitle}>{t('admin_label_option_name')} {index + 1}</Text>
                        {index > 0 && <TouchableOpacity onPress={() => removeOptionType(index)}>
                            <MaterialCommunityIcons name="delete-outline" size={24} color={COLORS.danger} />
                        </TouchableOpacity>}
                    </View>

                    <CInput
                        placeholder={t('admin_placeholder_option_name')}
                        value={opt.name}
                        onChangeText={(text) => updateOptionName(index, text)}
                    />

                    <Text style={styles.label}>{t('admin_values')}</Text>
                    <View style={styles.tagsContainer}>
                        {opt.values.map((val, valIdx) => (
                            <TouchableOpacity key={valIdx} style={styles.tag} onPress={() => removeOptionValue(index, valIdx)}>
                                <Text style={styles.tagText}>{val}</Text>
                                <Ionicons name="close" size={14} color={COLORS.primary} />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.addValueRow}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <CInput
                                placeholder={t('admin_placeholder_add_value')}
                                value={activeOptionIndex === index ? newOptionValue : ''}
                                onChangeText={(text) => {
                                    setActiveOptionIndex(index);
                                    setNewOptionValue(text);
                                }}
                                style={{ marginBottom: 0 }}
                            />
                        </View>
                        <CButton
                            type="primary"
                            title=""
                            icon={<Ionicons name="add" size={24} color="white" />}
                            onPress={() => addOptionValue(index)}
                            style={{ width: 48, height: 48, borderRadius: 12 }}
                        />
                    </View>
                </View>
            ))}

            <TouchableOpacity style={styles.dashedBtn} onPress={addOptionType}>
                <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
                <Text style={styles.dashedBtnText}>{t('admin_btn_add_option')}</Text>
            </TouchableOpacity>
        </View>
    );

    const renderVariantsStep = () => (
        <View>
            <Text style={styles.sectionDesc}>{t('admin_msg_variants_desc')}</Text>
            {variants.map((variant) => (
                <View key={variant.id} style={styles.variantCard}>
                    <View style={styles.variantImagePlaceholder}>
                        <MaterialCommunityIcons name="image-plus" size={24} color="#cbd5e1" />
                    </View>
                    <View style={styles.variantInfo}>
                        <Text style={styles.variantName}>{variant.name}</Text>
                        <View style={styles.variantRow}>
                            <View style={{ flex: 1 }}>
                                <CInput
                                    label={t('admin_label_price')}
                                    placeholder={t('admin_placeholder_price')}
                                    prefix={<Text style={styles.inputPrefix}>₫</Text>}
                                    keyboardType="numeric"
                                    value={variant.price}
                                    onChangeText={(val) => handleVariantChange(variant.id, 'price', val)}
                                />
                            </View>
                            <View style={{ width: 12 }} />
                            <View style={{ flex: 1 }}>
                                <CInput
                                    label={t('admin_label_stock')}
                                    placeholder={t('admin_placeholder_stock')}
                                    keyboardType="numeric"
                                    value={variant.stock}
                                    onChangeText={(val) => handleVariantChange(variant.id, 'stock', val)}
                                />
                            </View>
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('admin_product_create')}</Text>
                <TouchableOpacity onPress={() => setIsPreview(!isPreview)} style={styles.backBtn}>
                    <Ionicons name={isPreview ? "options-outline" : "eye-outline"} size={22} color={isPreview ? COLORS.primary : COLORS.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.stepperContainer}>
                <View style={styles.stepper}>
                    {[0, 1, 2, 3].map((step) => (
                        <View key={step} style={styles.stepItem}>
                            <View style={[
                                styles.stepCircle,
                                currentStep >= step ? styles.stepActive : styles.stepInactive,
                                currentStep === step && styles.stepCurrent
                            ]}>
                                {currentStep > step ? (
                                    <Ionicons name="checkmark" size={16} color="white" />
                                ) : (
                                    <View style={styles.stepIconWrapper}>
                                        {step === 0 && <Feather name="shopping-bag" size={16} color={currentStep >= step ? "white" : COLORS.textLight} />}
                                        {step === 1 && <Feather name="image" size={16} color={currentStep >= step ? "white" : COLORS.textLight} />}
                                        {step === 2 && <Feather name="settings" size={16} color={currentStep >= step ? "white" : COLORS.textLight} />}
                                        {step === 3 && <MaterialCommunityIcons name="collage" size={16} color={currentStep >= step ? "white" : COLORS.textLight} />}
                                    </View>
                                )}
                            </View>
                            {step < 3 && (
                                <View style={[
                                    styles.stepLine,
                                    currentStep > step && { backgroundColor: COLORS.primary }
                                ]} />
                            )}
                        </View>
                    ))}
                </View>
                <Text style={styles.stepLabel}>
                    {currentStep === 0 ? t('admin_step_1') :
                        currentStep === 1 ? t('admin_step_2') :
                            currentStep === 2 ? t('admin_step_3') : t('admin_step_4')}
                </Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {currentStep === 0 && renderGeneralStep()}
                {currentStep === 1 && renderMediaStep()}
                {currentStep === 2 && renderOptionsStep()}
                {currentStep === 3 && renderVariantsStep()}
            </ScrollView>

            <View style={styles.footer}>
                {currentStep > 0 && (
                    <CButton
                        type="secondary"
                        title={t('back')}
                        onPress={() => setCurrentStep(currentStep - 1)}
                        style={styles.premiumBtnSecondary}
                        fullWidth={false}
                    />
                )}
                <CButton
                    type="primary"
                    title={currentStep === 3 ? t('admin_btn_save_finish') : t('continue')}
                    onPress={handleNext}
                    loading={loading}
                    icon={<Ionicons name={currentStep === 3 ? "checkmark-circle" : "arrow-forward"} size={22} color="white" />}
                    style={styles.premiumBtnPrimary}
                />
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 50 : 40,
        paddingBottom: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        ...SHADOWS.light,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
    },
    stepperContainer: {
        backgroundColor: 'white',
        paddingBottom: 16,
        paddingTop: 8,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        ...SHADOWS.medium,
        marginBottom: 16,
        zIndex: 10,
    },
    stepper: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    stepCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: '#fff',
        zIndex: 2,
    },
    stepActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
        ...SHADOWS.medium,
        shadowColor: COLORS.primary,
    },
    stepInactive: {
        backgroundColor: COLORS.background,
        borderColor: COLORS.border,
    },
    stepCurrent: {
        transform: [{ scale: 1.1 }],
        borderColor: COLORS.primary,
        borderWidth: 2,
        backgroundColor: '#fff',
    },
    stepIconWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepLine: {
        flex: 1,
        height: 2,
        backgroundColor: COLORS.border,
        marginHorizontal: 8,
        borderRadius: 1,
    },
    stepLabel: {
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.primary,
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        ...SHADOWS.light,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textSecondary,
        marginBottom: 10,
        marginLeft: 2,
    },
    sectionDesc: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 22,
        textAlign: 'center',
        paddingHorizontal: 16,
        lineHeight: 20,
        fontWeight: '500',
    },
    categoryPickerTrigger: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    pickerInner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    pickerValue: {
        flex: 1,
        fontSize: 15,
        color: COLORS.text,
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    pickerModalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
        paddingBottom: 40,
        ...SHADOWS.medium,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    categoryItemText: {
        fontSize: 16,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    categoryItemTextActive: {
        color: COLORS.primary,
        fontWeight: '800',
    },
    uploadBox: {
        height: 160,
        backgroundColor: COLORS.background,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    uploadPlaceholder: {
        alignItems: 'center',
    },
    uploadIconCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#fdf2f8',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    uploadText: {
        color: COLORS.textSecondary,
        fontWeight: '700',
        fontSize: 14,
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    removeImageBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 16,
        padding: 4,
        ...SHADOWS.light,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fdf2f8',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
        borderWidth: 1,
        borderColor: '#fbcfe8',
    },
    tagText: {
        fontSize: 13,
        color: COLORS.primary,
        fontWeight: '700',
    },
    addValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    dashedBtn: {
        height: 56,
        borderWidth: 2,
        borderColor: COLORS.primary,
        borderStyle: 'dashed',
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#fff',
        marginBottom: 32,
    },
    dashedBtnText: {
        color: COLORS.primary,
        fontWeight: '800',
    },
    variantCard: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 16,
        marginBottom: 16,
        ...SHADOWS.light,
    },
    variantImagePlaceholder: {
        width: 60,
        height: 60,
        backgroundColor: COLORS.background,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    variantInfo: {
        flex: 1,
    },
    variantName: {
        fontSize: 15,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 12,
    },
    variantRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        gap: 12,
    },
    premiumBtnPrimary: {
        flex: 1,
        borderRadius: 16,
        height: 54,
        ...SHADOWS.medium,
        shadowColor: COLORS.primary,
    },
    premiumBtnSecondary: {
        flex: 0.4,
        borderRadius: 16,
        height: 54,
        backgroundColor: COLORS.background,
        borderColor: COLORS.border,
    },
    inputPrefix: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.textSecondary,
    }
});

export default ProductCreateScreen;
