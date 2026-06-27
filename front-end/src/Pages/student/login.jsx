import { useState } from "react";
import { FaEnvelope, FaLock, FaArrowLeft, FaUserPlus } from "react-icons/fa";
import "../../styles//sstyle/login.css";
import loginImage from "../../assets/logo_noBG.png";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/api";
import { saveAuthTokens } from "../../api/authStorage";

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
      const response = await api.post("/auth/student/login", { email, password });
      const access_token = response.data.access_token ?? response.data.token ?? null;
      const refresh_token = response.data.refresh_token ?? null;
      saveAuthTokens({ access_token, refresh_token });

      // ✅ التعديل هون
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "فشل تسجيل الدخول، تحقق من البيانات");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="login-image-side">
          <img src={loginImage} className="login-image" alt="تسجيل دخول" />
        </div>
        <div className="login-form-side">
          <p className="login-title">أهلاً بك في أَلِفْ</p>
          <p className="login-subtitle">الرجاء إدخال تفاصيل حسابك للمتابعة</p>

          {error && <p style={{ color: "red", fontSize: "12px" }}>{error}</p>}

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

          <div className="login-input-wrapper">
            <div className="login-label-row">
              <label className="login-label" htmlFor="password">
                <FaLock className="login-input-icon" /> كلمة السِّر
              </label>
              <Link to="/otp" className="login-forgot-link">
                نسيت كلمة المرور؟
              </Link>
            </div>
            <input
              className="login-input"
              id="password"
              placeholder="*******"
              value={password}
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
              type="password"
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            <FaArrowLeft className="login-btn-icon" />
            {loading ? "جاري تسجيل الدخول..." : "تسجيل الدُّخول"}
          </button>

          <p className="login-footer-text">
            ليس لديك حساب ؟
            <Link to="/selection" state={{ mode: "register" }} className="login-signup-link">
              <FaUserPlus className="login-link-icon" /> أنشئ حساباً
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}