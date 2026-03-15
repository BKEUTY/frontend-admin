import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/Theme';
import { useLanguage } from '../../i18n/LanguageContext';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const NotFoundScreen = () => {
    const { t } = useLanguage();
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <Text style={styles.errorCode}>404</Text>

            <View style={styles.content}>
                <MaterialIcons name="error-outline" size={80} color={COLORS.mainTitle} style={styles.icon} />
                <Text style={styles.title}>{t('error_404_title') || "Page Not Found"}</Text>
                <Text style={styles.desc}>
                    {t('error_404_desc') || "Sorry, the page you are looking for does not exist."}
                </Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('Home')}
                >
                    <Text style={styles.buttonText}>{t('back_to_home') || "Back to Home"}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorCode: {
        fontSize: 120,
        fontWeight: '900',
        color: COLORS.mainTitle,
        opacity: 0.1,
        position: 'absolute',
        top: '20%',
    },
    content: {
        backgroundColor: 'white',
        width: '100%',
        maxWidth: 350,
        padding: 30,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 5,
        zIndex: 1,
    },
    icon: {
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    desc: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 22,
    },
    button: {
        backgroundColor: COLORS.mainTitle,
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 25,
        shadowColor: COLORS.mainTitle,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    }
});

export default NotFoundScreen;
