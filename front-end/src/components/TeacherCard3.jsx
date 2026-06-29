// src/components/TeacherCard3.jsx
import {
  FaStar,
  FaUserGraduate,
  FaBook,
  FaLaptop,
  FaUsers,
} from "react-icons/fa";

// رابط الصورة الافتراضية
const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?name=مستخدم&background=3b82f6&color=fff&size=200";
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

const TeacherCard = ({ teacher }) => {
  const imageUrl = teacher.image
    ? addTimestamp(getFullImageUrl(teacher.image))
    : DEFAULT_AVATAR;

  return (
    <div className="instructor-card">
      {/* ─── رأس البطاقة ─── */}
      <div className="instructor-card-header">
        <img
          src={imageUrl}
          alt={teacher.name}
          className="instructor-avatar"
          onError={(e) => {
            e.target.src = DEFAULT_AVATAR;
          }}
        />

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
            {teacher.modes?.includes("online") ? teacher.onlinePrice : "0"} $
            <small>/ساعة</small>
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
            {teacher.modes?.includes("offline") ? teacher.offlinePrice : "0"} $
            <small>/ساعة</small>
          </span>
        </div>
      </div>
    </div>
  );
};

export default TeacherCard;