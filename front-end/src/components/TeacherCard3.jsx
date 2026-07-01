// src/components/TeacherCard3.jsx
import { useMemo } from "react";
import {
  FaStar,
  FaUserGraduate,
  FaBook,
  FaLaptop,
  FaUsers,
} from "react-icons/fa";
import NiceAvatar, { genConfig } from "react-nice-avatar";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const getFullImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${BASE_URL}${url}`;
  return `${BASE_URL}/${url}`;
};

const addTimestamp = (url) => {
  if (!url) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}t=${Date.now()}`;
};

// ─── أفاتار كرتوني واقعي مناسب حسب جنس المعلم (بدل صورة ui-avatars.com) ───
const AvatarFallback = ({ gender, seed, className }) => {
  const sex = gender === "female" ? "woman" : "man"; // افتراضي رجل لو الجنس غير معروف
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const config = useMemo(() => genConfig({ sex }), [sex, seed]);
  return <NiceAvatar className={className} shape="circle" {...config} />;
};

const TeacherCard3 = ({ teacher }) => {
  const rawUrl = getFullImageUrl(teacher.image);
  const imageUrl = teacher.image ? addTimestamp(rawUrl) : null;

  return (
    <div className="instructor-card">
      {/* ─── رأس البطاقة ─── */}
      <div className="instructor-card-header">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={teacher.name}
            className="instructor-avatar"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        {/* الأيقونة تظهر دائماً إذا ما في صورة، أو كـ fallback إذا فشل تحميل الصورة */}
        <div
          className="instructor-avatar"
          style={{
            display: imageUrl ? "none" : "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AvatarFallback
            gender={teacher.gender}
            seed={teacher.id}
            className="instructor-avatar-icon"
          />
        </div>

        <div className="instructor-info">
          <h3 className="instructor-name">{teacher.name}</h3>
          <p className="instructor-stage">{teacher.stage || "مدرّس/ة"}</p>
          <div className="instructor-rating">
            <FaStar className="rating-star" />
            <span className="rating-score">{teacher.rating || 0}</span>
            <span className="rating-count">({teacher.reviews || 0})</span>
          </div>
          <div className="instructor-experience">
            <FaUserGraduate className="exp-icon" />
            <span>{teacher.experience || 0} سنوات خبرة</span>
          </div>
        </div>
      </div>

      {/* ─── المواد ─── */}
      <div className="instructor-subjects">
        <FaBook className="subjects-icon" />
        <div className="subjects-tags">
          {teacher.subjects && teacher.subjects.length > 0 ? (
            teacher.subjects.map((sub, i) => (
              <span key={i} className="subject-tag">
                {sub}
              </span>
            ))
          ) : (
            <span className="subject-tag no-data">لا توجد مواد</span>
          )}
        </div>
      </div>

      {/* ─── طرق التدريس والأسعار ─── */}
      <div className="instructor-pricing">
        <div
          className={`pricing-item ${
            teacher.modes?.includes("online") ? "" : "disabled"
          }`}
        >
          <span className="pricing-label online">
            <FaLaptop className="pricing-icon" /> أونلاين
          </span>
          <span className="pricing-price">
            {teacher.modes?.includes("online") ? teacher.onlinePrice : "0"} ل.س
          </span>
        </div>
        <div
          className={`pricing-item ${
            teacher.modes?.includes("offline") ? "" : "disabled"
          }`}
        >
          <span className="pricing-label offline">
            <FaUsers className="pricing-icon" /> حضوري
          </span>
          <span className="pricing-price">
            {teacher.modes?.includes("offline") ? teacher.offlinePrice : "0"} ل.س
          </span>
        </div>
      </div>
    </div>
  );
};

export default TeacherCard3;