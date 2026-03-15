import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, SIZES } from '../../constants/Theme';

const CButton = ({
    title,
    onPress,
    loading = false,
    disabled = false,
    type = 'primary',
    style,
    textStyle,
    icon,
    fullWidth = true
}) => {
    const isPrimary = type === 'primary';
    const isSecondary = type === 'secondary';
    const isOutline = type === 'outline';

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={loading || disabled}
            activeOpacity={0.8}
            style={[
                styles.btn,
                isPrimary && styles.primaryBtn,
                isSecondary && styles.secondaryBtn,
                isOutline && styles.outlineBtn,
                fullWidth && { width: '100%' },
                disabled && styles.disabledBtn,
                style
            ]}
        >
            {loading ? (
                <ActivityIndicator color={isOutline ? COLORS.mainTitle : 'white'} />
            ) : (
                <View style={styles.content}>
                    {icon}
                    <Text style={[
                        styles.btnText,
                        isOutline && { color: COLORS.mainTitle },
                        isSecondary && { color: '#64748b' },
                        textStyle
                    ]}>
                        {title}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    btn: {
        height: SIZES.buttonHeight || 56,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 14,
        paddingBottom: 14,
    },
    primaryBtn: {
        backgroundColor: COLORS.mainTitle,
        shadowColor: COLORS.mainTitle,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    secondaryBtn: {
        backgroundColor: '#f1f5f9',
    },
    outlineBtn: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: COLORS.mainTitle,
    },
    disabledBtn: {
        backgroundColor: '#e2e8f0',
        shadowOpacity: 0,
        elevation: 0,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    btnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    }
});

export default CButton;
