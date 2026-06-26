import { useState } from "react";
import { FaEnvelope, FaLock, FaArrowLeft, FaUserPlus } from "react-icons/fa";
import "../../styles//sstyle/login.css";
import loginImage from "../../assets/logo_noBG.png";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../api/auth";
import { getAuthRole, saveAuthTokens } from "../../api/authStorage";
import { getErrorMessage } from "../../utils/apiErrors";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    try {
      setLoading(true);

      const response = await login(email, password);

      if (response.data?.access_token) {
        saveAuthTokens(response.data);
      }

      const role = getAuthRole();
      navigate(role === "tutor" ? "/dashboard" : "/home");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
        <div className="login-image-side">
          <img src={loginImage} className="login-image" alt="تسجيل دخول" />
        </div>

        <div className="login-form-side">
          <p className="login-title">أهلاً بك في أَلِفْ</p>
          <p className="login-subtitle">
            سجّل الدخول بحسابك كطالب أو معلّم
          </p>

          {/* ERROR */}
          {error && <p style={{ color: "red", fontSize: "12px" }}>{error}</p>}

          {/* EMAIL */}
          <div className="login-input-wrapper">
            <label htmlFor="email" className="login-label">
              <FaEnvelope className="login-input-icon" /> البريد الإلكتروني
            </label>

            <input
              className="login-input"
              id="email"
              placeholder="user@gmail.com"
              value={email}
              autoComplete="off"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* PASSWORD */}
          <div className="login-input-wrapper">
            <div className="login-label-row">
              <label className="login-label" htmlFor="password">
                <FaLock className="login-input-icon" /> كلمة السِّر
              </label>

              <Link
                to="/forgot-password"
                state={{ email }}
                className="login-forgot-link"
              >
                نسيت كلمة المرور؟
              </Link>
            </div>

            <input
              className="login-input"
              id="password"
              placeholder="*******"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
            />
          </div>

          {/* BUTTON */}
          <button type="submit" className="login-button" disabled={loading}>
            <FaArrowLeft className="login-btn-icon" />

            {loading ? "جاري تسجيل الدخول..." : "تسجيل الدُّخول"}
          </button>

          {/* SIGNUP */}
          <p className="login-footer-text">
            ليس لديك حساب ؟
            <Link to="/selection" className="login-signup-link">
              <FaUserPlus className="login-link-icon" /> أنشئ حساباً
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
