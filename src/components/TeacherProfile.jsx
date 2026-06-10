import React, { useState } from "react";
import "../styles/TeacherProfile.css";
import Header from "../../components/Header";
import { useNavigate, Link } from "react-router-dom";

const subjectColors = {
  الرياضيات: "blue",
  الفيزياء: "purple",
  الكيمياء: "green",
  الأحياء: "emerald",
  الإنجليزي: "orange",
  العربي: "red",
  التاريخ: "yellow",
  الجغرافيا: "teal",
};

const subjectIcons = {
  الرياضيات: "calculate",
  الفيزياء: "biotech",
  الكيمياء: "science",
  الأحياء: "eco",
  الإنجليزي: "translate",
  العربي: "menu_book",
  التاريخ: "history_edu",
  الجغرافيا: "public",
};

export default function TeacherProfile() {
  const [isSaved, setIsSaved] = useState(false);
  const navigate = useNavigate();

  const [teacher] = useState({
    name: "أحمد علي",
    age: 28,
    rating: 4.9,
    reviewsCount: 120,

    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAmmU_OyTV48O1KbfvaN7CwiJk447YboVeuOUQId0j9nxELNdKB12OtjR5g2ssx5ses_4yrHrQ8iaRdswBTwlnt_JyF6xM8ykoNdD5FL5GRsu0xicyNo-I87PKwPSOBpoLEGNBKdOqPaV2VqhyM7G9tDBh8J0vIUaGqYpzdywrAwPr7YNYRznlJedUH-egyFUOJFoKaN98Y-XnaJfec4sHoqYIvMvVAOH7-XHt1Lg_A_006aq0bKLjXpCotCQIvtgGxT7QxB7huU5U",

    bio: "مدرس متخصص في المواد العلمية للمرحلة الثانوية والجامعية. أسلوب شرح مبسط وتفاعلي مع التركيز على حل المشكلات وفهم الأساسيات.",

    subjects: [{ name: "الرياضيات" }, { name: "الفيزياء" }],

    lessonTypes: [
      { type: "أونلاين", icon: "wifi", variant: "online" },
      { type: "حضوري", icon: "person_pin", variant: "offline" },
    ],

    pricing: [
      { subject: "الرياضيات", stage: "الثانوية", online: 50, offline: 80 },
      { subject: "الرياضيات", stage: "الجامعية", online: 70, offline: 120 },
      { subject: "الفيزياء", stage: "الثانوية", online: 55, offline: 90 },
    ],

    experience: [
      {
        subject: "الرياضيات",
        text: "خبرة 5 سنوات في تدريس مناهج الرياضيات للمرحلة الثانوية بما فيها التفاضل والتكامل.",
      },
      {
        subject: "الفيزياء",
        text: "خبرة 3 سنوات في الميكانيكا والكهرباء مع استخدام التجارب العملية.",
      },
    ],

    reviews: [
      {
        name: "عمر الحربي",
        initials: "ع",
        rating: 5,
        date: "منذ 3 أيام",
        text: "شرح رائع ومبسط ساعدني كثير في فهم التكامل.",
      },
      {
        name: "نورة سعد",
        initials: "ن",
        rating: 4,
        date: "منذ أسبوع",
        text: "شرح جيد لكن أحياناً سريع.",
      },
      {
        name: "خالد العتيبي",
        initials: "خ",
        rating: 5,
        date: "منذ شهر",
        text: "أفضل مدرس خصوصي تعاملت معه.",
      },
    ],
  });
  const toggleSave = () => {
    setIsSaved((prev) => !prev);
  };

  return (
    <>
      <Header />

      <main className="tp-main-content">
        {/* breadcrumb */}
        <nav className="breadcrumb">
          <span className="breadcrumb-back" onClick={() => navigate(-1)}>
            العودة
          </span>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "1.125rem", margin: "0 0.5rem" }}
          >
            chevron_left
          </span>

          <span className="breadcrumb-current">ملف المعلم</span>
        </nav>

        {/* HERO CARD */}
        <div className="hero-card">
          <div className="hero-flex">
            <div className="teacher-avatar-large">
              <div
                className="avatar-large-img"
                style={{ backgroundImage: `url(${teacher.avatar})` }}
              />

              <div className="status-dot" />
            </div>

            <div className="hero-info-wrapper">
              <div className="hero-header-row">
                <div>
                  <h2 className="teacher-name">{teacher.name}</h2>

                  <div className="meta-badges">
                    <div className="badge-item">
                      <span className="material-symbols-outlined">cake</span>
                      <span>{teacher.age} سنة</span>
                    </div>
                  </div>
                </div>

                <div className="rating">
                  <span className="material-symbols-outlined filled">star</span>
                  <span>{teacher.rating}</span>
                </div>
              </div>

              <div className="divider"></div>

              <div className="action-buttons">
                <button className="btn-primary">
                  <span className="material-symbols-outlined">send</span>
                  <span>طلب درس</span>
                </button>

                <button
                  className={`btn-secondary ${isSaved ? "saved" : ""}`}
                  onClick={toggleSave}
                >
                  <span
                    className={`material-symbols-outlined bookmark-icon ${
                      isSaved ? "active" : ""
                    }`}
                  >
                    bookmark
                  </span>

                  <span className="bookmark-text">
                    {isSaved ? "تم الحفظ" : "حفظ المعلم"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* GRID */}
        <div className="content-grid">
          {/* SIDEBAR */}
          <div className="sidebar-col">
            <div className="section-card">
              <h3 className="section-title">
                <span className="material-symbols-outlined">person</span>
                نبذة عن المعلم
              </h3>
              <p className="paragraph-text">{teacher.bio}</p>
            </div>

            {/* lesson types */}
            <div className="section-card">
              <h3 className="section-title">
                <span className="material-symbols-outlined">
                  video_camera_front
                </span>
                نوع الدرس
              </h3>

              <div className="lesson-types-list">
                {teacher.lessonTypes.map((item, i) => (
                  <div key={i} className={`lesson-type-item ${item.variant}`}>
                    <div className="type-meta">
                      <span className="icon-box">
                        <span className="material-symbols-outlined">
                          {item.icon}
                        </span>
                      </span>
                      <span className="type-label">{item.type}</span>
                    </div>
                    <span className="material-symbols-outlined check-icon">
                      check_circle
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* subjects */}
            <div className="section-card">
              <h3 className="section-title">
                <span className="material-symbols-outlined">menu_book</span>
                المواد التي يدرسها
              </h3>

              <div className="tags-wrapper">
                {teacher.subjects.map((subj, i) => {
                  const meta = {
                    color: subjectColors[subj.name] || "blue",
                    icon: subjectIcons[subj.name] || "menu_book",
                  };

                  return (
                    <span key={i} className={`subject-tag ${meta.color}`}>
                      <span className="material-symbols-outlined subject-tag-icon">
                        {meta.icon}
                      </span>
                      {subj.name}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* MAIN */}
          <div className="main-col">
            {/* PRICING */}
            <div className="section-card">
              <h3 className="section-title">
                <span className="material-symbols-outlined">payments</span>
                السعر لكل مادة ومرحلة
              </h3>

              <div className="table-responsive">
                <table className="pricing-table">
                  <thead>
                    <tr>
                      <th>المادة</th>
                      <th>المرحلة</th>
                      <th className="text-center">أونلاين</th>
                      <th className="text-center">حضوري</th>
                    </tr>
                  </thead>

                  <tbody>
                    {teacher.pricing.map((p, i) => (
                      <tr key={i}>
                        <td className="font-bold">{p.subject}</td>
                        <td>{p.stage}</td>
                        <td className="text-center text-primary-color">
                          {p.online} ر.س
                        </td>
                        <td className="text-center font-bold">
                          {p.offline} ر.س
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* EXPERIENCE (FIXED) */}
            <div className="section-card">
              <h3 className="section-title">
                <span className="material-symbols-outlined">history_edu</span>
                الخبرة بكل مادة
              </h3>

              <div className="experience-list">
                {teacher.experience.map((exp, i) => {
                  const meta = {
                    color: subjectColors[exp.subject] || "blue",
                    icon: subjectIcons[exp.subject] || "menu_book",
                  };

                  return (
                    <div key={i} className="exp-item">
                      <div className="timeline-visual">
                        <div className="timeline-icon-box">
                          <span
                            className={`material-symbols-outlined ${meta.color}`}
                          >
                            {meta.icon}
                          </span>
                        </div>
                        <div className="timeline-line"></div>
                      </div>

                      <div className="exp-content">
                        <h4 className={`exp-title ${meta.color}`}>
                          {exp.subject}
                        </h4>
                        <p className="paragraph-text">{exp.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* REVIEWS */}
        <div className="section-card">
          <div className="reviews-header">
            <h3 className="section-title">
              <span className="material-symbols-outlined">reviews</span>
              آراء الطلاب
            </h3>

            <div className="reviews-summary-box">
              <div className="score-details">
                <span>({teacher.reviewsCount} تقييم)</span>
              </div>
            </div>
          </div>

          <div className="reviews-grid">
            {teacher.reviews.map((rev, i) => (
              <div
                key={i}
                className={`review-card ${i === 2 ? "full-width-review" : ""}`}
              >
                <div className="user-placeholder-avatar">{rev.initials}</div>

                <div className="review-main">
                  <div className="review-meta-top">
                    <h4 className="reviewer-name">{rev.name}</h4>
                    <span className="review-date">{rev.date}</span>
                  </div>

                  <div className="review-stars">
                    {[...Array(rev.rating)].map((_, i) => (
                      <span
                        key={i}
                        className="material-symbols-outlined filled"
                      >
                        star
                      </span>
                    ))}
                  </div>

                  <p
                    className="paragraph-text"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {rev.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button className="btn-block-outline">
            <span>عرض جميع الآراء</span>
            <span className="material-symbols-outlined arrow-icon">
              arrow_back
            </span>
          </button>
        </div>
      </main>
    </>
  );
}
