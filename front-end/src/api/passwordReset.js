import apiClient from './axiosClient';

const PASSWORD_RESET_EMAIL_KEY = 'password_reset_email';
const PASSWORD_RESET_TOKEN_KEY = 'password_reset_token';

export function savePasswordResetSession(email) {
  sessionStorage.setItem(PASSWORD_RESET_EMAIL_KEY, email);
}

export function savePasswordResetToken(token) {
  sessionStorage.setItem(PASSWORD_RESET_TOKEN_KEY, token);
}

export function getPasswordResetSession() {
  return {
    email: sessionStorage.getItem(PASSWORD_RESET_EMAIL_KEY) || '',
    token: sessionStorage.getItem(PASSWORD_RESET_TOKEN_KEY) || '',
  };
}

export function clearPasswordResetSession() {
  sessionStorage.removeItem(PASSWORD_RESET_EMAIL_KEY);
  sessionStorage.removeItem(PASSWORD_RESET_TOKEN_KEY);
}

export const requestPasswordReset = (email) =>
  apiClient.post('/auth/password-reset/request', { email });

export const verifyPasswordResetOtp = ({ email, otp }) =>
  apiClient.post('/auth/password-reset/verify', { email, otp });

export const completePasswordReset = ({ password_reset_token, new_password }) =>
  apiClient.post('/auth/password-reset/confirm', {
    password_reset_token,
    new_password,
  });
