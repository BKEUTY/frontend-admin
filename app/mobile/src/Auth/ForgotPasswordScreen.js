import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../i18n/LanguageContext';
import Loading from '../Component/Common/Loading';

const ForgotPasswordScreen = ({ navigation }) => {
    const { t } = useLanguage();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const MOCK_OTP = '123456';

    const handleSendOTP = () => {
        if (!email) {
            Alert.alert(t('error', 'Error'), t('email_required', 'Please enter your email!'));
            return;
        }
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            Alert.alert(t('success', 'Success'), `${t('otp_sent', 'OTP sent to')} ${email}. ${t('otp_mock', 'Mock OTP:')} ${MOCK_OTP}`);
            setStep(2);
        }, 1000);
    };

    const handleVerifyOTP = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            if (otp === MOCK_OTP) {
                Alert.alert(t('success', 'Success'), t('otp_success', 'OTP verification successful!'));
                setStep(3);
            } else {
                Alert.alert(t('error', 'Error'), t('otp_error', 'Incorrect OTP! Please try again.'));
            }
        }, 1000);
    };

    const handleResetPassword = () => {
        if (!newPassword || newPassword.length < 6) {
            Alert.alert(t('error', 'Error'), t('password_min', 'Password must be at least 6 characters!'));
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert(t('error', 'Error'), t('password_match_error', 'Passwords do not match!'));
            return;
        }
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            Alert.alert(t('success', 'Success'), t('reset_success', 'Password reset successfully!'));
            navigation.navigate('Login');
        }, 1000);
    };

    const handleResendOTP = () => {
        Alert.alert(t('info', 'Information'), `${t('otp_sent', 'OTP sent to')} ${email}. ${t('otp_mock', 'Mock OTP:')} ${MOCK_OTP}`);
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
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="arrow-back" size={24} color="#2c3e50" />
                </TouchableOpacity>

                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="key-outline" size={48} color="#2c3e50" />
                    </View>
                    <Text style={styles.title}>{t('forgot_password_title', 'Forgot Password')}</Text>
                    <Text style={styles.subtitle}>
                        {step === 1 && t('forgot_password_desc_1', 'Enter email to receive OTP')}
                        {step === 2 && t('forgot_password_desc_2', 'Enter OTP sent to email')}
                        {step === 3 && t('forgot_password_desc_3', 'Create new password')}
                    </Text>
                </View>

                <View style={styles.stepIndicator}>
                    {[1, 2, 3].map((s) => (
                        <View key={s} style={[styles.stepDot, step >= s && styles.stepDotActive]} />
                    ))}
                </View>

                <View style={styles.form}>
                    {step === 1 && (
                        <>
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
                            <TouchableOpacity
                                style={styles.button}
                                onPress={handleSendOTP}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.buttonText}>{t('send_otp', 'Send OTP')}</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <View style={styles.inputContainer}>
                                <Ionicons name="shield-checkmark-outline" size={20} color="#636e72" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder={t('otp_required', 'Enter OTP')}
                                    value={otp}
                                    onChangeText={setOtp}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                />
                            </View>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={handleVerifyOTP}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.buttonText}>{t('verify_otp', 'Verify OTP')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.resendButton}
                                onPress={handleSendOTP}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Text style={styles.resendText}>{t('resend_otp', 'Resend OTP')}</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <View style={styles.inputContainer}>
                                <Ionicons name="lock-closed-outline" size={20} color="#636e72" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder={t('new_password', 'New Password')}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
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

                            <View style={styles.inputContainer}>
                                <Ionicons name="lock-closed-outline" size={20} color="#636e72" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder={t('confirm_new_password', 'Confirm Password')}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.button}
                                onPress={handleResetPassword}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.buttonText}>{t('reset_password', 'Reset Password')}</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                <TouchableOpacity
                    style={styles.backToLogin}
                    onPress={() => navigation.navigate('Login')}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Text style={styles.backToLoginText}>{t('back_to_login', 'Back to Login')}</Text>
                </TouchableOpacity>
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
        paddingTop: 60,
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 24,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f8f9fa',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    iconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: '#e1e8f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: '#2c3e50',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 15,
        color: '#636e72',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 20,
    },
    stepIndicator: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 32,
    },
    stepDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#e0e0e0',
    },
    stepDotActive: {
        backgroundColor: '#2c3e50',
        width: 32,
    },
    form: {
        width: '100%',
        marginBottom: 32,
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
    button: {
        backgroundColor: '#2c3e50',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        minHeight: 56,
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '700',
    },
    resendButton: {
        marginTop: 16,
        alignItems: 'center',
        minHeight: 44,
        justifyContent: 'center',
    },
    resendText: {
        color: '#2c3e50',
        fontSize: 15,
        fontWeight: '600',
    },
    backToLogin: {
        alignItems: 'center',
        minHeight: 44,
        justifyContent: 'center',
    },
    backToLoginText: {
        color: '#636e72',
        fontSize: 15,
        fontWeight: '600',
    },
});

export default ForgotPasswordScreen;
