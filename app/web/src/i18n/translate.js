import locales from './locales';

export const getTranslation = (key) => {
    const language = localStorage.getItem('language') || 'vi';
    const dict = locales[language] || locales['vi'];
    return dict[key] || key;
};

export default getTranslation;
