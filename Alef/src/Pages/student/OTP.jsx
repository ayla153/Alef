import React, { useRef, useState, useEffect } from "react";
import "../../styles/sstyle/OTP.css";
import logo from "../../assets/logo_noBG.png";
import { useNavigate } from "react-router-dom";

const OTP = () => {
  const navigate = useNavigate();

  const inputsRef = useRef([]);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [status, setStatus] = useState("idle"); // idle | success | error
  const [message, setMessage] = useState("");

  const correctCode = "123456";

  // 🔥 تحقق تلقائي
  useEffect(() => {
    const code = otp.join("");
    if (code.length === 6) {
      verify(code);
    }
  }, [otp]);

  const handleChange = (e, index) => {
    const value = e.target.value;

    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    setStatus("idle");
    setMessage("");

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const resetOtp = () => {
    setOtp(Array(6).fill(""));
    inputsRef.current[0]?.focus();
  };

  const verify = (code) => {
    if (code === correctCode) {
      setStatus("success");
      setMessage("تم التحقق بنجاح");

      setTimeout(() => {
        navigate("/home");
      }, 1000);
    } else {
      setStatus("error");
      setMessage("رمز التحقق غير صحيح");

      // reset مع إبقاء اللون الأحمر ظاهر شوي
      setTimeout(() => {
        resetOtp();
      }, 400);

      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 1200);
    }
  };

  return (
    <main className="auth-container" dir="rtl">
      {/* 🔵 اللوجو */}
      <div className="otp-logo-container">
        <img src={logo} alt="logo" className="otp-logo" />
      </div>

      <div className="otp-card">
        <div className="otp-card-header">
          <h1>تحقق من الرمز</h1>
          <p className="otp-card-text">أدخل الرمز المكون من 6 أرقام المرسل إلى</p>
          <div className="email-highlight">user@example.com</div>
        </div>

        {/* 🔴 الرسالة */}
        {message && <div className={`otp-message ${status}`}>{message}</div>}

        <form className="otp-form" onSubmit={(e) => e.preventDefault()}>
          <div className="otp-inputs">
            {otp.map((val, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                type="text"
                maxLength="1"
                className={`otp-input ${status}`}
                value={val}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                autoComplete="one-time-code"
              />
            ))}
          </div>

          <button type="submit" className="otp-submit-btn">
            <span>تأكيد الرمز</span>
            <span className="material-symbols-outlined">verified_user</span>
          </button>
        </form>

        <div className="otp-card-footer">
          <p>
            لم يصلك الرمز؟
            <button type="button" className="resend-link">
              إعادة إرسال
            </button>
          </p>
        </div>
      </div>

      {/* 🔙 زر العودة */}
      <div className="back-navigation">
        <a href="#" className="back-link">
          <span className="material-symbols-outlined">arrow_forward</span>
          <span>العودة إلى تسجيل الدخول</span>
        </a>
      </div>
    </main>
  );
};

export default OTP;
