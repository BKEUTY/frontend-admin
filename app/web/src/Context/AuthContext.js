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
    if (!token || typeof token !== 'string' || !token.includes('.')) return null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
};

const extractAdminUserFromToken = (accessToken) => {
    const decodedPayload = decodeToken(accessToken);
    if (!decodedPayload) throw new Error("Invalid token payload");

    if (decodedPayload.user_role !== 'admin') {
        throw new Error('Access Denied: You do not have Admin privileges.');
    }

    return {
        id: decodedPayload.sub,
        email: decodedPayload.email,
        name: decodedPayload.name,
        user_role: decodedPayload.user_role
    };
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => getUserSession());
    const [isInitializing, setIsInitializing] = useState(true);

    const handleSessionCleanup = useCallback(() => {
        clearAccessToken();
        clearUserSession();
        setUser(null);
    }, []);

    useEffect(() => {
        const initAuth = () => {
            const token = getAccessToken();
            const session = getUserSession();

            if (!token || !session) {
                handleSessionCleanup();
            } else {
                setUser(session);
            }
            setIsInitializing(false);
        };
        initAuth();
    }, [handleSessionCleanup]);

    const login = async (username, password) => {
        const response = await authApi.login({ username, password });
        const accessToken = response.data.accessToken;
        
        if (!accessToken) throw new Error('Login failed: No access token');

        const adminUser = extractAdminUserFromToken(accessToken);

        setAccessToken(accessToken);
        setUserSession(adminUser);
        setUser(adminUser);
        
        return adminUser;
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch (error) {
            console.error(error);
        } finally {
            handleSessionCleanup();
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user && !!getAccessToken(),
            user_role: user?.user_role,
            isInitializing,
            login,
            logout
        }}>
            {!isInitializing && children}
        </AuthContext.Provider>
    );
};
