import locales from './locales';

let currentLanguage = 'vi';

export const setLanguage = (lang) => {
    if (locales[lang]) {
        currentLanguage = lang;
    }
};

export const getTranslation = (key, fallback) => {
    const dict = locales[currentLanguage] || locales['vi'];
    return dict[key] || fallback || key;
};


export default getTranslation;
