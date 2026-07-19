import axios, { AxiosError } from "axios";
import { clearAdminAccessToken, getAdminAccessToken } from "./authStorage";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAdminAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const requestUrl = error.config?.url ?? "";
    const isLoginRequest = requestUrl.includes("/admin/auth/login");

    if (error.response?.status === 401 && !isLoginRequest) {
      clearAdminAccessToken();
      unauthorizedHandler?.();
    }

    return Promise.reject(error);
  },
);
