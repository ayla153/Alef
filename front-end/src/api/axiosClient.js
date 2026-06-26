import axios from 'axios';
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  saveAuthTokens,
} from './authStorage';
import { scheduleSessionWarning } from './sessionManager';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise = null;

function getRegistrationToken() {
  const registrationType = localStorage.getItem('registration_type');

  if (registrationType === 'student') {
    return localStorage.getItem('student_registration_token');
  }
  if (registrationType === 'tutor') {
    return localStorage.getItem('tutor_registration_token');
  }

  return (
    localStorage.getItem('tutor_registration_token') ||
    localStorage.getItem('student_registration_token')
  );
}

async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('missing_refresh_token');
  }

  refreshPromise = axios
    .post(`${BASE_URL}/auth/refresh`, { refresh_token: refreshToken })
    .then((response) => {
      saveAuthTokens(response.data);
      scheduleSessionWarning();
      return response.data.access_token;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

apiClient.interceptors.request.use((config) => {
  const registrationToken = getRegistrationToken();
  const accessToken = getAccessToken();
  const token = registrationToken || accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const isRefreshRequest = originalRequest?.url?.includes('/auth/refresh');

    if (status !== 401 || !originalRequest || originalRequest._retry || isRefreshRequest) {
      return Promise.reject(error);
    }

    if (getRegistrationToken()) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newAccessToken = await refreshAccessToken();
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch {
      clearAuthTokens();
      if (!window.location.pathname.includes('/login')) {
        window.location.assign('/login');
      }
      return Promise.reject(error);
    }
  },
);

export default apiClient;
