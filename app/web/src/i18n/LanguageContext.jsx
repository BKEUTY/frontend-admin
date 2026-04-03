import React, { createContext, useState, useContext, useCallback } from 'react';
import locales from './locales';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        const savedLang = localStorage.getItem('language');
        return (savedLang && locales[savedLang]) ? savedLang : 'vi';
    });

    const t = useCallback((key, fallback) => {
        const dict = locales[language] || locales['vi'];
        return dict[key] || fallback || key;
    }, [language]);

    const changeLanguage = useCallback((lang) => {
        if (locales[lang]) {
            setLanguage(lang);
            localStorage.setItem('language', lang);
        }
    }, []);

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
