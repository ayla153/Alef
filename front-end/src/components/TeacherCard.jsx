import { useState, useMemo } from "react";
import "../styles/sstyle/TeacherCard.css";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import NiceAvatar, { genConfig } from "react-nice-avatar";
import { useNavigate } from "react-router-dom";
import api from "../api/api.js";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const getFullImageUrl = (url) => {
  if (!url) return null;
  if (url.includes('pravatar.cc') || url.includes('ui-avatars.com')) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${BASE_URL}${url}`;
  return `${BASE_URL}/${url}`;
};

// ─── أفاتار كرتوني واقعي مناسب حسب جنس المعلم (بدل صورة SVG ثابتة) ───
const AvatarFallback = ({ gender, seed, className }) => {
  const sex = gender === "female" ? "woman" : "man"; // افتراضي رجل لو الجنس غير معروف
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const config = useMemo(() => genConfig({ sex }), [sex, seed]);
  return <NiceAvatar className={className} shape="circle" {...config} />;
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
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();

  const imageUrl = getFullImageUrl(teacher.tutorPhoto || teacher.image);
  const showImage = !!imageUrl && !imgError;

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
      <div className="tc-card-header">
        {showImage ? (
          <img
            src={imageUrl}
            alt={teacher.name}
            className="tc-profile-img"
            onError={() => setImgError(true)}
          />
        ) : (
          <AvatarFallback gender={teacher.gender} seed={teacher.id} className="tc-profile-img" />
        )}

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

        {showFavorite && (
          <button className="tc-fav-btn" onClick={handleToggleSave} disabled={busy}>
            {saved ? <FaBookmark color="#2563eb" /> : <FaRegBookmark />}
          </button>
        )}
      </div>

      <div className="tc-tags">
        {(teacher.subjects || []).map((sub, i) => (
          <span key={i} className="tc-tag">{sub}</span>
        ))}
      </div>

      <div className="tc-services">
        <div className={`tc-service-item ${teacher.modes?.includes("online") ? "" : "disabled"}`}>
          <span className="tc-service-name online">أونلاين</span>
        </div>
        <div className={`tc-service-item ${teacher.modes?.includes("offline") ? "" : "disabled"}`}>
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