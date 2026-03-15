import React from 'react';
import { View, Text, TextInput, StyleSheet, Animated } from 'react-native';
import { COLORS, SIZES } from '../../constants/Theme';

const CInput = ({
    label,
    placeholder,
    value,
    onChangeText,
    multiline = false,
    keyboardType = 'default',
    prefix,
    style,
    error = false,
    errorMessage = ''
}) => {
    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={[
                styles.inputWrapper,
                multiline && styles.textAreaWrapper,
                error && styles.errorBorder,
                prefix && { flexDirection: 'row', alignItems: 'center' }
            ]}>
                {prefix && (
                    <View style={styles.prefixContainer}>
                        {prefix}
                    </View>
                )}
                <TextInput
                    style={[styles.input, multiline && styles.textArea, prefix && { paddingLeft: 0 }]}
                    placeholder={placeholder}
                    value={value}
                    onChangeText={onChangeText}
                    placeholderTextColor="#94a3b8"
                    multiline={multiline}
                    numberOfLines={multiline ? 4 : 1}
                    textAlignVertical={multiline ? 'top' : 'center'}
                    keyboardType={keyboardType}
                />
            </View>
            {error && errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputWrapper: {
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#f1f5f9',
        paddingHorizontal: 16,
        height: 56,
        justifyContent: 'center',
        shadowColor: "#001e3c",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 1,
    },
    textAreaWrapper: {
        height: 120,
        paddingVertical: 12,
        justifyContent: 'flex-start',
    },
    input: {
        fontSize: 15,
        color: '#0f172a',
        flex: 1,
        height: '100%',
        fontWeight: '500',
    },
    textArea: {
        textAlignVertical: 'top',
        lineHeight: 22,
    },
    prefixContainer: {
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorBorder: {
        borderColor: '#ef4444',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    }
});

export default CInput;
