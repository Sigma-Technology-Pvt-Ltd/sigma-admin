import axios from 'axios';
import { getAdminBackendUrl } from './constants';

const api = axios.create({
    baseURL: `${getAdminBackendUrl()}/api`,
});

api.interceptors.request.use(
    (config) => {
        config.baseURL = `${getAdminBackendUrl()}/api`;
        const token = localStorage.getItem('adminToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('adminToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
