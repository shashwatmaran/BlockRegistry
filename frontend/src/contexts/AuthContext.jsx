import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext({
    isAuthenticated: false,
    user: null,
    loading: true,
    login: async () => ({ success: false, error: 'Not initialized' }),
    register: async () => ({ success: false, error: 'Not initialized' }),
    logout: () => { },
});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const userData = await authAPI.getCurrentUser();
                    setUser(userData);
                    setIsAuthenticated(true);
                } catch (error) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const data = await authAPI.login(email, password);
            localStorage.setItem('access_token', data.access_token);

            const userData = await authAPI.getCurrentUser();
            localStorage.setItem('user', JSON.stringify(userData));

            setUser(userData);
            setIsAuthenticated(true);

            // Return the role so the Login page can redirect accordingly
            return { success: true, role: userData.role };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.response?.data?.detail || 'Login failed. Please try again.'
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await authAPI.register(userData);
            return { success: true, user: response };
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                error: error.response?.data?.detail || 'Registration failed. Please try again.'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
