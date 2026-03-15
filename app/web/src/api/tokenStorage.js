const TOKEN_KEY = 'bkeuty_token';

export const setAccessToken = (token) => {
    if (token) {
        sessionStorage.setItem(TOKEN_KEY, token);
    } else {
        sessionStorage.removeItem(TOKEN_KEY);
    }
};

export const getAccessToken = () => {
    return sessionStorage.getItem(TOKEN_KEY);
};

export const clearAccessToken = () => {
    sessionStorage.removeItem(TOKEN_KEY);
};