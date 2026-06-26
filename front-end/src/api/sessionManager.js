import {
  SESSION_WARNING_MS,
  clearAuthTokens,
  getAccessTokenExpiryMs,
  getRefreshToken,
  saveAuthTokens,
} from './authStorage';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

let warningTimer = null;
let warnedForExpiryMs = null;

export function clearSessionTimers() {
  if (warningTimer) {
    clearTimeout(warningTimer);
    warningTimer = null;
  }
}

export function scheduleSessionWarning() {
  clearSessionTimers();

  const expiryMs = getAccessTokenExpiryMs();
  if (!expiryMs) return;

  const now = Date.now();
  if (expiryMs <= now) return;

  if (warnedForExpiryMs === expiryMs) return;

  const warnAt = expiryMs - SESSION_WARNING_MS;
  const delay = warnAt - now;

  const fireWarning = () => {
    if (getAccessTokenExpiryMs() !== expiryMs) return;
    warnedForExpiryMs = expiryMs;
    window.dispatchEvent(new CustomEvent('session:expiring-soon'));
  };

  if (delay <= 0) {
    fireWarning();
    return;
  }

  warningTimer = setTimeout(fireWarning, delay);
}

export async function refreshSessionTokens() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('missing_refresh_token');
  }

  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    throw new Error('refresh_failed');
  }

  const data = await response.json();
  saveAuthTokens(data);
  warnedForExpiryMs = null;
  scheduleSessionWarning();
  return data;
}

export function logoutSession() {
  clearSessionTimers();
  warnedForExpiryMs = null;
  clearAuthTokens();
}
