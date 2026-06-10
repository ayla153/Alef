import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FaUser, FaUserTag, FaPhone, FaEnvelope, FaLock, FaCheckCircle, FaArrowLeft, FaTimesCircle } from 'react-icons/fa';
import '../styles/CreateAccountStep1.css';
import logo from '../assets/Alef-logo.jpg';

export default function CreateAccountStep1() {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [phonenumber, setPhonenumber] = useState('');
  const [tutoremail, setTutoremail] = useState('');
  const [tutorpassword, setTutorpassword] = useState('');
  const [coniformtutorpassword, setConiformtutorpassword] = useState('');
  
  // حالات أخطاء التحقق
  const [errors, setErrors] = useState({
    firstname: '',
    lastname: '',
    phonenumber: '',
    tutoremail: '',
    tutorpassword: '',
    coniformtutorpassword: ''
  });

  const navigate = useNavigate();

  // دالة التحقق من صحة النموذج
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      firstname: '',
      lastname: '',
      phonenumber: '',
      tutoremail: '',
      tutorpassword: '',
      coniformtutorpassword: ''
    };

    // التحقق من الاسم الأول (حد أقصى 20 حرف)
    if (!firstname.trim()) {
      newErrors.firstname = 'الاسم الأول مطلوب';
      isValid = false;
    } else if (firstname.length > 20) {
      newErrors.firstname = 'الاسم الأول يجب ألا يتجاوز 20 حرفاً';
      isValid = false;
    }

    // التحقق من الاسم الأخير (حد أقصى 20 حرف)
    if (!lastname.trim()) {
      newErrors.lastname = 'الاسم الأخير مطلوب';
      isValid = false;
    } else if (lastname.length > 20) {
      newErrors.lastname = 'الاسم الأخير يجب ألا يتجاوز 20 حرفاً';
      isValid = false;
    }

    // التحقق من رقم الهاتف: يجب أن يبدأ بـ +9639 ويتبعه 8 أرقام
    const phoneRegex = /^\+9639\d{8}$/;
    if (!phonenumber.trim()) {
      newErrors.phonenumber = 'رقم الهاتف مطلوب';
      isValid = false;
    } else if (!phoneRegex.test(phonenumber)) {
      newErrors.phonenumber = 'رقم الهاتف يجب أن يكون بصيغة +9639XXXXXXXX (مثال: +963998765432)';
      isValid = false;
    }

    // التحقق من البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!tutoremail.trim()) {
      newErrors.tutoremail = 'البريد الإلكتروني مطلوب';
      isValid = false;
    } else if (!emailRegex.test(tutoremail)) {
      newErrors.tutoremail = 'البريد الإلكتروني غير صالح (مثال: name@domain.com)';
      isValid = false;
    }

    // التحقق من كلمة المرور (8 أحرف على الأقل)
    if (!tutorpassword) {
      newErrors.tutorpassword = 'كلمة المرور مطلوبة';
      isValid = false;
    } else if (tutorpassword.length < 8) {
      newErrors.tutorpassword = 'كلمة المرور يجب أن تتكون من 8 أحرف على الأقل';
      isValid = false;
    }

    // التحقق من تطابق كلمة المرور مع تأكيدها
    if (!coniformtutorpassword) {
      newErrors.coniformtutorpassword = 'تأكيد كلمة المرور مطلوب';
      isValid = false;
    } else if (tutorpassword !== coniformtutorpassword) {
      newErrors.coniformtutorpassword = 'كلمة المرور غير متطابقة';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  
  const handleNext = () => {
    if (validateForm()) {
      navigate('/create-account/step2');
    }
  };

  return (
    <div className="page-container2 fade-in">
      <header className="steponeheader">
        <div className="logoAndtitle">
          <img className="Alef-logo" src={logo} alt="logo" />
          إنشاء حساب مُعلّم - منصَّة ألِف
        </div>
      </header>
      <div className="content">
        <div className="titleforstep1">
          <h2>أهلاً بكُم في مِنصَّتنا التَّعليميَّة !</h2>
          <p className="welcom">يرجى إدخال بياناتك الشخصية الأساسية للبدء في إعداد ملفك الشخصي.</p>
          <div className="progress-bar-wrapper">
            <p className="personalinfo">الخطوةُ 1 من 4 : بيانات التّدريس</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '25%' }}></div>
            </div>
          </div>
        </div>
        <form className="tutorform" onSubmit={(e) => e.preventDefault()}>
          <div className="tutorinputs">
            <div>
              <label className="toturlabels" htmlFor="firstname"><FaUser className="input-icon" /> الاسم الأوّل</label>
              <input 
                className={`tutorinput ${errors.firstname ? 'error-input' : ''}`} 
                id="firstname" 
                placeholder="أدخل اسمك الأوّل" 
                required 
                value={firstname} 
                onChange={(e) => setFirstname(e.target.value)} 
              />
              {errors.firstname && <span className="error-message">{errors.firstname}</span>}
            </div>
            <div>
              <label className="toturlabels" htmlFor="lastname"><FaUserTag className="input-icon" /> الاسم الأخير</label>
              <input 
                className={`tutorinput ${errors.lastname ? 'error-input' : ''}`} 
                id="lastname" 
                placeholder="أدخل اسمك الأخير" 
                required 
                value={lastname} 
                onChange={(e) => setLastname(e.target.value)} 
              />
              {errors.lastname && <span className="error-message">{errors.lastname}</span>}
            </div>
          </div>
          <div className="tutorinputs">
            <div>
              <label className="toturlabels" htmlFor="phonenumber"><FaPhone className="input-icon" /> رقم الهاتف</label>
              <input 
                className={`tutorinput ${errors.phonenumber ? 'error-input' : ''}`} 
                type="tel" 
                id="phonenumber" 
                placeholder="+963988888888" 
                required 
                value={phonenumber} 
                onChange={(e) => setPhonenumber(e.target.value)} 
              />
              {errors.phonenumber && <span className="error-message">{errors.phonenumber}</span>}
            </div>
            <div>
              <label className="toturlabels" htmlFor="tutoremail"><FaEnvelope className="input-icon" /> البريد الإلكتروني</label>
              <input 
                className={`tutorinput ${errors.tutoremail ? 'error-input' : ''}`} 
                id="tutoremail" 
                placeholder="user@gmail.com" 
                required 
                value={tutoremail} 
                onChange={(e) => setTutoremail(e.target.value)} 
              />
              {errors.tutoremail && <span className="error-message">{errors.tutoremail}</span>}
            </div>
          </div>
          <div className="tutorinputs">
            <div>
              <label className="toturlabels" htmlFor="tutorpassword"><FaLock className="input-icon" /> كلمة السّر</label>
              <input 
                className={`tutorinput ${errors.tutorpassword ? 'error-input' : ''}`} 
                id="tutorpassword" 
                placeholder="كلمة السّر (8 أحرف على الأقل)" 
                required 
                value={tutorpassword} 
                onChange={(e) => setTutorpassword(e.target.value)} 
                type="password" 
              />
              {errors.tutorpassword && <span className="error-message">{errors.tutorpassword}</span>}
            </div>
            <div>
              <label className="toturlabels" htmlFor="coniformtutorpassword"><FaCheckCircle className="input-icon" /> تأكيد كلمة السّر</label>
              <input 
                className={`tutorinput ${errors.coniformtutorpassword ? 'error-input' : ''}`} 
                id="coniformtutorpassword" 
                placeholder="تأكيد كلمة السّر" 
                required 
                value={coniformtutorpassword} 
                onChange={(e) => setConiformtutorpassword(e.target.value)} 
                type="password" 
              />
              {errors.coniformtutorpassword && <span className="error-message">{errors.coniformtutorpassword}</span>}
            </div>
          </div>
          <div className="tutorbuttons">
            <button type="button" className="movetostep2" onClick={handleNext}>
              <FaArrowLeft className="btn-icon" /> متابعة للخطوة التالية
            </button>
            <button type="button" className="cancele" onClick={() => navigate('/')}>
              <FaTimesCircle className="btn-icon" /> إلغاء
            </button>
          </div>
          <p className="haveaccount">لديك حساب بالفعل ؟ <a href="#" onClick={(e) => {e.preventDefault(); navigate('/login');}}>تسجيل الدخول</a></p>
        </form>
      </div>
    </div>
  );
}