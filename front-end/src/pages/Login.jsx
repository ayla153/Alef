import { useState } from 'react';
import { FaEnvelope, FaLock, FaArrowLeft, FaUserPlus } from 'react-icons/fa';
import '../styles/Login.css';
import signImage from '../assets/signImage.png';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'البريد الإلكتروني مطلوب';
    if (!emailRegex.test(email)) return 'البريد الإلكتروني غير صالح (مثال: name@domain.com)';
    if (email.length > 40) return 'البريد الإلكتروني يجب ألا يتجاوز 40 حرفاً';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'كلمة السر مطلوبة';
    if (password.length < 8) return 'كلمة السر يجب أن تتكون من 8 أحرف على الأقل';
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    setErrors({ email: emailError, password: passwordError });

    if (!emailError && !passwordError) {
      console.log('البريد الإلكتروني:', email);
      console.log('كلمة السر:', password);
      navigate('/dashboard');
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

          <div className="input-div">
            <label htmlFor="email" className="signuplable">
              <FaEnvelope className="input-icon" /> البريد الإلكتروني
            </label>
            <input
              className={`signupinput ${errors.email ? 'error-input' : ''}`}
              id="email"
              placeholder="user@gmail.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>

          <div className="input-div">
            <div className="lableANDlink">
              <label className="signuplable" htmlFor="password">
                <FaLock className="input-icon" /> كلمة السِّر
              </label>
              <a href="#" className="forgot-link">هل نسيت كلمة السر ؟</a>
            </div>
            <input
              className={`signupinput ${errors.password ? 'error-input' : ''}`}
              id="password"
              placeholder="*******"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: '' });
              }}
              type="password"
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>

          <button type="submit" className="signupbutton">
            <FaArrowLeft className="btn-icon" /> تسجيل الدُّخول
          </button>
          <p className="haventaccount">
            ليس لديك حساب ؟
            <a
              href="#"
              className="signup-prompt"
              onClick={(e) => {
                e.preventDefault();
                navigate('/create-account/step1');
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