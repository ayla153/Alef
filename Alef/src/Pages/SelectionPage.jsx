import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SelectionPage.css";

const SelectionPage = () => {
  const navigate = useNavigate();
  return (
    <div className="auth-wrapper" dir="rtl">
      <main className="main-content">
        {/* قسم العنوان */}
        <header className="header-container">
          <h1 className="title-text">ابدأ رحلتك مع ألِفْ</h1>
          <p className="description-text">
            اختر نوع الحساب الذي يناسبك للانضمام إلى أكبر منصة تعليمية تفاعلية.
            نحن نربط بين شغف التعلم وخبرة التعليم.
          </p>
        </header>

        {/* شبكة الخيارات */}
        <div className="cards-layout">
          {/* بطاقة الطالب */}
          <section className="selection-card">
            <div className="decoration-bg corner-right"></div>
            <div className="icon-box">
              <span className="material-symbols-outlined">school</span>
            </div>
            <h2 className="card-heading">سجل كطالب</h2>
            <p className="card-subtext">
              ابحث عن أفضل المدرسين وابدأ رحلتك التعليمية اليوم. استمتع بدروس
              خصوصية مخصصة ومواد تعليمية متميزة.
            </p>
            <button
              className="primary-btn"
              onClick={() => navigate("/register")}
            >
              اختر طالب
            </button>
          </section>

          {/* بطاقة الأستاذ */}
          <section className="selection-card">
            <div className="decoration-bg corner-left"></div>
            <div className="icon-box">
              <span className="material-symbols-outlined">co_present</span>
            </div>
            <h2 className="card-heading">سجل كأستاذ</h2>
            <p className="card-subtext">
              انضم إلى نخبة المعلمين وشارك معرفتك مع آلاف الطلاب. ابنِ علامتك
              الشخصية وحقق دخلًا إضافيًا بمرونة تامة.
            </p>
            <button className="primary-btn">اختر أستاذ</button>
          </section>
        </div>
      </main>
    </div>
  );
};

export default SelectionPage;
