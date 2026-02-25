import axios from 'axios';

// const backendapiurl = process.env.backend-api-url || 'http://localhost:5000/api';
const api = axios.create({
    // baseURL: 'http://13.127.138.86:5000/api', 
    // baseURL: 'https://techiguru-backend.onrender.com/api', // Matches your backend port
    baseURL: 'http://localhost:5000/api',
});

// --- REQUEST INTERCEPTOR ---
// Automatically adds the Token to the header of every request
api.interceptors.request.use(
    (config) => {
        // Get user info from local storage
        const userInfo = localStorage.getItem('userInfo') 
            ? JSON.parse(localStorage.getItem('userInfo')) 
            : null;
        
        if (userInfo && userInfo.token) {
            config.headers.Authorization = `Bearer ${userInfo.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --- RESPONSE INTERCEPTOR ---
// Handle 401 Unauthorized errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Optional: Auto-logout on token expiration
            // localStorage.removeItem('userInfo');
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;