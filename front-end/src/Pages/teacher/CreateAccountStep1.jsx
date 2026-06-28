import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FaUser, FaUserTag, FaPhone, FaEnvelope, FaLock, FaCheckCircle, FaArrowLeft, FaTimesCircle, FaCalendarAlt } from 'react-icons/fa';
import '../../styles/CreateAccountStep1.css';
import { registerTutorStep1 } from '../../api/tutorRegistration';
import { parseValidationErrors, getErrorMessage } from '../../utils/apiErrors';
import Header from '../../components/common/Header';

export default function CreateAccountStep1() {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [phonenumber, setPhonenumber] = useState('');
  const [tutoremail, setTutoremail] = useState('');
  const [tutorpassword, setTutorpassword] = useState('');
  const [coniformtutorpassword, setConiformtutorpassword] = useState('');
  const [datebirth, setDatebirth] = useState('');
  const [gender, setGender] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // حالات أخطاء التحقق
  const [errors, setErrors] = useState({
    firstname: '',
    lastname: '',
    phonenumber: '',
    tutoremail: '',
    tutorpassword: '',
    coniformtutorpassword: '',
    datebirth: '',
    gender: ''
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
      coniformtutorpassword: '',
      datebirth: '',
      gender: '',
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

    // التحقق من تاريخ الميلاد (مطلوب من الباك إند)
    if (!datebirth) {
      newErrors.datebirth = 'تاريخ الميلاد مطلوب';
      isValid = false;
    }

    if (!gender) {
      newErrors.gender = 'الجنس مطلوب';
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

  const handleNext = async () => {
    setGeneralError('');
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // ✅ هذه هي الحقول الوحيدة التي يطلبها الباك إند في الخطوة 1 (TutorRegisterStep1)
      // bio / total_experience_years / tution_type تنتمي للخطوة 3 والخطوة 4 وليس هنا — حذفها يحل اللخبطة
      const response = await registerTutorStep1({
        first_name: firstname.trim(),
        last_name: lastname.trim(),
        email: tutoremail.trim(),
        password: tutorpassword,
        date_birth: datebirth,
        phone_number: phonenumber.trim(),
        gender,
      });

      console.log('✅ Response from server:', response);

      const { registration_token } = response.data;
      localStorage.setItem('tutor_registration_token', registration_token);
      localStorage.setItem('registration_type', 'tutor');
      localStorage.setItem('tutorEmail', tutoremail.trim());

      navigate('/create-account/step2');
    } catch (error) {
      // طباعة تفاصيل الخطأ كاملة في وحدة التحكم
      console.error(error);

      if (error.response) {
        // الخادم استجاب مع خطأ
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
        console.error('Headers:', error.response.headers);

        const serverFieldErrors = parseValidationErrors(error);
        if (Object.keys(serverFieldErrors).length > 0) {
          setErrors((prev) => ({ ...prev, ...serverFieldErrors }));
        } else {
          // عرض رسالة الخطأ من الخادم
          const serverMessage =
            error.response.data?.detail || error.response.data?.message || 'حدث خطأ في الخادم';
          setGeneralError(
            typeof serverMessage === 'string' ? serverMessage : JSON.stringify(serverMessage)
          );
        }
      } else if (error.request) {
        // الطلب تم إرساله لكن لم يتم استلام رد (مشكلة شبكة / CORS / السيرفر متوقف)
        console.error('No response received:', error.request);
        setGeneralError('لم يتم استلام رد من الخادم. تأكد من أن الخادم يعمل وأن عنوان API صحيح.');
      } else {
        // خطأ في إعداد الطلب نفسه
        console.error('Request setup error:', error.message);
        setGeneralError(getErrorMessage(error));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container2 fade-in">
      <header className="steponeheader">
        <Header/>
      </header>
      <div className="content">
        <div className="titleforstep1">
          <h2>أهلاً بكُم في مِنصَّتنا التَّعليميَّة !</h2>
          <p className="welcom">يرجى إدخال بياناتك الشخصية الأساسية للبدء في إعداد ملفك الشخصي.</p>
          <div className="progress-bar-wrapper">
            <p className="personalinfo">الخطوةُ 1 من 4 : بيانات التّدريس</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '25%' }}></div>
            </div>
          </div>
        </div>
        <form className="tutorform" onSubmit={(e) => e.preventDefault()}>
          {generalError && <div className="error-message-subjects">{generalError}</div>}
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
                autoComplete="off"
                value={tutoremail} 
                onChange={(e) => setTutoremail(e.target.value)} 
              />
              {errors.tutoremail && <span className="error-message">{errors.tutoremail}</span>}
            </div>
          </div>
          <div className="tutorinputs">
            <div>
              <label className="toturlabels" htmlFor="datebirth"><FaCalendarAlt className="input-icon" /> تاريخ الميلاد</label>
              <input 
                className={`tutorinput ${errors.datebirth ? 'error-input' : ''}`} 
                type="date" 
                id="datebirth" 
                required 
                value={datebirth} 
                onChange={(e) => setDatebirth(e.target.value)} 
              />
              {errors.datebirth && <span className="error-message">{errors.datebirth}</span>}
            </div>
            <div>
              <label className="toturlabels" htmlFor="gender"><FaUser className="input-icon" /> الجنس</label>
              <select
                className={`tutorinput ${errors.gender ? 'error-input' : ''}`}
                id="gender"
                required
                value={gender}
                autoComplete="new-password"
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="" disabled>اختر الجنس</option>
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
              {errors.gender && <span className="error-message">{errors.gender}</span>}
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
                autoComplete="new-password"
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
            <button type="button" className="movetostep2" onClick={handleNext} disabled={isSubmitting}>
              <FaArrowLeft className="btn-icon" /> {isSubmitting ? 'جارِ الإرسال...' : 'متابعة للخطوة التالية'}
            </button>
            <button type="button" className="cancele" onClick={() => navigate('/')} disabled={isSubmitting}>
              <FaTimesCircle className="btn-icon" /> إلغاء
            </button>
          </div>
          <p className="haveaccount">لديك حساب بالفعل ؟ <a href="#" onClick={(e) => {e.preventDefault(); navigate('/login');}}>تسجيل الدخول</a></p>
        </form>
      </div>
    </div>
  );
}
