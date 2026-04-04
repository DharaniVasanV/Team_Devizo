import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
        setLoading(false);
    }, [token]);

    const login = async (phone, password) => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { phone, password });
            const { token, user, swiggyVerification } = res.data;
            // Merge swiggy verification into user object
            const enrichedUser = { ...user, swiggyVerification };
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(enrichedUser));
            setToken(token);
            setUser(enrichedUser);
            return { success: true, swiggyVerification };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const register = async (userData) => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, userData);
            const { token, user, swiggyVerification } = res.data;
            const enrichedUser = { ...user, swiggyVerification };
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(enrichedUser));
            setToken(token);
            setUser(enrichedUser);
            return { success: true, swiggyVerification };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
