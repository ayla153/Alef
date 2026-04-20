import { useState } from 'react';
import { FaEnvelope, FaLock, FaArrowLeft, FaUserPlus } from 'react-icons/fa';
import '../styles/SignUp.css';
import signImage from '../assets/signImage.png';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('البريد الإلكتروني:', email);
    console.log('كلمة السر:', password);
  };

  return (
    <div className="page-container">
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
              className="signupinput"
              id="email"
              placeholder="user@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-div">
            <div className="lableANDlink">
              <label className="signuplable" htmlFor="password">
                <FaLock className="input-icon" /> كلمة السِّر
              </label>
              <a href="#" className="forgot-link">هل نسيت كلمة السر ؟</a>
            </div>
            <input
              className="signupinput"
              id="password"
              placeholder="*******"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
            />
          </div>

          <button type="submit" className="signupbutton">
            <FaArrowLeft className="btn-icon" /> تسجيل الدُّخول
          </button>
          <p className="haventaccount">
            ليس لديك حساب ؟
            <a href="#" className="signup-prompt">
              <FaUserPlus className="link-icon" /> أنشئ حساباً
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}