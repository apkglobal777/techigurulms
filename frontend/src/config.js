/**
 * Central Backend Configuration
 * Change BACKEND_URL here to affect the entire application.
 * 
 * Options:
 *   Local:      'http://localhost:5000'
 *   Production: 'http://13.127.138.86:5000'
 *   Render:     'https://techiguru-backend.onrender.com'
 */
// export const BACKEND_URL = 'http://13.127.138.86:5000';
export const BACKEND_URL = 'https://api.techiguru.in';
// export const BACKEND_URL = 'http://localhost:5000';

export const API_URL = `${BACKEND_URL}/api`;

/**
 * Helper: Convert any stored image path to a full URL
 */
export const getImageUrl = (url) => {
    if (!url) return null;
    if (typeof url === 'object' && url.url) return getImageUrl(url.url);
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/uploads') || url.startsWith('\\uploads')) {
        return `${BACKEND_URL}${url.replace(/\\/g, '/')}`;
    }
    return url;
};

export default { BACKEND_URL, API_URL, getImageUrl };
