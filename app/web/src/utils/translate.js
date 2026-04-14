import locales from '@/assets/locales';

export const getTranslation = (key, fallback) => {
    const lang = localStorage.getItem('language') || 'vi';
    const dict = locales[lang] || locales['vi'];
    return dict[key] || fallback || key;
};
