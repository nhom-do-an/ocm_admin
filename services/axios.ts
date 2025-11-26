import storage from '@/storages/storage';
import { STORAGE_KEYS } from '@/storages/storage-key';
import axios from 'axios';

const Axios = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    // withCredentials: true,
});

Axios.interceptors.request.use(
    (config) => {
        const token = storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error),
);

Axios.interceptors.response.use(
    response => response,
    async (error) => {
        return Promise.reject(error);
    },
);

export default Axios;