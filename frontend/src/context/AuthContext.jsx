/* eslint-disable no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. Load User on Startup
    useEffect(() => {
        const loadUser = async () => {
            const userInfo = localStorage.getItem('userInfo');
            if (userInfo) {
                try {
                    const parsedUser = JSON.parse(userInfo);
                    setUser(parsedUser);
                } catch {
                    localStorage.removeItem('userInfo');
                }
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    // 2. Login
    const login = async (email, password) => {
        setError(null);
        try {
            const { data } = await api.post('/auth/login', { email, password });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || 'Login failed';
            setError(message);
            return { success: false, message };
        }
    };

    // 3. Register (legacy)
    const register = async (name, email, password, role) => {
        setError(null);
        try {
            const { data } = await api.post('/auth/register', { name, email, password, role });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return { success: true, pendingApproval: data.pendingApproval };
        } catch (err) {
            const message = err.response?.data?.message || 'Registration failed';
            setError(message);
            return { success: false, message };
        }
    };

    // 4. Send Signup OTP
    const sendSignupOTP = async (email) => {
        setError(null);
        try {
            const { data } = await api.post('/auth/send-signup-otp', { email });
            return { success: true, message: data.message };
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to send OTP';
            setError(message);
            return { success: false, message };
        }
    };

    // 5. Verify OTP & Complete Registration
    const verifyAndRegister = async (name, email, password, role, otp) => {
        setError(null);
        try {
            const { data } = await api.post('/auth/verify-register', { name, email, password, role, otp });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return { success: true, pendingApproval: data.pendingApproval };
        } catch (err) {
            const message = err.response?.data?.message || 'Verification failed';
            setError(message);
            return { success: false, message };
        }
    };

    // 6. Forgot Password — send OTP
    const forgotPassword = async (email) => {
        setError(null);
        try {
            const { data } = await api.post('/auth/forgot-password', { email });
            return { success: true, message: data.message };
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to send reset OTP';
            setError(message);
            return { success: false, message };
        }
    };

    // 7. Reset Password with OTP
    const resetPasswordWithOTP = async (email, otp, newPassword) => {
        setError(null);
        try {
            const { data } = await api.post('/auth/reset-password-otp', { email, otp, newPassword });
            return { success: true, message: data.message };
        } catch (err) {
            const message = err.response?.data?.message || 'Password reset failed';
            setError(message);
            return { success: false, message };
        }
    };

    // 8. Logout
    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
    };

    // 9. Update Profile
    const updateProfile = async (profileData) => {
        try {
            const { data } = await api.put('/auth/profile', profileData);
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return { success: true, data };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Update failed' };
        }
    };

    // 10. Get My Enrolled Courses with Progress
    const getMyEnrollments = async () => {
        try {
            const { data } = await api.get('/auth/my-enrollments');
            return { success: true, data };
        } catch (err) {
            return { success: false, data: [], message: err.response?.data?.message };
        }
    };

    return (
        <AuthContext.Provider value={{
            user, loading, error,
            login, register, logout, updateProfile, getMyEnrollments,
            sendSignupOTP, verifyAndRegister,
            forgotPassword, resetPasswordWithOTP,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
