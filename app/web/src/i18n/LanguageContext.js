import React, { createContext, useState, useContext } from 'react';
import locales from './locales';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('vi');

    const t = (key, fallback) => {
        const dict = locales[language] || locales['vi'];
        return dict[key] || fallback || key;
    };


    const changeLanguage = (lang) => {
        if (locales[lang]) {
            setLanguage(lang);
            localStorage.setItem('language', lang);
        }
    };

    React.useEffect(() => {
        const savedLang = localStorage.getItem('language');
        if (savedLang && locales[savedLang]) {
            setLanguage(savedLang);
        }
    }, []);

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
