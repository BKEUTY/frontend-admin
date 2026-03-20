const TOKEN_KEY = 'bkeuty_admin_token';
const REFRESH_TOKEN_KEY = 'bkeuty_admin_refresh_token';
const USER_KEY = 'bkeuty_admin_user';

export const setAccessToken = (token) => {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
};

export const getAccessToken = () => {
    return sessionStorage.getItem(TOKEN_KEY);
};

export const clearAccessToken = () => {
    sessionStorage.removeItem(TOKEN_KEY);
};

export const setRefreshToken = (token) => {
    if (token) sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
    else sessionStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const getRefreshToken = () => {
    return sessionStorage.getItem(REFRESH_TOKEN_KEY);
};

export const clearRefreshToken = () => {
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const setUserSession = (user) => {
    if (user) sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    else sessionStorage.removeItem(USER_KEY);
};

export const getUserSession = () => {
    const user = sessionStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
};

export const clearUserSession = () => {
    sessionStorage.removeItem(USER_KEY);
};