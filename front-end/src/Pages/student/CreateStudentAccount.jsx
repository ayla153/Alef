import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerStudent } from "../../api/studentRegistration";
import { getErrorMessage } from "../../utils/apiErrors";
import {
  FaUser, FaUserTag, FaPhone, FaEnvelope, FaLock,
  FaCheckCircle, FaArrowLeft, FaBirthdayCake, FaGraduationCap,
} from "react-icons/fa";
import "../../styles/sstyle/CreateStudentAccount.css";
import logo from "../../assets/logo_noBG.png";

export default function CreateStudentAccount() {
  const navigate = useNavigate();
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [phonenumber, setPhonenumber] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [confirmStudentPassword, setConfirmStudentPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [grade, setGrade] = useState("");
  const [openGrade, setOpenGrade] = useState(false);
  const dropdownRef = useRef(null);

  const grades = ["الأول","الثاني","الثالث","الرابع","الخامس","السادس","السابع","الثامن","التاسع","العاشر","الحادي عشر","الثاني عشر"];

  const gradeMap = {
    الأول: "primary_1", الثاني: "primary_2", الثالث: "primary_3",
    الرابع: "primary_4", الخامس: "primary_5", السادس: "primary_6",
    السابع: "middle_1", الثامن: "middle_2", التاسع: "middle_3",
    العاشر: "high_1", "الحادي عشر": "high_2", "الثاني عشر": "high_3",
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenGrade(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/[^\d+]/g, "");
    const hasPlus = value.startsWith("+");
    let digits = value.replace(/\+/g, "").slice(0, 12);
    value = hasPlus ? `+${digits}` : digits;
    setPhonenumber(value);
  };

  const validateForm = async () => {
    let newErrors = {};
    const nameRegex = /^[A-Za-z\u0600-\u06FF\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!firstname.trim()) newErrors.firstname = "يرجى تعبئة الاسم الأول";
    else if (!nameRegex.test(firstname.trim())) newErrors.firstname = "الاسم الأول يجب أن يحتوي على حروف فقط";

    if (!lastname.trim()) newErrors.lastname = "يرجى تعبئة الاسم الأخير";
    else if (!nameRegex.test(lastname.trim())) newErrors.lastname = "الاسم الأخير يجب أن يحتوي على حروف فقط";

    if (!phonenumber.trim()) newErrors.phone = "يرجى إدخال رقم الهاتف";
    if (!birthdate) newErrors.birthdate = "يرجى اختيار تاريخ الميلاد";
    if (!grade) newErrors.grade = "يرجى اختيار المرحلة الدراسية";

    if (!studentEmail.trim()) newErrors.email = "يرجى إدخال البريد الإلكتروني";
    else if (!emailRegex.test(studentEmail.trim())) newErrors.email = "البريد الإلكتروني غير صالح";

    if (!studentPassword) newErrors.password = "يرجى إدخال كلمة السر";
    else if (studentPassword.length < 8) newErrors.password = "كلمة السر يجب أن تكون 8 أحرف على الأقل";

    if (!confirmStudentPassword) newErrors.confirm = "يرجى تأكيد كلمة السر";
    else if (studentPassword !== confirmStudentPassword) newErrors.confirm = "كلمة السر غير متطابقة";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoading(true);
      const studentData = {
        first_name: firstname.trim(),
        last_name: lastname.trim(),
        email: studentEmail.trim(),
        password: studentPassword,
        date_birth: birthdate,
        phone_number: phonenumber.trim(),
        grade_level: gradeMap[grade],
      };
      const response = await registerStudent(studentData);
      const { registration_token } = response.data;
      localStorage.setItem("student_registration_token", registration_token);
      localStorage.setItem("registration_type", "student");
      localStorage.setItem("studentEmail", studentEmail.trim());

      // ✅ التعديل هون
      navigate("/otp");
    } catch (error) {
      setErrors({ server: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-student-account__page">
      <img className="create-student-account__logo" src={logo} alt="logo" />
      <div className="create-student-account__content">
        <div className="create-student-account__title">
          <h2>أهلاً بكُم في مِنصَّتنا التَّعليميَّة !</h2>
          <p className="create-student-account__welcome">
            يرجى إدخال بياناتك الشخصية الأساسية للبدء في إعداد ملفك الشخصي.
          </p>
        </div>

        <form className="create-student-account__form" autoComplete="off">
          <div className="create-student-account__inputs-row">
            <div>
              <label className="create-student-account__label">
                <FaUser className="create-student-account__icon" /> الاسم الأوّل
              </label>
              <input className="create-student-account__input" value={firstname} placeholder="أدخل اسمك الأوّل" onChange={(e) => setFirstname(e.target.value)} />
              {errors.firstname && <p className="create-student-account__error">{errors.firstname}</p>}
            </div>
            <div>
              <label className="create-student-account__label">
                <FaUserTag className="create-student-account__icon" /> الاسم الأخير
              </label>
              <input className="create-student-account__input" value={lastname} placeholder="أدخل اسمك الأخير" onChange={(e) => setLastname(e.target.value)} />
              {errors.lastname && <p className="create-student-account__error">{errors.lastname}</p>}
            </div>
          </div>

          <div className="create-student-account__inputs-row">
            <div>
              <label className="create-student-account__label">
                <FaPhone className="create-student-account__icon" /> رقم الهاتف
              </label>
              <input className="create-student-account__input" value={phonenumber} placeholder="+963900000000" onChange={handlePhoneChange} />
              {errors.phone && <p className="create-student-account__error">{errors.phone}</p>}
            </div>
            <div>
              <label className="create-student-account__label">
                <FaBirthdayCake className="create-student-account__icon" /> تاريخ الميلاد
              </label>
              <input type="date" className="create-student-account__input" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} />
              {errors.birthdate && <p className="create-student-account__error">{errors.birthdate}</p>}
            </div>
          </div>

          <div className="create-student-account__inputs-row">
            <div className="create-student-account__dropdown" ref={dropdownRef}>
              <label className="create-student-account__label">
                <FaGraduationCap className="create-student-account__icon" /> المرحلة الدراسية
              </label>
              <div className="create-student-account__dropdown-selected" onClick={() => setOpenGrade(!openGrade)}>
                {grade || "اختر المرحلة الدراسية"}
              </div>
              {openGrade && (
                <div className="create-student-account__dropdown-menu">
                  {grades.map((g, i) => (
                    <div key={i} className="create-student-account__dropdown-item" onClick={() => { setGrade(g); setOpenGrade(false); }}>
                      {g}
                    </div>
                  ))}
                </div>
              )}
              {errors.grade && <p className="create-student-account__error">{errors.grade}</p>}
            </div>
            <div>
              <label className="create-student-account__label">
                <FaEnvelope className="create-student-account__icon" /> البريد الإلكتروني
              </label>
              <input className="create-student-account__input" value={studentEmail} placeholder="user@gmail.com" autoComplete="off" onChange={(e) => setStudentEmail(e.target.value)} />
              {errors.email && <p className="create-student-account__error">{errors.email}</p>}
            </div>
          </div>

          <div className="create-student-account__inputs-row">
            <div>
              <label className="create-student-account__label">
                <FaLock className="create-student-account__icon" /> كلمة السّر
              </label>
              <input type="password" className="create-student-account__input" value={studentPassword} placeholder="كلمة السّر" autoComplete="new-password" onChange={(e) => setStudentPassword(e.target.value)} />
              {errors.password && <p className="create-student-account__error">{errors.password}</p>}
            </div>
            <div>
              <label className="create-student-account__label">
                <FaCheckCircle className="create-student-account__icon" /> تأكيد كلمة السّر
              </label>
              <input type="password" className="create-student-account__input" value={confirmStudentPassword} placeholder="تأكيد كلمة السّر" autoComplete="new-password" onChange={(e) => setConfirmStudentPassword(e.target.value)} />
              {errors.confirm && <p className="create-student-account__error">{errors.confirm}</p>}
            </div>
          </div>

          {errors.server && (
            <p className="create-student-account__error create-student-account__error--center">{errors.server}</p>
          )}

          <div className="create-student-account__actions">
            <button type="button" className="create-student-account__btn create-student-account__btn--primary" onClick={validateForm} disabled={loading}>
              <FaArrowLeft className="create-student-account__btn-icon" />
              {loading ? "جاري إنشاء الحساب..." : "متابعة للخطوة التالية"}
            </button>
            <button
              className="cancele"
              type="button"
             
              onClick={() => navigate("/selection", { state: { mode: "register" } })}
            >
              <FaArrowLeft className="btn-icon" />
            </button>
          </div>

          <div className="create-student-account__login-redirect">
            هل لديك حساب بالفعل؟
            <Link to="/selection" state={{ mode: "login" }} className="create-student-account__login-link">
              تسجيل دخول
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}