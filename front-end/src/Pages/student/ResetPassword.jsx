import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/sstyle/OTP.css";
import logo from "../../assets/logo_noBG.png";
import {
  clearPasswordResetSession,
  completePasswordReset,
  getPasswordResetSession,
  requestPasswordReset,
  savePasswordResetToken,
  verifyPasswordResetOtp,
} from "../../api/passwordReset";
import { getErrorMessage } from "../../utils/apiErrors";

export default function ResetPassword() {
  const navigate = useNavigate();
  const inputsRef = useRef([]);
  const verifyingRef = useRef(false);

  const { email, token: savedToken } = getPasswordResetSession();

  const [step, setStep] = useState(savedToken ? "password" : "otp");
  const [resetToken, setResetToken] = useState(savedToken || "");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const resendOtp = useCallback(async () => {
    if (isSending || resendCooldown > 0 || !email) return;

    setIsSending(true);
    try {
      await requestPasswordReset(email);
      setResendCooldown(60);
      setOtp(Array(6).fill(""));
      setResetToken("");
      sessionStorage.removeItem("password_reset_token");
      setStep("otp");
      setMessage("تم إرسال رمز تحقق جديد إلى بريدك الإلكتروني");
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setMessage(getErrorMessage(error));
      if (error.response?.status === 429) {
        setResendCooldown(60);
      }
    } finally {
      setIsSending(false);
    }
  }, [email, isSending, resendCooldown]);

  const verifyOtp = useCallback(
    async (code) => {
      if (verifyingRef.current || status === "loading") return;

      verifyingRef.current = true;
      setStatus("loading");
      setMessage("جاري التحقق من الرمز...");

      try {
        const { data } = await verifyPasswordResetOtp({ email, otp: code });
        savePasswordResetToken(data.password_reset_token);
        setResetToken(data.password_reset_token);
        setStatus("success");
        setMessage("تم التحقق من الرمز بنجاح");
        setTimeout(() => {
          setStep("password");
          setStatus("idle");
          setMessage("");
        }, 800);
      } catch (error) {
        setStatus("error");
        setMessage(getErrorMessage(error));
        setOtp(Array(6).fill(""));
        inputsRef.current[0]?.focus();
        setTimeout(() => setStatus("idle"), 2000);
      } finally {
        verifyingRef.current = false;
      }
    },
    [email, status],
  );

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!/^\d?$/.test(value)) return;

    const nextOtp = [...otp];
    nextOtp[index] = value;
    setOtp(nextOtp);
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

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length === 6) {
      verifyOtp(code);
    }
  };

  useEffect(() => {
    if (step !== "otp") return;
    const code = otp.join("");
    if (code.length === 6 && status !== "loading") {
      verifyOtp(code);
    }
  }, [otp, step]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      setStatus("error");
      setMessage("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus("error");
      setMessage("كلمتا المرور غير متطابقتين");
      return;
    }

    setStatus("loading");
    setMessage("جاري تحديث كلمة المرور...");

    try {
      await completePasswordReset({
        password_reset_token: resetToken,
        new_password: newPassword,
      });

      clearPasswordResetSession();
      setStatus("success");
      setMessage("تم تغيير كلمة المرور بنجاح");

      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      setStatus("error");
      setMessage(getErrorMessage(error));
      if (error.response?.status === 401) {
        setStep("otp");
        setResetToken("");
        setOtp(Array(6).fill(""));
      }
    }
  };

  return (
    <main className="auth-container" dir="rtl">
      <div className="otp-logo-container">
        <img src={logo} alt="logo" className="otp-logo" />
      </div>

      <div className="otp-card">
        <div className="otp-card-header">
          <h1>إعادة تعيين كلمة المرور</h1>
          {step === "otp" ? (
            <>
              <p className="otp-card-text">أدخل الرمز المرسل إلى</p>
              <div className="email-highlight">{email}</div>
            </>
          ) : (
            <p className="otp-card-text">اختر كلمة مرور جديدة لحسابك</p>
          )}
        </div>

        {message && <div className={`otp-message ${status}`}>{message}</div>}

        {step === "otp" ? (
          <form className="otp-form" onSubmit={handleOtpSubmit}>
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
              <span>{status === "loading" ? "جاري التحقق..." : "تحقق من الرمز"}</span>
              <span className="material-symbols-outlined">verified_user</span>
            </button>

            <div className="otp-card-footer">
              <p>
                لم يصلك الرمز؟
                <button
                  type="button"
                  className="resend-link"
                  onClick={resendOtp}
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
          </form>
        ) : (
          <form className="otp-form" onSubmit={handlePasswordSubmit}>
            <label className="reset-password-field">
              <span>كلمة المرور الجديدة</span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                autoComplete="new-password"
                disabled={status === "loading"}
              />
            </label>

            <label className="reset-password-field">
              <span>تأكيد كلمة المرور</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                autoComplete="new-password"
                disabled={status === "loading"}
              />
            </label>

            <button
              type="submit"
              className="otp-submit-btn"
              disabled={status === "loading"}
            >
              <span>
                {status === "loading" ? "جاري الحفظ..." : "حفظ كلمة المرور الجديدة"}
              </span>
              <span className="material-symbols-outlined">lock_reset</span>
            </button>

            <div className="otp-card-footer">
              <button
                type="button"
                className="resend-link"
                onClick={() => {
                  setStep("otp");
                  setResetToken("");
                  sessionStorage.removeItem("password_reset_token");
                  setMessage("");
                }}
              >
                العودة لإدخال الرمز
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="back-navigation">
        <button
          type="button"
          className="back-link"
          onClick={() => navigate("/forgot-password")}
        >
          <span className="material-symbols-outlined">arrow_forward</span>
          <span>العودة</span>
        </button>
      </div>
    </main>
  );
}
