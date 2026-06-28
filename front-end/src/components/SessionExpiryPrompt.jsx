import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  logoutSession,
  refreshSessionTokens,
  scheduleSessionWarning,
} from '../api/sessionManager';
import { getAccessToken } from '../api/authStorage';
import { getLoginPathForCurrentUser } from '../utils/authRedirect';
import '../styles/sstyle/SessionExpiryPrompt.css';

export default function SessionExpiryPrompt() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const hidePrompt = useCallback(() => {
    setVisible(false);
    setError('');
  }, []);

  const handleRenew = async () => {
    setLoading(true);
    setError('');
    try {
      await refreshSessionTokens();
      hidePrompt();
    } catch {
      setError('تعذّر تجديد الجلسة. يرجى تسجيل الدخول مجدداً.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutSession();
    hidePrompt();
    navigate('/');
  };

  useEffect(() => {
    if (getAccessToken()) {
      scheduleSessionWarning();
    }

    const onTokensSaved = () => scheduleSessionWarning();
    const onLoggedOut = () => hidePrompt();
    const onExpiringSoon = () => setVisible(true);

    window.addEventListener('auth:tokens-saved', onTokensSaved);
    window.addEventListener('auth:logged-out', onLoggedOut);
    window.addEventListener('session:expiring-soon', onExpiringSoon);

    return () => {
      window.removeEventListener('auth:tokens-saved', onTokensSaved);
      window.removeEventListener('auth:logged-out', onLoggedOut);
      window.removeEventListener('session:expiring-soon', onExpiringSoon);
    };
  }, [hidePrompt]);

  if (!visible) return null;

  return (
    <div className="session-expiry-overlay" dir="rtl">
      <div className="session-expiry-card" role="dialog" aria-modal="true" aria-labelledby="session-expiry-title">
        <div className="session-expiry-icon-wrap">
          <span className="material-symbols-outlined">schedule</span>
        </div>
        <h2 id="session-expiry-title" className="session-expiry-title">
          ستنتهي الجلسة قريباً
        </h2>
        <p className="session-expiry-message">
          بعد دقيقتين ستنتهي جلستك. هل تريد التجديد والبقاء مسجّل الدخول؟
        </p>
        {error && <p className="session-expiry-error">{error}</p>}
        <div className="session-expiry-actions">
          <button
            type="button"
            className="session-expiry-btn session-expiry-btn--primary"
            onClick={handleRenew}
            disabled={loading}
          >
            {loading ? 'جاري التجديد...' : 'نعم، جدّد الجلسة'}
          </button>
          <button
            type="button"
            className="session-expiry-btn session-expiry-btn--ghost"
            onClick={handleLogout}
            disabled={loading}
          >
            لا، تسجيل الخروج
          </button>
        </div>
      </div>
    </div>
  );
}
