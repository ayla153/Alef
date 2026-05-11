import { useState, useRef, useEffect } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

import {
  FaUser,
  FaUserTag,
  FaPhone,
  FaEnvelope,
  FaLock,
  FaCheckCircle,
  FaArrowLeft,
  FaTimesCircle,
  FaBirthdayCake,
  FaGraduationCap,
} from "react-icons/fa";

import "../styles/CreateStudentAccount.css";
import logo from "../assets/logo_grayBK.png";

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

  // grades
  const grades = [
    "الأول",
    "الثاني",
    "الثالث",
    "الرابع",
    "الخامس",
    "السادس",
    "السابع",
    "الثامن",
    "التاسع",
    "العاشر",
    "الحادي عشر",
    "الثاني عشر",
  ];

  // grade mapping for backend
  const gradeMap = {
    الأول: "primary_1",
    الثاني: "primary_2",
    الثالث: "primary_3",
    الرابع: "primary_4",
    الخامس: "primary_5",
    السادس: "primary_6",

    السابع: "middle_1",
    الثامن: "middle_2",
    التاسع: "middle_3",

    العاشر: "high_1",
    "الحادي عشر": "high_2",
    "الثاني عشر": "high_3",
  };

  // close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenGrade(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // phone validation
  const handlePhoneChange = (e) => {
    let value = e.target.value;

    value = value.replace(/[^\d+]/g, "");

    const hasPlus = value.startsWith("+");

    let digits = value.replace(/\+/g, "");

    digits = digits.slice(0, 12);

    value = hasPlus ? `+${digits}` : digits;

    setPhonenumber(value);
  };

  // submit form
  const validateForm = async () => {
    let newErrors = {};

    const nameRegex = /^[A-Za-z\u0600-\u06FF\s]+$/;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // firstname
    if (!firstname.trim()) {
      newErrors.firstname = "يرجى تعبئة الاسم الأول";
    } else if (!nameRegex.test(firstname.trim())) {
      newErrors.firstname = "الاسم الأول يجب أن يحتوي على حروف فقط";
    }

    // lastname
    if (!lastname.trim()) {
      newErrors.lastname = "يرجى تعبئة الاسم الأخير";
    } else if (!nameRegex.test(lastname.trim())) {
      newErrors.lastname = "الاسم الأخير يجب أن يحتوي على حروف فقط";
    }

    // phone
    if (!phonenumber.trim()) {
      newErrors.phone = "يرجى إدخال رقم الهاتف";
    }

    // birthdate
    if (!birthdate) {
      newErrors.birthdate = "يرجى اختيار تاريخ الميلاد";
    }

    // grade
    if (!grade) {
      newErrors.grade = "يرجى اختيار المرحلة الدراسية";
    }

    // email
    if (!studentEmail.trim()) {
      newErrors.email = "يرجى إدخال البريد الإلكتروني";
    } else if (!emailRegex.test(studentEmail.trim())) {
      newErrors.email = "البريد الإلكتروني غير صالح";
    }

    // password
    if (!studentPassword) {
      newErrors.password = "يرجى إدخال كلمة السر";
    } else if (studentPassword.length < 8) {
      newErrors.password = "كلمة السر يجب أن تكون 8 أحرف على الأقل";
    }

    // confirm password
    if (!confirmStudentPassword) {
      newErrors.confirm = "يرجى تأكيد كلمة السر";
    } else if (studentPassword !== confirmStudentPassword) {
      newErrors.confirm = "كلمة السر غير متطابقة";
    }

    setErrors(newErrors);

    // stop if errors exist
    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoading(true);

      const formattedDate = new Date(birthdate).toISOString();

      const studentData = {
        first_name: firstname.trim(),
        last_name: lastname.trim(),
        email: studentEmail.trim(),
        password: studentPassword,
        date_birth: formattedDate,
        phone_number: phonenumber.trim(),
        grade_level: gradeMap[grade],
      };

      console.log("DATA SENT:", studentData);

      const response = await api.post("/auth/student/register", studentData);

      console.log("REGISTER SUCCESS:", response.data);

      localStorage.setItem("studentEmail", studentEmail);

      navigate("/otp");
    } catch (error) {
      console.log("REGISTER ERROR:", error.response?.data || error.message);

      setErrors({
        server: error.response?.data?.message || "حدث خطأ أثناء إنشاء الحساب",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container2">
      <img className="Alef-logo" src={logo} alt="logo" />

      <div className="content">
        <div className="titleforstep1">
          <h2>أهلاً بكُم في مِنصَّتنا التَّعليميَّة !</h2>

          <p className="welcom">
            يرجى إدخال بياناتك الشخصية الأساسية للبدء في إعداد ملفك الشخصي.
          </p>
        </div>

        <form className="tutorform">
          {/* الاسم */}
          <div className="tutorinputs">
            <div>
              <label className="toturlabels">
                <FaUser className="input-icon" />
                الاسم الأوّل
              </label>

              <input
                className="tutorinput"
                placeholder="أدخل اسمك الأوّل"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
              />

              {errors.firstname && (
                <p className="error-text">{errors.firstname}</p>
              )}
            </div>

            <div>
              <label className="toturlabels">
                <FaUserTag className="input-icon" />
                الاسم الأخير
              </label>

              <input
                className="tutorinput"
                placeholder="أدخل اسمك الأخير"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
              />

              {errors.lastname && (
                <p className="error-text">{errors.lastname}</p>
              )}
            </div>
          </div>

          {/* الهاتف + الميلاد */}
          <div className="tutorinputs">
            <div>
              <label className="toturlabels">
                <FaPhone className="input-icon" />
                رقم الهاتف
              </label>

              <input
                className="tutorinput"
                placeholder="+963900000000"
                value={phonenumber}
                onChange={handlePhoneChange}
              />

              {errors.phone && <p className="error-text">{errors.phone}</p>}
            </div>

            <div>
              <label className="toturlabels">
                <FaBirthdayCake className="input-icon" />
                تاريخ الميلاد
              </label>

              <input
                className="tutorinput"
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
              />

              {errors.birthdate && (
                <p className="error-text">{errors.birthdate}</p>
              )}
            </div>
          </div>

          {/* المرحلة + الإيميل */}
          <div className="tutorinputs">
            <div className="custom-dropdown" ref={dropdownRef}>
              <label className="toturlabels">
                <FaGraduationCap className="input-icon" />
                المرحلة الدراسية
              </label>

              <div
                className={`dropdown-selected ${!grade ? "empty" : ""}`}
                onClick={() => setOpenGrade(!openGrade)}
              >
                {grade ? grade : "اختر المرحلة الدراسية"}
              </div>

              {openGrade && (
                <div className="dropdown-menu">
                  {grades.map((g, i) => (
                    <div
                      key={i}
                      className="dropdown-item"
                      onClick={() => {
                        setGrade(g);
                        setOpenGrade(false);
                      }}
                    >
                      {g}
                    </div>
                  ))}
                </div>
              )}

              {errors.grade && <p className="error-text">{errors.grade}</p>}
            </div>

            <div>
              <label className="toturlabels">
                <FaEnvelope className="input-icon" />
                البريد الإلكتروني
              </label>

              <input
                className="tutorinput"
                placeholder="user@gmail.com"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
              />

              {errors.email && <p className="error-text">{errors.email}</p>}
            </div>
          </div>

          {/* كلمة السر */}
          <div className="tutorinputs">
            <div>
              <label className="toturlabels">
                <FaLock className="input-icon" />
                كلمة السّر
              </label>

              <input
                type="password"
                className="tutorinput"
                placeholder="كلمة السّر"
                value={studentPassword}
                onChange={(e) => setStudentPassword(e.target.value)}
              />

              {errors.password && (
                <p className="error-text">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="toturlabels">
                <FaCheckCircle className="input-icon" />
                تأكيد كلمة السّر
              </label>

              <input
                type="password"
                className="tutorinput"
                placeholder="تأكيد كلمة السّر"
                value={confirmStudentPassword}
                onChange={(e) => setConfirmStudentPassword(e.target.value)}
              />

              {errors.confirm && <p className="error-text">{errors.confirm}</p>}
            </div>
          </div>

          {/* server error */}
          {errors.server && (
            <p className="error-text center-error">{errors.server}</p>
          )}

          {/* buttons */}
          <div className="tutorbuttons">
            <button
              type="button"
              className="movetostep2"
              onClick={validateForm}
              disabled={loading}
            >
              <FaArrowLeft className="btn-icon" />

              {loading ? "جاري إنشاء الحساب..." : "متابعة للخطوة التالية"}
            </button>

            <button type="button" className="cancele">
              <FaTimesCircle className="btn-icon" />
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
