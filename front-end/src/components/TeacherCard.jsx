import { useState } from "react";
import "../styles/sstyle/TeacherCard.css";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../api/api.js";

// رابط الصورة الافتراضية (في حال فشل التحميل)
const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=مستخدم&background=3b82f6&color=fff&size=200';

// رابط الباك إند الأساسي (من متغير البيئة أو افتراضي)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// دالة لتحويل الرابط النسبي إلى رابط مطلق
const getFullImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${BASE_URL}${url}`;
  return `${BASE_URL}/${url}`;
};

// دالة لإضافة timestamp لمنع الكاش (اختياري)
const addTimestamp = (url) => {
  if (!url) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}t=${Date.now()}`;
};

const TeacherCard = ({
  teacher,
  mode = "view",
  onSelect,
  showFavorite = true,
  isFavorite = false,
  favoriteId = null,
  onFavoriteChange,
}) => {
  const [saved, setSaved] = useState(isFavorite);
  const [savedFavoriteId, setSavedFavoriteId] = useState(favoriteId);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  // معالجة رابط الصورة: تحويل إلى مطلق + إضافة timestamp
  const imageUrl = teacher.image ? addTimestamp(getFullImageUrl(teacher.image)) : DEFAULT_AVATAR;

  const handleViewProfile = () => {
    navigate(`/tutor/${teacher.id}`);
  };

  const handleToggleSave = async () => {
    if (busy) return;
    setBusy(true);

    try {
      if (!saved) {
        const { data } = await api.post("/favorites/", { tutor_id: teacher.id });
        setSaved(true);
        setSavedFavoriteId(data.favorite_id);
        if (onFavoriteChange) onFavoriteChange(true, data.favorite_id);
      } else {
        if (savedFavoriteId != null) {
          await api.delete(`/favorites/${savedFavoriteId}`);
        }
        setSaved(false);
        setSavedFavoriteId(null);
        if (onFavoriteChange) onFavoriteChange(false, savedFavoriteId);
      }
    } catch (err) {
      console.error("فشل تحديث المفضلة:", err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="tc-card">
      {/* HEADER */}
      <div className="tc-card-header">
        <img
          src={imageUrl}
          alt={teacher.name}
          className="tc-profile-img"
          onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
        />

        <div className="tc-info">
          <h3 className="tc-name">{teacher.name}</h3>

          <p className="tc-subtitle">{teacher.stage || "غير محدد"}</p>

          <div className="tc-rating">
            <span className="tc-star">★</span>
            <span className="tc-score">{teacher.rating}</span>
            <span className="tc-reviews">({teacher.reviews || "0 تقييم"})</span>
          </div>

          <div className="tc-experience">{teacher.experience} سنوات خبرة</div>
        </div>

        {/* Bookmark */}
        {showFavorite && (
          <button className="tc-fav-btn" onClick={handleToggleSave} disabled={busy}>
            {saved ? <FaBookmark color="#2563eb" /> : <FaRegBookmark />}
          </button>
        )}
      </div>

      {/* subjects */}
      <div className="tc-tags">
        {teacher.subjects.map((sub, i) => (
          <span key={i} className="tc-tag">
            {sub}
          </span>
        ))}
      </div>

      {/* services */}
      <div className="tc-services">
        <div
          className={`tc-service-item ${
            teacher.modes?.includes("online") ? "" : "disabled"
          }`}
        >
          <span className="tc-service-name online">أونلاين</span>
        </div>

        <div
          className={`tc-service-item ${
            teacher.modes?.includes("offline") ? "" : "disabled"
          }`}
        >
          <span className="tc-service-name offline">حضوري</span>
        </div>
      </div>

      {mode === "select" ? (
        <button className="tc-profile-btn" onClick={() => onSelect(teacher)}>
          اختيار المعلم
        </button>
      ) : (
        <button className="tc-profile-btn" onClick={handleViewProfile}>
          عرض الملف الشخصي
        </button>
      )}
    </div>
  );
};

export default TeacherCard;