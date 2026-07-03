import axios from 'axios';
import {
  clearAuthTokens,
  clearRegistrationTokens,
  getAccessToken,
  getRefreshToken,
  saveAuthTokens,
} from './authStorage';
import { scheduleSessionWarning } from './sessionManager';
import { getLoginPathFromLocation } from '../utils/authRedirect';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise = null;

// المسارات التي تخص عملية التسجيل (registration flow) ولازم تستخدم
// registration token دائمًا، بغض النظر عن وجود access token بالمتصفح.
// ملاحظة: '/auth/student/register' و '/auth/tutor/register' (بدون أي شيء بعدها)
// هي الـ endpoint الأول اللي بينشئ الـ pending registration، وما بيحتاج أي توكن،
// فمش مشكلة نتركه يدخل ضمن النمط لأنه ببساطة رح يبعت token = undefined/null.
const REGISTRATION_PATH_PATTERNS = [
  '/auth/student/register',
  '/auth/tutor/register',
];

function isRegistrationEndpoint(url = '') {
  return REGISTRATION_PATH_PATTERNS.some((pattern) => url.includes(pattern));
}

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
  const accessToken = getAccessToken();
  const registrationToken = getRegistrationToken();

  let token;

  if (isRegistrationEndpoint(config.url)) {
    // طلبات عملية التسجيل (send-otp / confirm / cancel...) لازم تستخدم
    // registration token دائمًا، حتى لو كان فيه access_token قديم بالمتصفح.
    token = registrationToken;
  } else {
    // أي endpoint عادي: access token له الأولوية، وإذا كان موجود
    // بنعتبر إنه ما في داعي لتوكن التسجيل بعد هلق.
    token = accessToken || registrationToken;
    if (accessToken) {
      clearRegistrationTokens();
    }
  }

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
    const isRegistrationRequest = isRegistrationEndpoint(originalRequest?.url || '');

    if (status !== 401 || !originalRequest || originalRequest._retry || isRefreshRequest) {
      return Promise.reject(error);
    }

    // طلبات التسجيل ما إلها علاقة بالـ access/refresh token flow إطلاقًا.
    // إذا فشلت بـ 401، هذا يعني إنه registration token غير صالح/منتهي،
    // ومحاولة عمل refresh لأكسس توكن عادي مالها معنى هون.
    if (isRegistrationRequest || getRegistrationToken()) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newAccessToken = await refreshAccessToken();
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch {
      clearAuthTokens();
      const loginPath = getLoginPathFromLocation();
      if (!window.location.pathname.includes(loginPath)) {
        window.location.assign(loginPath);
      }
      return Promise.reject(error);
    }
  },
);

export default apiClient;