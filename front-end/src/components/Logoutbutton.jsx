import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAuthTokens } from '../api/authStorage';
import '../styles/Logoutbutton.css';

export default function LogoutButton({ variant = 'default' }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const navigate = useNavigate();

  function handleConfirm() {
    clearAuthTokens();
    setIsConfirming(false);
    navigate('/', { replace: true });
  }

  return (
    <>
      <button
        type="button"
        className={`logout-trigger logout-trigger--${variant}`}
        onClick={() => setIsConfirming(true)}
        aria-label="تسجيل الخروج"
      >
        <svg
          className="logout-trigger__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <span className="logout-trigger__label">
          {variant === 'square' ? 'خروج' : 'تسجيل خروج'}
        </span>
      </button>

      {isConfirming && (
        <div
          className="logout-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsConfirming(false);
          }}
        >
          <div className="logout-modal">
            <div className="logout-modal__icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
            <h2 id="logout-title" className="logout-modal__title">
              تسجيل الخروج
            </h2>
            <p className="logout-modal__text">
              سوف يتم تسجيل الخروج من حسابك، للوصول الى صفحتك سوف يتعين عليك تسجيل الدخول مرة اخرى.
            </p>
            <div className="logout-modal__actions">
              <button
                type="button"
                className="logout-modal__btn logout-modal__btn--ghost"
                onClick={() => setIsConfirming(false)}
              >
                إلغاء
              </button>
              <button
                type="button"
                className="logout-modal__btn logout-modal__btn--danger"
                onClick={handleConfirm}
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}