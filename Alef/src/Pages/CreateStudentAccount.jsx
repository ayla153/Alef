import { useState, useRef, useEffect } from "react";
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
import logo from "../assets/Logoo.jpg";

export default function CreateStudentAccount() {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [phonenumber, setPhonenumber] = useState("");
  const [tutoremail, setTutoremail] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [tutorpassword, setTutorpassword] = useState("");
  const [coniformtutorpassword, setConiformtutorpassword] = useState("");
  const [errors, setErrors] = useState({});

  const [grade, setGrade] = useState("");
  const [openGrade, setOpenGrade] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenGrade(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const validateForm = () => {
    let newErrors = {};

    const nameRegex = /^[A-Za-z\u0600-\u06FF\s]+$/;

    if (!nameRegex.test(firstname)) {
      newErrors.firstname = "الاسم الأول يجب أن يحتوي على حروف فقط";
    }

    if (!nameRegex.test(lastname)) {
      newErrors.lastname = "الاسم الأخير يجب أن يحتوي على حروف فقط";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(tutoremail)) {
      newErrors.email = "البريد الإلكتروني غير صالح";
    }

    if (tutorpassword.length < 6) {
      newErrors.password = "كلمة السر يجب أن تكون 6 أحرف على الأقل";
    }

    if (tutorpassword !== coniformtutorpassword) {
      newErrors.confirm = "كلمة السر غير متطابقة";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

  const handlePhoneChange = (e) => {
    let value = e.target.value;

    value = value.replace(/[^\d+]/g, "");

    const hasPlus = value.startsWith("+");

    let digits = value.replace(/\+/g, "");
    digits = digits.slice(0, 9);

    value = hasPlus ? `+${digits}` : digits;

    setPhonenumber(value);
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
          {/* الصورة */}
          <div className="profile-image-row">
            <label htmlFor="profileImage" className="image-upload">
              {profileImage ? (
                <img
                  src={URL.createObjectURL(profileImage)}
                  alt="profile"
                  className="profile-preview"
                />
              ) : (
                <div className="placeholder">+</div>
              )}
            </label>

            <input
              type="file"
              id="profileImage"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => setProfileImage(e.target.files[0])}
            />
          </div>

          {/* الاسم */}
          <div className="tutorinputs">
            <div>
              <label className="toturlabels">
                <FaUser className="input-icon" /> الاسم الأوّل
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
                <FaUserTag className="input-icon" /> الاسم الأخير
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
                <FaPhone className="input-icon" /> رقم الهاتف
              </label>
              <input
                className="tutorinput"
                placeholder="+963900000000"
                value={phonenumber}
                onChange={handlePhoneChange}
              />
            </div>

            <div>
              <label className="toturlabels">
                <FaBirthdayCake className="input-icon" /> تاريخ الميلاد
              </label>
              <input
                className="tutorinput"
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
              />
            </div>
          </div>

          {/* المرحلة + الإيميل */}
          <div className="tutorinputs">
            <div className="custom-dropdown" ref={dropdownRef}>
              <label className="toturlabels">
                <FaGraduationCap className="input-icon" /> المرحلة الدراسية
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
            </div>

            <div>
              <label className="toturlabels">
                <FaEnvelope className="input-icon" /> البريد الإلكتروني
              </label>
              <input
                className="tutorinput"
                placeholder="user@gmail.com"
                value={tutoremail}
                onChange={(e) => setTutoremail(e.target.value)}
              />
              {errors.email && <p className="error-text">{errors.email}</p>}
            </div>
          </div>

          {/* كلمة السر */}
          <div className="tutorinputs">
            <div>
              <label className="toturlabels">
                <FaLock className="input-icon" /> كلمة السّر
              </label>
              <input
                type="password"
                className="tutorinput"
                placeholder="كلمة السّر"
                value={tutorpassword}
                onChange={(e) => setTutorpassword(e.target.value)}
              />
              {errors.password && (
                <p className="error-text">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="toturlabels">
                <FaCheckCircle className="input-icon" /> تأكيد كلمة السّر
              </label>
              <input
                type="password"
                className="tutorinput"
                placeholder="تأكيد كلمة السّر"
                value={coniformtutorpassword}
                onChange={(e) => setConiformtutorpassword(e.target.value)}
              />
              {errors.confirm && <p className="error-text">{errors.confirm}</p>}
            </div>
          </div>

          {/* الأزرار */}
          <div className="tutorbuttons">
            <button
              type="button"
              className="movetostep2"
              onClick={validateForm}
            >
              <FaArrowLeft className="btn-icon" /> متابعة للخطوة التالية
            </button>

            <button className="cancele">
              <FaTimesCircle className="btn-icon" /> إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
