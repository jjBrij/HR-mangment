import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = authService.getCurrentUser();
        setUser(user);
        setLoading(false);
    }, []);
    const login = async (userId, password) => {
        const data = await authService.login(userId, password);
        setUser(data.user);
        return data;
    };
    const logout = () => {
        authService.logout();
        setUser(null);
    };
    const value = {
        user,
        loading,
        login,
        logout,
        isAdminOrHR: authService.isAdminOrHR(),
        isEmployee: authService.isEmployee(),
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};