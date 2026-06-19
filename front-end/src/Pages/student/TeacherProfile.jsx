import React, { useState, useEffect } from "react";
import "../../styles/sstyle/TeacherProfile.css";
import Header from "../../components/Header";
import { useNavigate, useParams } from "react-router-dom";

const subjectColors = {
  الرياضيات: "blue",
  الفيزياء: "purple",
  الكيمياء: "green",
  الأحياء: "emerald",
  الإنجليزي: "orange",
  العربي: "red",
  التاريخ: "yellow",
  الجغرافيا: "teal",
  معلوماتية: "indigo",
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
  معلوماتية: "computer",
};

export default function TeacherProfile() {
  const { tutor_id } = useParams();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTutor = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`http://localhost:8000/tutors/${tutor_id}`);

        if (!res.ok) {
          throw new Error("لم يتم العثور على المعلم");
        }

        const data = await res.json();

        setTeacher(data);
      } catch (err) {
        setError(err.message || "حدث خطأ غير متوقع");
      } finally {
        setLoading(false);
      }
    };

    if (tutor_id) fetchTutor();
  }, [tutor_id]);
  const toggleSave = () => setIsSaved((prev) => !prev);

  if (loading) {
    return (
      <>
        <Header />
        <main className="tp-main-content">
          <div style={{ textAlign: "center", padding: "4rem" }}>
            جاري التحميل...
          </div>
        </main>
      </>
    );
  }

  if (error || !teacher) {
    return (
      <>
        <Header />
        <main className="tp-main-content">
          <div style={{ textAlign: "center", padding: "4rem", color: "red" }}>
            {error || "حدث خطأ ما"}
          </div>
        </main>
      </>
    );
  }

  const fullName = `${teacher.first_name} ${teacher.last_name}`;
  const subjects = teacher?.tutor_subjects ?? [];
  const reviews = teacher?.reviews ?? [];
  if (!teacher && !loading) {
    return (
      <>
        <Header />
        <div style={{ textAlign: "center", padding: "4rem", color: "red" }}>
          لا توجد بيانات للمعلم
        </div>
      </>
    );
  }
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
                style={{
                  backgroundImage: `url(${
                    teacher.tutor_photo || "https://via.placeholder.com/120"
                  })`,
                }}
              />
              <div className="status-dot" />
            </div>

            <div className="hero-info-wrapper">
              <div className="hero-header-row">
                <div>
                  <h2 className="teacher-name">{fullName}</h2>
                  <div className="meta-badges">
                    <div className="badge-item">
                      <span className="material-symbols-outlined">
                        history_edu
                      </span>
                      <span>
                        {teacher.total_experience_years ?? "—"} سنوات خبرة
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rating">
                  <span className="material-symbols-outlined filled">star</span>
                  <span>
                    {reviews.length > 0
                      ? (
                          reviews.reduce((s, r) => s + r.number_of_stars, 0) /
                          reviews.length
                        ).toFixed(1)
                      : "—"}
                  </span>
                </div>
              </div>

              <div className="divider"></div>

              <div className="action-buttons">
                <button
                  className="btn-primary"
                  onClick={() =>
                    navigate("/Create/Lead", {
                      state: { origin: "teacher", tutor_id: teacher.tutor_id },
                    })
                  }
                >
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
              <p className="paragraph-text">
                {teacher.bio || "لا توجد نبذة متاحة"}
              </p>
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
                {(teacher.tution_type === "online" ||
                  teacher.tution_type === "both") && (
                  <div className="lesson-type-item online">
                    <div className="type-meta">
                      <span className="icon-box">
                        <span className="material-symbols-outlined">wifi</span>
                      </span>
                      <span className="type-label">أونلاين</span>
                    </div>
                    <span className="material-symbols-outlined check-icon">
                      check_circle
                    </span>
                  </div>
                )}

                {(teacher.tution_type === "offline" ||
                  teacher.tution_type === "both") && (
                  <div className="lesson-type-item offline">
                    <div className="type-meta">
                      <span className="icon-box">
                        <span className="material-symbols-outlined">
                          person_pin
                        </span>
                      </span>
                      <span className="type-label">حضوري</span>
                    </div>
                    <span className="material-symbols-outlined check-icon">
                      check_circle
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* subjects */}
            <div className="section-card">
              <h3 className="section-title">
                <span className="material-symbols-outlined">menu_book</span>
                المواد التي يدرسها
              </h3>

              <div className="tags-wrapper">
                {subjects.map((subj, i) => {
                  const name = subj?.subject?.subject_title ?? "—";
                  const meta = {
                    color: subjectColors[name] || "blue",
                    icon: subjectIcons[name] || "menu_book",
                  };

                  return (
                    <span key={i} className={`subject-tag ${meta.color}`}>
                      <span className="material-symbols-outlined subject-tag-icon">
                        {meta.icon}
                      </span>
                      {name}
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
                      <th className="text-center">السعر/ساعة</th>
                    </tr>
                  </thead>

                  <tbody>
                    {subjects.map((subj, i) => (
                      <tr key={i}>
                        <td className="font-bold">
                          {subj.subject?.subject_title || "—"}
                        </td>
                        <td>{subj.level?.level_title || "—"}</td>
                        <td className="text-center text-primary-color">
                          {subj.price_per_hour ?? "—"} ل.س
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* EXPERIENCE */}
            <div className="section-card">
              <h3 className="section-title">
                <span className="material-symbols-outlined">history_edu</span>
                الخبرة بكل مادة
              </h3>

              <div className="experience-list">
                {subjects.map((subj, i) => {
                  const name = subj.subject?.subject_title || "—";
                  const meta = {
                    color: subjectColors[name] || "blue",
                    icon: subjectIcons[name] || "menu_book",
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
                        <h4 className={`exp-title ${meta.color}`}>{name}</h4>
                        <p className="paragraph-text">
                          خبرة {subj.experience_years ?? "—"} سنوات
                        </p>
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
              <span>({reviews.length} تقييم)</span>
            </div>
          </div>

          <div className="reviews-grid">
            {reviews.length === 0 ? (
              <p className="paragraph-text">لا توجد تقييمات بعد</p>
            ) : (
              reviews.map((rev, i) => (
                <div
                  key={i}
                  className={`review-card ${
                    i === reviews.length - 1 && reviews.length % 2 !== 0
                      ? "full-width-review"
                      : ""
                  }`}
                >
                  <div className="user-placeholder-avatar">
                    {rev.student_id}
                  </div>

                  <div className="review-main">
                    <div className="review-meta-top">
                      <h4 className="reviewer-name">طالب #{rev.student_id}</h4>
                      <span className="review-date">
                        {rev.created_at
                          ? new Date(rev.created_at).toLocaleDateString("ar-SA")
                          : "—"}
                      </span>
                    </div>

                    <div className="review-stars">
                      {[...Array(rev.number_of_stars)].map((_, j) => (
                        <span
                          key={j}
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
                      {rev.comment || "—"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {reviews.length > 3 && (
            <button className="btn-block-outline">
              <span>عرض جميع الآراء</span>
              <span className="material-symbols-outlined arrow-icon">
                arrow_back
              </span>
            </button>
          )}
        </div>
      </main>
    </>
  );
}
