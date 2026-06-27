import React, { useRef, useState, useEffect, useCallback } from "react";
import "../../styles/sstyle/OTP.css";
import logo from "../../assets/logo_noBG.png";
import { useNavigate } from "react-router-dom";
import {
  sendStudentRegistrationOtp,
  confirmStudentRegistration,
} from "../../api/studentRegistration";
import {
  sendTutorRegistrationOtp,
  confirmTutorRegistration,
} from "../../api/tutorRegistration";
import { getErrorMessage } from "../../utils/apiErrors";
import { saveAuthTokens } from "../../api/authStorage";

const OTP = () => {
  const navigate = useNavigate();

  const inputsRef = useRef([]);
  const initialSendDone = useRef(false);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isSending, setIsSending] = useState(false);

  const registrationType = localStorage.getItem("registration_type");
  const email =
    registrationType === "tutor"
      ? localStorage.getItem("tutorEmail")
      : localStorage.getItem("studentEmail");

  const clearRegistrationSession = useCallback(() => {
    localStorage.removeItem("student_registration_token");
    localStorage.removeItem("tutor_registration_token");
    localStorage.removeItem("registration_type");
    localStorage.removeItem("studentEmail");
    localStorage.removeItem("tutorEmail");
  }, []);

  const sendOtp = useCallback(async () => {
    if (isSending || resendCooldown > 0) return;

    const hasToken =
      registrationType === "student"
        ? localStorage.getItem("student_registration_token")
        : localStorage.getItem("tutor_registration_token");

    if (!hasToken) {
      setStatus("error");
      setMessage("انتهت جلسة التسجيل. يرجى البدء من جديد.");
      return;
    }

    setIsSending(true);
    try {
      if (registrationType === "tutor") {
        await sendTutorRegistrationOtp();
      } else {
        await sendStudentRegistrationOtp();
      }
      setResendCooldown(60);
      setMessage("تم إرسال رمز التحقق إلى بريدك الإلكتروني");
      setStatus("idle");
    } catch (error) {
      const errMsg = getErrorMessage(error);
      setStatus("error");
      setMessage(errMsg);
      if (error.response?.status === 429) {
        setResendCooldown(60);
      }
    } finally {
      setIsSending(false);
    }
  }, [isSending, registrationType, resendCooldown]);

  useEffect(() => {
    if (!registrationType || !email) {
      navigate(
        registrationType === "tutor" ? "/create-account/step1" : "/register"
      );
      return;
    }
    if (initialSendDone.current) return;
    initialSendDone.current = true;
    sendOtp();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    setStatus("idle");
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

  const verify = async (code) => {
    if (status === "loading") return;

    setStatus("loading");
    setMessage("جاري التحقق...");

    try {
      const response =
        registrationType === "tutor"
          ? await confirmTutorRegistration(code)
          : await confirmStudentRegistration(code);

      const { access_token, refresh_token } = response.data;
      saveAuthTokens({ access_token, refresh_token });
      clearRegistrationSession();

      setStatus("success");
      setMessage("تم التحقق بنجاح");

      setTimeout(() => {
        navigate(registrationType === "tutor" ? "/dashboard" : "/home");
      }, 1000);
    } catch (error) {
      setStatus("error");
      setMessage(getErrorMessage(error));
      setTimeout(() => resetOtp(), 400);
      setTimeout(() => {
        setStatus("idle");
        if (error.response?.status !== 429) {
          setMessage("");
        }
      }, 2000);
    }
  };

  useEffect(() => {
    const code = otp.join("");
    if (code.length === 6 && status !== "loading") {
      verify(code);
    }
  }, [otp]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length === 6) verify(code);
  };

  const handleBack = (e) => {
    e.preventDefault();
    if (registrationType === "tutor") {
      navigate("/create-account/step4");
    } else {
      navigate("/register");
    }
  };

  return (
    <main className="auth-container" dir="rtl">
      <div className="otp-logo-container">
        <img src={logo} alt="logo" className="otp-logo" />
      </div>

      <div className="otp-card">
        <div className="otp-card-header">
          <h1>تحقق من الرمز</h1>
          <p className="otp-card-text">أدخل الرمز المكون من 6 أرقام المرسل إلى</p>
          <div className="email-highlight">{email || "بريدك الإلكتروني"}</div>
        </div>

        {message && <div className={`otp-message ${status}`}>{message}</div>}

        <form className="otp-form" onSubmit={handleSubmit}>
          <div className="otp-inputs">
            {otp.map((val, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength="1"
                className={`otp-input ${status}`}
                value={val}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                autoComplete="one-time-code"
                disabled={status === "loading"}
              />
            ))}
          </div>

          <button
            type="submit"
            className="otp-submit-btn"
            disabled={status === "loading" || otp.join("").length < 6}
          >
            <span>{status === "loading" ? "جاري التحقق..." : "تأكيد الرمز"}</span>
            <span className="material-symbols-outlined">verified_user</span>
          </button>
        </form>

        <div className="otp-card-footer">
          <p>
            لم يصلك الرمز؟
            <button
              type="button"
              className="resend-link"
              onClick={sendOtp}
              disabled={isSending || resendCooldown > 0}
            >
              {resendCooldown > 0
                ? `إعادة الإرسال (${resendCooldown}s)`
                : isSending
                  ? "جاري الإرسال..."
                  : "إعادة إرسال"}
            </button>
          </p>
        </div>
      </div>

      <div className="back-navigation">
        <a href="#" className="back-link" onClick={handleBack}>
          <span className="material-symbols-outlined">arrow_forward</span>
          <span>العودة</span>
        </a>
      </div>
    </main>
  );
};

export default OTP;
