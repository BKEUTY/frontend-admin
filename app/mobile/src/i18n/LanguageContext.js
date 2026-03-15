import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import locales from './locales';
import { setLanguage as setGlobalLanguage } from './translate';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('vi');
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const initLanguage = async () => {
            try {
                const savedLang = await AsyncStorage.getItem('language');
                if (savedLang && locales[savedLang]) {
                    setLanguage(savedLang);
                    setGlobalLanguage(savedLang);
                }
            } catch (error) {
                console.error('Error loading language:', error);
            } finally {
                setIsReady(true);
            }
        };
        initLanguage();
    }, []);

    const t = useCallback((key, fallback) => {
        const dict = locales[language] || locales['vi'];
        return dict[key] || fallback || key;
    }, [language]);

    const changeLanguage = useCallback(async (lang) => {
        if (locales[lang]) {
            setLanguage(lang);
            setGlobalLanguage(lang);
            try {
                await AsyncStorage.setItem('language', lang);
            } catch (error) {
                console.error('Error saving language:', error);
            }
        }
    }, []);

    const value = useMemo(() => ({
        language,
        changeLanguage,
        t,
        isReady
    }), [language, changeLanguage, t, isReady]);

    if (!isReady) return null;

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
