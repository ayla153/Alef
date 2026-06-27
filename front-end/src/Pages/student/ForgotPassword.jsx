import { useState } from "react";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../../styles/sstyle/login.css";
import loginImage from "../../assets/logo_noBG.png";
import { requestPasswordReset, savePasswordResetSession } from "../../api/passwordReset";
import { getErrorMessage } from "../../utils/apiErrors";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const returnTo = location.state?.returnTo || "/login";
  const [email, setEmail] = useState(location.state?.email || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("الرجاء إدخال البريد الإلكتروني");
      return;
    }

    try {
      setLoading(true);
      const { data } = await requestPasswordReset(trimmedEmail);

      savePasswordResetSession(trimmedEmail, returnTo);

      if (data?.dev_otp) {
        setInfo(
          `وضع التطوير: رمز التحقق هو ${data.dev_otp} (يُطبع أيضاً في تيرمنال الباك إند).`,
        );
      } else {
        setInfo(
          "إذا كان البريد مسجّلاً لدينا، سيصلك رمز التحقق على الإيميل أو في تيرمنال السيرفر (وضع التطوير).",
        );
      }

      setTimeout(() => navigate("/reset-password"), data?.dev_otp ? 2500 : 1200);
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
          <img src={loginImage} className="login-image" alt="نسيت كلمة المرور" />
        </div>

        <div className="login-form-side">
          <p className="login-title">نسيت كلمة المرور؟</p>
          <p className="login-subtitle">
            أدخل بريدك الإلكتروني وسنرسل لك رمز تحقق (OTP) لإعادة تعيين كلمة المرور
          </p>

          {error && <p style={{ color: "red", fontSize: "12px" }}>{error}</p>}
          {info && <p style={{ color: "#2563eb", fontSize: "12px" }}>{info}</p>}

          <div className="login-input-wrapper">
            <label htmlFor="email" className="login-label">
              <FaEnvelope className="login-input-icon" /> البريد الإلكتروني
            </label>
            <input
              className="login-input"
              id="email"
              type="email"
              placeholder="user@gmail.com"
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            <FaArrowLeft className="login-btn-icon" />
            {loading ? "جاري الإرسال..." : "إرسال رمز التحقق"}
          </button>

          <p className="login-footer-text">
            <Link to={returnTo} className="login-signup-link">
              العودة لتسجيل الدخول
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
