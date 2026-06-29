import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/sstyle/SelectionPage.css";

const SelectionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const mode = location.state?.mode || "register";

  const handleStudentClick = () => {
    if (mode === "login") {
      navigate("/login", { replace: true });
    } else {
      navigate("/register", { replace: true });
    }
  };

  const handleTeacherClick = () => {
    if (mode === "login") {
      navigate("/tutor/login", { replace: true });
    } else {
      navigate("/teacher/register", { replace: true });
    }
  };

  const handleBackToLanding = () => {
    navigate("/");
  };

  return (
    <div className="sp-auth-wrapper" dir="rtl">
      <main className="sp-main-content">
        {/* قسم العنوان */}
        <header className="sp-header-container">
          <h1 className="sp-title-text">
            {mode === "login" ? "مرحباً بعودتك لألِفْ" : "ابدأ رحلتك مع ألِفْ"}
          </h1>
          <p className="sp-description-text">
            {mode === "login"
              ? "اختر نوع حسابك لتسجيل الدخول."
              : "اختر نوع الحساب الذي يناسبك للانضمام إلى أكبر منصة تعليمية تفاعلية. نحن نربط بين شغف التعلم وخبرة التعليم."}
          </p>
        </header>

        {/* شبكة الخيارات */}
        <div className="sp-cards-layout">
          {/* بطاقة الطالب */}
          <section className="sp-selection-card">
            <div className="sp-decoration-bg sp-corner-right"></div>
            <div className="sp-icon-box">
              <span className="material-symbols-outlined">school</span>
            </div>
            <h2 className="sp-card-heading">
              {mode === "login" ? "دخول كطالب" : "سجل كطالب"}
            </h2>
            <p className="sp-card-subtext">
              ابحث عن أفضل المدرسين وابدأ رحلتك التعليمية اليوم. استمتع بدروس
              خصوصية مخصصة ومواد تعليمية متميزة.
            </p>
            <button className="sp-primary-btn" onClick={handleStudentClick}>
              {mode === "login" ? "دخول كطالب" : "اختر طالب"}
            </button>
          </section>

          {/* بطاقة الأستاذ */}
          <section className="sp-selection-card">
            <div className="sp-decoration-bg sp-corner-left"></div>
            <div className="sp-icon-box">
              <span className="material-symbols-outlined">co_present</span>
            </div>
            <h2 className="sp-card-heading">
              {mode === "login" ? "دخول كأستاذ" : "سجل كأستاذ"}
            </h2>
            <p className="sp-card-subtext">
              انضم إلى نخبة المعلمين وشارك معرفتك مع آلاف الطلاب. ابنِ علامتك
              الشخصية وحقق دخلًا إضافيًا بمرونة تامة.
            </p>
            <button className="sp-primary-btn" onClick={handleTeacherClick}>
              {mode === "login" ? "دخول كأستاذ" : "اختر أستاذ"}
            </button>
          </section>
        </div>

        <div className="sp-back-navigation">
          <button type="button" className="sp-back-link" onClick={handleBackToLanding}>
            <span className="material-symbols-outlined">arrow_forward</span>
            <span>العودة للصفحة الرئيسية</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default SelectionPage;