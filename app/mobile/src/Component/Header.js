import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/Theme';
import { useLanguage } from '../i18n/LanguageContext';
import { Ionicons } from '@expo/vector-icons';

const Header = () => {
    const navigation = useNavigation();
    const { language, changeLanguage } = useLanguage();

    const handleToggleLanguage = () => {
        changeLanguage(language === 'vi' ? 'en' : 'vi');
    };

    return (
        <View style={styles.headerContainer}>
            <TouchableOpacity style={styles.menuButton} activeOpacity={0.7}>
                <Ionicons name="grid-outline" size={24} color="#111827" />
            </TouchableOpacity>

            <View style={styles.logoContainer}>
                <Text style={styles.logoText}>BK ADMIN</Text>
            </View>
            <View style={styles.rightContainer}>
                <TouchableOpacity onPress={handleToggleLanguage} style={styles.langButton} activeOpacity={0.7}>
                    <View style={styles.langBadge}>
                        <Text style={styles.langText}>{language.toUpperCase()}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        height: 60,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        zIndex: 100,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    menuButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    logoContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 0,
    },
    logoText: {
        fontSize: 24,
        fontWeight: '900',
        color: COLORS.mainTitle,
        letterSpacing: 2,
        fontStyle: 'italic',
    },
    iconButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: COLORS.mainTitle,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    badgeText: {
        color: 'white',
        fontSize: 8,
        fontWeight: '900',
    },
    langButton: {
        paddingLeft: 5,
    },
    langBadge: {
        backgroundColor: '#f9fafb',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    langText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#333',
    },
});

export default Header;
