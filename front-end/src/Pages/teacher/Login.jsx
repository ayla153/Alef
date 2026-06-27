import { useState } from "react";
import { FaEnvelope, FaLock, FaArrowLeft, FaUserPlus } from "react-icons/fa";
import "../../styles/tstyle/Login.css";
import signImage from "../../assets/logo_noBG.png";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/api";
import { saveAuthTokens } from "../../api/authStorage";

export default function TutorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "البريد الإلكتروني مطلوب";
    if (!emailRegex.test(email))
      return "البريد الإلكتروني غير صالح (مثال: name@domain.com)";
    if (email.length > 40) return "البريد الإلكتروني يجب ألا يتجاوز 40 حرفاً";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "كلمة السر مطلوبة";
    if (password.length < 8)
      return "كلمة السر يجب أن تتكون من 8 أحرف على الأقل";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    setErrors({ email: emailError, password: passwordError });

    if (emailError || passwordError) return;

    try {
      setLoading(true);

      const response = await api.post("/auth/tutor/login", {
        email,
        password,
      });

      const { access_token, refresh_token } = response.data;
      saveAuthTokens({ access_token, refresh_token });

      // ✅ التعديل هون
      navigate("/dashboard");
    } catch (err) {
      const errData = err.response?.data;
      let msg = "فشل تسجيل الدخول، تحقق من البريد وكلمة السر";

      if (typeof errData?.detail === "string") {
        msg = errData.detail;
      } else if (Array.isArray(errData?.detail)) {
        msg = errData.detail
          .map((e) => `${e.loc?.[e.loc.length - 1] || ""}: ${e.msg}`)
          .join("، ");
      }

      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container fade-in">
      <form className="signupform" onSubmit={handleSubmit}>
        <div className="image-side">
          <img src={signImage} className="signupimage" alt="تسجيل دخول" />
        </div>
        <div className="form-side">
          <p className="login-title">أهلاً بك في ألف</p>
          <p className="login-subtitle">الرجاء إدخال تفاصيل حسابك للمتابعة</p>

          {serverError && (
            <div
              style={{
                background: "#fee2e2",
                color: "#dc2626",
                padding: "10px 14px",
                borderRadius: "8px",
                marginBottom: "12px",
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "13px",
              }}
            >
              {serverError}
            </div>
          )}

          <div className="input-div">
            <label htmlFor="email" className="signuplable">
              <FaEnvelope className="input-icon" /> البريد الإلكتروني
            </label>
            <input
              className={`signupinput ${errors.email ? "error-input" : ""}`}
              id="email"
              placeholder="user@gmail.com"
              value={email}
              autoComplete="off"
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: "" });
              }}
            />
            {errors.email && (
              <div className="error-message">{errors.email}</div>
            )}
          </div>

          <div className="input-div">
            <div className="lableANDlink">
              <label className="signuplable" htmlFor="password">
                <FaLock className="input-icon" /> كلمة السِّر
              </label>
              <Link to="/otp" className="forgot-link">
                هل نسيت كلمة السر ؟
              </Link>
            </div>
            <input
              className={`signupinput ${errors.password ? "error-input" : ""}`}
              id="password"
              placeholder="*******"
              value={password}
              autoComplete="new-password"
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: "" });
              }}
              type="password"
            />
            {errors.password && (
              <div className="error-message">{errors.password}</div>
            )}
          </div>

          <button type="submit" className="signupbutton" disabled={loading}>
            <FaArrowLeft className="btn-icon" />
            {loading ? "جاري تسجيل الدخول..." : "تسجيل الدُّخول"}
          </button>

          <p className="haventaccount">
            ليس لديك حساب؟
            <a
              href="#"
              className="signup-prompt"
              onClick={(e) => {
                e.preventDefault();
                navigate("/selection", { state: { mode: "register" } });
              }}
            >
              <FaUserPlus className="link-icon" /> أنشئ حساباً
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}