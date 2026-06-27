const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const LEGACY_TOKEN_KEY = 'token';

export const SESSION_WARNING_MS = 2 * 60 * 1000;

function decodeJwtPayload(token) {
  if (!token) return null;
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getAccessToken() {
  const token =
    localStorage.getItem(ACCESS_TOKEN_KEY) ||
    localStorage.getItem(LEGACY_TOKEN_KEY);

  // لو التوكن (خصوصاً الـ legacy) مش JWT قابل لفك التشفير، اعتبره فاسد وتجاهله
  if (token && !decodeJwtPayload(token)) {
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    return null;
  }

  return token;
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getAccessTokenExpiryMs() {
  const payload = decodeJwtPayload(getAccessToken());
  if (!payload?.exp) return null;
  return payload.exp * 1000;
}

export function clearRegistrationTokens() {
  localStorage.removeItem('student_registration_token');
  localStorage.removeItem('tutor_registration_token');
  localStorage.removeItem('registration_type');
  localStorage.removeItem('studentEmail');
  localStorage.removeItem('tutorEmail');
}

export function saveAuthTokens({ access_token, refresh_token }) {
  if (access_token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, access_token);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    clearRegistrationTokens();
  }
  if (refresh_token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
  }
  window.dispatchEvent(new CustomEvent('auth:tokens-saved'));
}

export function clearAuthTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  window.dispatchEvent(new CustomEvent('auth:logged-out'));
}

export function isAuthenticated() {
  const token = getAccessToken();
  if (!token) return false;

  const expMs = getAccessTokenExpiryMs();
  // إذا ما قدرنا نتحقق من صلاحية التوكن (فاسد/غير قابل لفك التشفير)، اعتبره غير صالح
  if (!expMs) return false;

  return expMs > Date.now();
}

export function getAuthRole() {
  const payload = decodeJwtPayload(getAccessToken());
  return payload?.role ?? null;
}