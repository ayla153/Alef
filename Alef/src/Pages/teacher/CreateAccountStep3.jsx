import "../../styles/tstyle/CreateAccountStep3.css";
import logo from "../../assets/logo_noBG.png";
import { useState } from "react";
import PriceCard from "../../components/PriceCard";
import {
  FaArrowLeft,
  FaTimesCircle,
  FaLaptop,
  FaUniversity,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaMoneyBillWave,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom"; // أضفنا الأيقونة الجديدة

export default function CreateAccountStep3() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState({
    online: false,
    offline: false,
  });

  const [experienceYears, setExperienceYears] = useState("");

  const handleSelect = (type) => {
    setSelected((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <div className="page-container2">
      <header className="steponeheader">
        <div className="logoAndtitle">
          <img className="Alef-logo" src={logo} alt="logo" />
          إنشاء حساب مُعلّم - منصَّة ألِف
        </div>
      </header>
      <div className="content">
        <div className="titleforstep1">
          <h2>أهلاً بكُم في مِنصَّتنا التَّعليميَّة !</h2>
          <p className="welcom">
            حدد أسعارك للمراحل التعليمية المختلفة و حدد طرق التدريس الخاصة بك.
          </p>
          <div className="progress-bar-wrapper">
            <p className="personalinfo">الخطوةُ 3 من 4 : تفاصيل الدرس </p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: "75%" }}></div>
            </div>
          </div>
        </div>

        <div className="step3content stp3">
          <div className="method-cards-container">
            <div className="method-cards-title">
              <FaChalkboardTeacher className="method-title-icon" />
              طريقة التدريس
            </div>
            <div className="method-cards">
              {/* بطاقة أونلاين */}
              <div
                className={`method-card ${selected.online ? "selected" : ""}`}
                onClick={() => handleSelect("online")}
              >
                <div className="card-icon">
                  <FaLaptop />
                </div>
                <div className="card-content">
                  <h3>دروس أونلاين</h3>
                  <p>تدريس الطالب عن بعد عبر مكالمة فيديو</p>
                </div>
                <div className="card-checkbox">
                  <input type="checkbox" checked={selected.online} readOnly />
                </div>
              </div>

              {/* بطاقة حضوري */}
              <div
                className={`method-card ${selected.offline ? "selected" : ""}`}
                onClick={() => handleSelect("offline")}
              >
                <div className="card-icon">
                  <FaUniversity />
                </div>
                <div className="card-content">
                  <h3>دروس حضورية</h3>
                  <p>الدفع للطلاب أو استقبالهم في موقعك</p>
                </div>
                <div className="card-checkbox">
                  <input type="checkbox" checked={selected.offline} readOnly />
                </div>
              </div>
            </div>
          </div>

          <div className="exp-wrapper">
            <div className="education-experience-title">
              <FaUserGraduate className="exp-icon" />
              الخبرة التعليمية{" "}
            </div>
            <div className="experience-section">
              <label className="exp-label">
                أدخل عدد سنوات خبرتك منذ أن بدأت بالتدريس
              </label>
              <div className="exp-input-wrapper">
                <input
                  type="number"
                  className="exp-input"
                  placeholder="مثال: 5"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  min="0"
                  step="1"
                />
              </div>
              <p className="exp-hint">
                سيتم عرض هذا في ملفك الشخصي لبناء الثقة مع الطلاب
              </p>
            </div>
          </div>

          <PriceCard />

          <div className="tutorbuttons">
            <button className="movetostep2">
              <FaArrowLeft className="btn-icon" /> متابعة للخطوة التالية
            </button>
            <button
              className="back"
              type="button"
              onClick={() => navigate("/teacher/register/step2")}
            >
              الرّجوع للخطوة السّابقة
            </button>
          </div>
          <p className="haveaccount">
            لديك حساب بالفعل ؟ <Link to="/login">تسجيل الدخول</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
