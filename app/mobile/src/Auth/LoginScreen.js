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
        backgroundColor: '#fff',
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 120,
        height: 60,
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#2c3e50',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: '#636e72',
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
        minHeight: 56,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#2c3e50',
    },
    eyeIcon: {
        padding: 8,
    },
    forgotPassword: {
        textAlign: 'right',
        color: '#2c3e50',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 24,
    },
    loginButton: {
        backgroundColor: '#2c3e50',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        minHeight: 56,
        justifyContent: 'center',
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '700',
    },

    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    footerText: {
        color: '#636e72',
        fontSize: 15,
    },
    footerLink: {
        color: '#2c3e50',
        fontSize: 15,
        fontWeight: '700',
    },
    adminBadge: {
        backgroundColor: '#2c3e50',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        marginBottom: 12,
    },
    adminBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },
});

export default LoginScreen;
