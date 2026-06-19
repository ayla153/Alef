import axios from 'axios';

// عنوان السيرفر (Backend) - يجب استبداله بالعنوان الفعلي لديك
// الأفضل وضعه في ملف .env في جذر المشروع باسم VITE_API_BASE_URL
// مثال: VITE_API_BASE_URL=https://api.alef-platform.com
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// إرفاق التوكن المناسب تلقائياً مع كل طلب:
// - access_token: توكن الجلسة الكامل (بعد تسجيل الدخول أو إتمام التسجيل بالكامل)
// - tutor_registration_token: توكن مؤقّت يُستخدم فقط أثناء خطوات 2 و 3 من التسجيل
apiClient.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('access_token');
  const registrationToken = localStorage.getItem('tutor_registration_token');
  const token = accessToken || registrationToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default apiClient;
