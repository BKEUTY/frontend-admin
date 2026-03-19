import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import authApi from '../api/authApi';
import { 
    setAccessToken, 
    clearAccessToken, 
    getAccessToken, 
    getUserSession, 
    setUserSession, 
    clearUserSession 
} from '../api/tokenStorage';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const decodeToken = (token) => {
    if (!token || typeof token !== 'string' || !token.includes('.')) return {};
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return {};
    }
};

const extractUserFromToken = (accessToken) => {
    const userData = decodeToken(accessToken);
    const userRole = userData.user_role || (userData.realm_access?.roles?.includes('ADMIN') ? 'ADMIN' : 'UNKNOWN');
    const role = userRole.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'UNKNOWN';

    return {
        id: userData.sub,
        email: userData.email,
        name: userData.name || userData.preferred_username,
        user_role: role
    };
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => getUserSession());
    const [isInitializing, setIsInitializing] = useState(true);

    const refreshAccessToken = useCallback(async () => {
        try {
            const response = await authApi.refresh();
            const accessToken = response.data?.accessToken || response.data?.access_token || response.data?.data?.accessToken;
            
            if (!accessToken) throw new Error('No access token returned');
            
            const newUser = extractUserFromToken(accessToken);
            if (newUser.user_role !== 'ADMIN') {
                clearAccessToken();
                clearUserSession();
                setUser(null);
                return false;
            }

            setAccessToken(accessToken);
            setUserSession(newUser);
            setUser(newUser);
            
            return true;
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 400) {
                clearAccessToken();
                clearUserSession();
                setUser(null);
                return false;
            }
            return true; 
        }
    }, []);

    useEffect(() => {
        const initAuth = async () => {
            if (getUserSession() || getAccessToken()) {
                await refreshAccessToken();
            }
            setIsInitializing(false);
        };
        initAuth();
    }, [refreshAccessToken]);

    const login = async (email, password) => {
        const response = await authApi.login({ username: email, password });
        const accessToken = response.data?.accessToken || response.data?.access_token || response.data?.data?.accessToken;
        
        const newUser = extractUserFromToken(accessToken);
        
        if (newUser.user_role !== 'ADMIN') {
            throw new Error('Access Denied: Only Admin allowed');
        }

        setAccessToken(accessToken);
        setUserSession(newUser);
        setUser(newUser);
        
        return newUser;
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch (error) {
        } finally {
            setUser(null);
            clearAccessToken();
            clearUserSession();
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user && !!getAccessToken(),
            user_role: user?.user_role,
            isInitializing,
            login,
            logout,
            refreshAccessToken
        }}>
            {!isInitializing && children}
        </AuthContext.Provider>
    );
};