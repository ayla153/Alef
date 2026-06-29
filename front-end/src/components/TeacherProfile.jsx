import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/TeacherProfile.css";
import { formatCurrency } from "../utils/Translations";

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

export default function TeacherProfile({ teacherData }) {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  if (!teacherData) {
    return <div className="loading">الرجاء اختيار معلم أولاً</div>;
  }

  const teacher = {
    name: teacherData.name || "مدرس غير معروف",
    age: teacherData.age || 30,
    rating: teacherData.rating || 0,
    reviewsCount: teacherData.reviews || 0,
    avatar: teacherData.image || "https://via.placeholder.com/150",
    bio: teacherData.bio || "لا يوجد وصف متاح.",
    subjects: (teacherData.subjects || []).map((s) => ({ name: s })),
    lessonTypes: [
      { type: "أونلاين", icon: "wifi", variant: "online" },
      { type: "حضوري", icon: "person_pin", variant: "offline" },
    ],
    pricing: (teacherData.subjects || []).map((sub) => ({
      subject: sub,
      stage: "عام",
      online: teacherData.onlinePrice || 0,
      offline: teacherData.offlinePrice || 0,
    })),
    experience: (teacherData.subjects || []).map((sub) => ({
      subject: sub,
      text: `خبرة ${teacherData.experience || 0} سنوات في تدريس مادة ${sub}.`,
    })),
    reviews: [
      {
        name: "طالب",
        initials: "ط",
        rating: 4,
        date: "منذ شهر",
        text: "تجربة جيدة.",
      },
    ],
  };

  const toggleSave = () => setIsSaved((prev) => !prev);

  return (
    <main className="tp-main-content">
      <nav className="breadcrumb">
        <span className="breadcrumb-back" onClick={() => navigate(-1)}>العودة</span>
        <span className="material-symbols-outlined" style={{ fontSize: "1.125rem", margin: "0 0.5rem" }}>chevron_left</span>
        <span className="breadcrumb-current">ملف المعلم</span>
      </nav>

      <div className="hero-card">
        <div className="hero-flex">
          <div className="teacher-avatar-large">
            <div className="avatar-large-img" style={{ backgroundImage: `url(${teacher.avatar})` }} />
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
              <button className={`btn-secondary ${isSaved ? "saved" : ""}`} onClick={toggleSave}>
                <span className={`material-symbols-outlined bookmark-icon ${isSaved ? "active" : ""}`}>bookmark</span>
                <span className="bookmark-text">{isSaved ? "تم الحفظ" : "حفظ المعلم"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div className="sidebar-col">
          <div className="section-card">
            <h3 className="section-title"><span className="material-symbols-outlined">person</span> نبذة عن المعلم</h3>
            <p className="paragraph-text">{teacher.bio}</p>
          </div>
          <div className="section-card">
            <h3 className="section-title"><span className="material-symbols-outlined">video_camera_front</span> نوع الدرس</h3>
            <div className="lesson-types-list">
              {teacher.lessonTypes.map((item, i) => (
                <div key={i} className={`lesson-type-item ${item.variant}`}>
                  <div className="type-meta">
                    <span className="icon-box"><span className="material-symbols-outlined">{item.icon}</span></span>
                    <span className="type-label">{item.type}</span>
                  </div>
                  <span className="material-symbols-outlined check-icon">check_circle</span>
                </div>
              ))}
            </div>
          </div>
          <div className="section-card">
            <h3 className="section-title"><span className="material-symbols-outlined">menu_book</span> المواد التي يدرسها</h3>
            <div className="tags-wrapper">
              {teacher.subjects.map((subj, i) => {
                const meta = { color: subjectColors[subj.name] || "blue", icon: subjectIcons[subj.name] || "menu_book" };
                return (
                  <span key={i} className={`subject-tag ${meta.color}`}>
                    <span className="material-symbols-outlined subject-tag-icon">{meta.icon}</span>
                    {subj.name}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        <div className="main-col">
          <div className="section-card">
            <h3 className="section-title"><span className="material-symbols-outlined">payments</span> السعر لكل مادة ومرحلة</h3>
            <div className="table-responsive">
              <table className="pricing-table">
                <thead><tr><th>المادة</th><th>المرحلة</th><th className="text-center">أونلاين</th><th className="text-center">حضوري</th></tr></thead>
                <tbody>
                  {teacher.pricing.map((p, i) => (
                    <tr key={i}>
                      <td className="font-bold">{p.subject}</td>
                      <td>{p.stage}</td>
                      <td className="text-center text-primary-color">{formatCurrency(p.online)}</td>
                      <td className="text-center font-bold">{formatCurrency(p.offline)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="section-card">
            <h3 className="section-title"><span className="material-symbols-outlined">history_edu</span> الخبرة بكل مادة</h3>
            <div className="experience-list">
              {teacher.experience.map((exp, i) => {
                const meta = { color: subjectColors[exp.subject] || "blue", icon: subjectIcons[exp.subject] || "menu_book" };
                return (
                  <div key={i} className="exp-item">
                    <div className="timeline-visual">
                      <div className="timeline-icon-box"><span className={`material-symbols-outlined ${meta.color}`}>{meta.icon}</span></div>
                      <div className="timeline-line"></div>
                    </div>
                    <div className="exp-content">
                      <h4 className={`exp-title ${meta.color}`}>{exp.subject}</h4>
                      <p className="paragraph-text">{exp.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="section-card">
        <div className="reviews-header">
          <h3 className="section-title"><span className="material-symbols-outlined">reviews</span> آراء الطلاب</h3>
          <div className="reviews-summary-box"><div className="score-details"><span>({teacher.reviewsCount} تقييم)</span></div></div>
        </div>
        <div className="reviews-grid">
          {teacher.reviews.map((rev, i) => (
            <div key={i} className={`review-card ${i === 2 ? "full-width-review" : ""}`}>
              <div className="user-placeholder-avatar">{rev.initials}</div>
              <div className="review-main">
                <div className="review-meta-top">
                  <h4 className="reviewer-name">{rev.name}</h4>
                  <span className="review-date">{rev.date}</span>
                </div>
                <div className="review-stars">
                  {[...Array(rev.rating)].map((_, idx) => <span key={idx} className="material-symbols-outlined filled">star</span>)}
                </div>
                <p className="paragraph-text">{rev.text}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="btn-block-outline">
          <span>عرض جميع الآراء</span>
          <span className="material-symbols-outlined arrow-icon">arrow_back</span>
        </button>
      </div>
    </main>
  );
}