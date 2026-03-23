import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image } from 'react-native';
import { COLORS, SIZES } from '../../constants/Theme';
import { useLanguage } from '../../i18n/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { CButton, CInput } from '../../Component/Common';

const DEFAULT_AVATAR = 'https://via.placeholder.com/150';

const ProfileScreen = () => {
    const { t } = useLanguage();

    const [userData, setUserData] = useState({
        name: "Phạm Thanh Phong",
        username: "thanhphong28",
        email: "phongdeptrai28@gmail.com",
        phone: "0376929681",
        date_of_birth: "2004-08-28",
        gender: "Nam",
        address: "xã Long Phước, tỉnh Đồng Nai",
        join_date: "2026-10-20"
    });

    const handleUpdate = () => {
        alert(t('update_info_success'));
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatarMainSection}>
                    <View style={styles.avatarContainer}>
                        <Image source={{ uri: DEFAULT_AVATAR }} style={styles.avatar} />
                        <TouchableOpacity style={styles.editAvatarBadge}>
                            <Ionicons name="camera" size={14} color="white" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.nameSection}>
                        <Text style={styles.greeting}>{userData.name}</Text>
                        <Text style={styles.usernameText}>@{userData.username}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.formContainer}>
                <CInput
                    label={t('name') || "Họ và tên"}
                    value={userData.name}
                    onChangeText={(text) => setUserData({ ...userData, name: text })}
                />

                <CInput
                    label={t('username')}
                    value={userData.username}
                    style={styles.readOnlyWrapper}
                    editable={false}
                />

                <CInput
                    label={t('gender')}
                    value={userData.gender === 'Nam' ? t('male') : (userData.gender === 'Nu' ? t('female') : t('other'))}
                    onChangeText={(text) => setUserData({ ...userData, gender: text })}
                />

                <CInput
                    label="Email"
                    value={userData.email}
                    keyboardType="email-address"
                    onChangeText={(text) => setUserData({ ...userData, email: text })}
                />

                <CInput
                    label={t('phone')}
                    value={userData.phone}
                    keyboardType="phone-pad"
                    onChangeText={(text) => setUserData({ ...userData, phone: text })}
                />

                <CInput
                    label={t('dob')}
                    value={userData.date_of_birth}
                    onChangeText={(text) => setUserData({ ...userData, date_of_birth: text })}
                />

                <CInput
                    label={t('address')}
                    value={userData.address}
                    multiline
                    onChangeText={(text) => setUserData({ ...userData, address: text })}
                />

                <CInput
                    label={t('join_date')}
                    value={new Date(userData.join_date).toLocaleDateString("vi-VN")}
                    style={styles.readOnlyWrapper}
                    editable={false}
                />

                <CButton
                    title={t('update')}
                    onPress={handleUpdate}
                    style={{ marginTop: 20 }}
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        alignItems: 'center',
        paddingVertical: 30,
        backgroundColor: COLORS.background,
        paddingHorizontal: 20,
    },
    avatarMainSection: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 85,
        height: 85,
        borderRadius: 42.5,
        borderWidth: 3,
        borderColor: 'white',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    editAvatarBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.mainTitle,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    nameSection: {
        marginLeft: 20,
        flex: 1,
    },
    greeting: {
        fontSize: 22,
        fontWeight: '900',
        color: COLORS.mainTitle,
        marginBottom: 2,
    },
    usernameText: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '600',
    },
    formContainer: {
        padding: 20,
        backgroundColor: 'white',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: -10,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 13,
        color: '#94a3b8',
        marginBottom: 8,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: '#1e293b',
        fontWeight: '600',
    },
    readOnlyWrapper: {
        opacity: 0.7,
    },
});

export default ProfileScreen;
