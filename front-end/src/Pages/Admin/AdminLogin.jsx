import { useEffect, useState } from 'react';
import { FaEnvelope, FaLock, FaArrowLeft, FaShieldAlt } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import loginImage from '../../assets/logo_noBG.png';
import { loginAdmin } from '../../api/auth';
import { getAuthRole, isAuthenticated, saveAuthTokens } from '../../api/authStorage';
import { getErrorMessage } from '../../utils/apiErrors';
import '../../styles/Admin/AdminLogin.css';

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (getAuthRole() === 'admin' && isAuthenticated()) {
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      const response = await loginAdmin(email, password);
      const access_token =
        response.data.access_token ?? response.data.token ?? null;
      const refresh_token = response.data.refresh_token ?? null;
      saveAuthTokens({ access_token, refresh_token });
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <form className="admin-login-form" onSubmit={handleSubmit}>
        <div className="admin-login-image-side">
          <div className="admin-login-badge">
            <FaShieldAlt className="admin-login-badge-icon" />
            <span>منطقة محمية</span>
          </div>
          <img src={loginImage} className="admin-login-image" alt="ألف" />
        </div>

        <div className="admin-login-form-side">
          <p className="admin-login-eyebrow">لوحة تحكم الإدارة</p>
          <p className="admin-login-title">تسجيل دخول المسؤول</p>
          <p className="admin-login-subtitle">
            هذه الصفحة مخصّصة لفريق الإدارة فقط
          </p>

          {error && <p className="admin-login-error">{error}</p>}

          <div className="admin-login-input-wrapper">
            <label htmlFor="admin-email" className="admin-login-label">
              <FaEnvelope className="admin-login-input-icon" /> البريد الإلكتروني
            </label>
            <input
              className="admin-login-input"
              id="admin-email"
              placeholder="admin@alef.com"
              value={email}
              autoComplete="off"
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="admin-login-input-wrapper">
            <label htmlFor="admin-password" className="admin-login-label">
              <FaLock className="admin-login-input-icon" /> كلمة السِّر
            </label>
            <input
              className="admin-login-input"
              id="admin-password"
              placeholder="*******"
              value={password}
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="admin-login-button" disabled={loading}>
            <FaArrowLeft className="admin-login-btn-icon" />
            {loading ? 'جاري تسجيل الدخول...' : 'دخول لوحة الإدارة'}
          </button>

          <p className="admin-login-footer-text">
            لست مسؤولاً؟
            <Link to="/login" className="admin-login-back-link">
              العودة لتسجيل دخول الطالب
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
