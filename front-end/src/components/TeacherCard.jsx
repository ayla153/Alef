import { useState } from "react";
import "../styles/sstyle/TeacherCard.css";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../api/api.js";
import { getTeacherProfilePath } from "../utils/authRedirect";

const TeacherCard = ({
  teacher,
  mode = "view",
  onSelect,
  onViewProfile,
  showFavorite = true,
  isFavorite = false,
  favoriteId = null,
  onFavoriteChange,
}) => {
  const [saved, setSaved] = useState(isFavorite);
  const [savedFavoriteId, setSavedFavoriteId] = useState(favoriteId);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const handleViewProfile = () => {
    if (onViewProfile) {
      onViewProfile(teacher);
      return;
    }
    navigate(getTeacherProfilePath(teacher.id));
  };

  const handleToggleSave = async () => {
    if (busy) return; // تجنّب الضغط المزدوج أثناء انتظار الرد
    setBusy(true);

    try {
      if (!saved) {
        // إضافة للمفضلة
        const { data } = await api.post("/favorites/", { tutor_id: teacher.id });
        setSaved(true);
        setSavedFavoriteId(data.favorite_id);
        if (onFavoriteChange) onFavoriteChange(true, data.favorite_id);
      } else {
        // حذف من المفضلة (يحتاج favorite_id لا tutor_id)
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
          src={teacher.image || "https://via.placeholder.com/80"}
          alt={teacher.name}
          className="tc-profile-img"
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