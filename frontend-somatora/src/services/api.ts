import axios from "axios";
import { clearToken, readToken } from "./token-storage";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    }
})

console.log("URL DA API:", import.meta.env.VITE_API_URL);

api.interceptors.request.use((config) => {
    const token = readToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            clearToken();
            if (window.location.pathname !== "/") {
                window.location.replace("/");
            }
        }
        return Promise.reject(error);
    },
);
