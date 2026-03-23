import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'bkeuty_admin_token';
const REFRESH_TOKEN_KEY = 'bkeuty_admin_refresh_token';
const USER_KEY = 'bkeuty_admin_user';

export const setAccessToken = async (token) => {
    if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
    else await AsyncStorage.removeItem(TOKEN_KEY);
};

export const getAccessToken = async () => {
    return await AsyncStorage.getItem(TOKEN_KEY);
};

export const clearAccessToken = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
};

export const setRefreshToken = async (token) => {
    if (token) await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
    else await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const getRefreshToken = async () => {
    return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
};

export const clearRefreshToken = async () => {
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const setUserSession = async (user) => {
    if (user) await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    else await AsyncStorage.removeItem(USER_KEY);
};

export const getUserSession = async () => {
    const user = await AsyncStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
};

export const clearUserSession = async () => {
    await AsyncStorage.removeItem(USER_KEY);
};
