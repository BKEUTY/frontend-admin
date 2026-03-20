import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Loading from '../Component/Common/Loading';
import { useAuth } from '../Context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { COLORS, SIZES, SHADOWS } from '../constants/Theme';

const LoginScreen = ({ navigation }) => {
    const { t } = useLanguage();
    const { login, logout } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        try {
            const user = await login(email, password);
            if (user?.role === 'ADMIN') {
                navigation.replace('Main');
            } else {
                await logout();
                Alert.alert(
                    t('error', 'Error'),
                    t('error_403', 'You do not have permission to access the Admin Panel.')
                );
            }
        } catch (error) {
            console.error(error);
            Alert.alert(t('error', 'Error'), t('api_error_login', 'Login failed. Please check your credentials.'));
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loading fullscreen text={t('loading', 'Loading...')} />;
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Image
                        source={require('../Assets/Images/logo.svg')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <View style={styles.adminBadge}>
                        <Text style={styles.adminBadgeText}>MANAGEMENT ONLY</Text>
                    </View>
                    <Text style={styles.title}>{t('admin_portal', 'Admin Portal')}</Text>
                    <Text style={styles.subtitle}>{t('login_subtitle', 'Login to manage store')}</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Ionicons name="mail-outline" size={20} color="#636e72" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder={t('email_placeholder', 'Email')}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color="#636e72" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder={t('password', 'Password')}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.eyeIcon}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons
                                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                size={20}
                                color="#636e72"
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        onPress={() => navigation.navigate('ForgotPassword')}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Text style={styles.forgotPassword}>
                            {t('forgot_password', 'Forgot password?')}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleLogin}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.loginButtonText}>{t('login', 'Login')}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background2,
    },
    scrollContent: {
        flexGrow: 1,
        padding: SIZES.padding * 1.5,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 140,
        height: 70,
        marginBottom: 20,
    },
    title: {
        fontSize: 30,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderRadius: SIZES.radiusLg,
        paddingHorizontal: 16,
        marginBottom: 16,
        minHeight: 60,
        borderWidth: 1,
        borderColor: COLORS.inputBorder,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: COLORS.text,
    },
    eyeIcon: {
        padding: 8,
    },
    forgotPassword: {
        textAlign: 'right',
        color: COLORS.mainTitle,
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 24,
    },
    loginButton: {
        backgroundColor: COLORS.mainTitle,
        borderRadius: SIZES.radiusLg,
        paddingVertical: 18,
        alignItems: 'center',
        minHeight: 60,
        justifyContent: 'center',
        ...SHADOWS.medium,
    },
    loginButtonText: {
        color: COLORS.mainTitleText,
        fontSize: 18,
        fontWeight: '700',
    },
    adminBadge: {
        backgroundColor: COLORS.mainTitle,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: SIZES.radiusSm,
        marginBottom: 15,
    },
    adminBadgeText: {
        color: COLORS.mainTitleText,
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1.5,
    },
});

export default LoginScreen;
