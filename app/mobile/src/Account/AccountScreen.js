import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import { COLORS } from '../constants/Theme';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../i18n/LanguageContext';
import Header from '../Component/Header';
import { useAuth } from '../Context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

import { LinearGradient } from 'expo-linear-gradient';

const AccountScreen = () => {
    const navigation = useNavigation();
    const { t, changeLanguage, language } = useLanguage();

    const { user, logout, isAuthenticated } = useAuth();

    const mainFeatures = isAuthenticated ? [
        { id: 'info', iconName: 'person-outline', title: t('account'), route: 'Profile', color: '#6366f1' },
        { id: 'dashboard', iconName: 'bar-chart-outline', title: t('admin_dashboard_title'), route: 'AdminDashboard', color: '#10b981' },
    ] : [];


    const supportItems = [];

    const handlePress = (item) => {
        if (item.route) {
            navigation.navigate(item.route);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigation.navigate('Login');
    };

    const toggleLang = () => {
        const next = language === 'vi' ? 'en' : 'vi';
        changeLanguage(next);
    };

    return (
        <View style={styles.container}>
            <Header />
            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {isAuthenticated && user ? (
                    <LinearGradient
                        colors={[COLORS.mainTitle, COLORS.mainTitleDark || '#880e4f']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.profileHeader}
                    >
                        <View style={styles.headerContent}>
                            <View style={styles.avatarSection}>
                                {user.avatar ? (
                                    <Image source={{ uri: user.avatar }} style={styles.avatar} />
                                ) : (
                                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                        <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
                                    </View>
                                )}
                                <TouchableOpacity style={styles.editAvatarBtn}>
                                    <Ionicons name="camera" size={16} color="white" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.userInfo}>
                                <Text style={styles.username}>{user.name}</Text>
                                <View style={styles.membershipBadge}>
                                    <Ionicons name="shield-checkmark" size={12} color="#fbc531" />
                                    <Text style={styles.membershipText}>ADMINISTRATOR</Text>
                                </View>
                            </View>
                        </View>
                    </LinearGradient>
                ) : (
                    <View style={styles.guestContainer}>
                        <LinearGradient
                            colors={['#fff1f2', '#fff']}
                            style={styles.guestCard}
                        >
                            <Ionicons name="person-circle-outline" size={60} color={COLORS.mainTitle} />
                            <Text style={styles.guestTitle}>{t('welcome_landing') || 'Welcome'}</Text>
                            <Text style={styles.guestSubtitle}>{t('login_subtitle') || 'Login to continue'}</Text>
                            <View style={styles.guestButtons}>
                                <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ flex: 1 }}>
                                    <LinearGradient
                                        colors={[COLORS.mainTitle, COLORS.mainTitleDark || '#880e4f']}
                                        style={styles.loginBtn}
                                    >
                                        <Text style={styles.loginBtnText}>{t('login')}</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    </View>
                )}

                {isAuthenticated && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t('dashboard')}</Text>
                        <View style={styles.bentoGrid}>
                            {mainFeatures.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.bentoCard}
                                    onPress={() => handlePress(item)}
                                    activeOpacity={0.8}
                                >
                                    <View style={[styles.cardIconContainer, { backgroundColor: item.color + '15' }]}>
                                        <Ionicons name={item.iconName} size={24} color={item.color} />
                                    </View>
                                    <Text style={styles.cardTitle}>{item.title}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('settings')}</Text>
                    <View style={styles.menuSection}>
                        {supportItems.map(item => (
                            <TouchableOpacity key={item.id} style={styles.menuItem} onPress={() => handlePress(item)}>
                                <Text style={styles.menuItemText}>{item.title}</Text>
                                <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity style={styles.menuItem} onPress={toggleLang}>
                            <Text style={styles.menuItemText}>{t('language')}</Text>
                            <View style={styles.langBadge}>
                                <Text style={styles.langBadgeText}>
                                    {language === 'vi' ? 'VI' : 'EN'}
                                </Text>
                                <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
                            </View>
                        </TouchableOpacity>

                        {isAuthenticated && (
                            <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
                                <Text style={[styles.menuItemText, styles.logoutText]}>{t('logout')}</Text>
                                <Ionicons name="log-out-outline" size={18} color="#ef4444" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        flex: 1,
    },
    profileHeader: {
        padding: 30,
        paddingTop: 40,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        marginBottom: 30,
        elevation: 10,
        shadowColor: COLORS.mainTitle,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarSection: {
        position: 'relative',
        marginRight: 20,
    },
    avatar: {
        width: 85,
        height: 85,
        borderRadius: 42.5,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    avatarPlaceholder: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
    },
    editAvatarBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#10b981',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    userInfo: {
        flex: 1,
    },
    username: {
        fontSize: 24,
        fontWeight: '900',
        color: 'white',
        marginBottom: 6,
    },
    membershipBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginBottom: 10,
        gap: 6,
    },
    membershipText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },
    guestContainer: {
        paddingHorizontal: 20,
        marginTop: 20,
        marginBottom: 30,
    },
    guestCard: {
        borderRadius: 30,
        padding: 30,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    guestTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#111827',
        marginTop: 15,
        marginBottom: 8,
    },
    guestSubtitle: {
        fontSize: 15,
        color: '#6b7280',
        marginBottom: 30,
        textAlign: 'center',
    },
    guestButtons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    loginBtn: {
        height: 52,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginBtnText: {
        color: 'white',
        fontWeight: '800',
        fontSize: 16,
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#111827',
        marginBottom: 20,
        letterSpacing: -0.5,
    },
    bentoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15,
    },
    bentoCard: {
        width: (width - 55) / 2,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: '#f3f4f6',
    },
    cardIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#374151',
    },
    menuSection: {
        backgroundColor: '#f9fafb',
        borderRadius: 24,
        padding: 10,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 15,
    },
    menuItemText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#4b5563',
    },
    langBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    langBadgeText: {
        fontSize: 12,
        fontWeight: '800',
        color: COLORS.mainTitle,
        backgroundColor: '#fff1f2',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    logoutItem: {
        marginTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        paddingTop: 20,
    },
    logoutText: {
        color: '#ef4444',
    },
});

export default AccountScreen;
