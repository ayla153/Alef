import { useState, useMemo } from "react";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import NiceAvatar, { genConfig } from "react-nice-avatar";
import { useNavigate } from "react-router-dom";
import api from "../api/api.js";
import { getTeacherProfilePath } from "../utils/authRedirect";
import { resolveTeacherPrices } from "../api/tutorMapper";

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

const TeacherCard2 = ({
  id,
  gender,
  tutorPhoto,
  name,
  rating,
  subject,
  experience,
  modes,
  price,
  minPrice,
  maxPrice,
  isFavorite = false,
  favoriteId = null,
  onFavoriteChange,
}) => {
  const photoUrl = getFullImageUrl(tutorPhoto);
  const { minPrice: priceMin, maxPrice: priceMax } = resolveTeacherPrices({
    minPrice,
    maxPrice,
    price,
  });
  const [busy, setBusy] = useState(false);
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();
  const showImage = !!photoUrl && !imgError;

  const handleFavClick = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (!isFavorite) {
        const { data } = await api.post("/favorites/", { tutor_id: id });
        if (onFavoriteChange) onFavoriteChange(true, data.favorite_id);
      } else {
        if (favoriteId != null) {
          await api.delete(`/favorites/${favoriteId}`);
        }
        if (onFavoriteChange) onFavoriteChange(false, null);
      }
    } catch (err) {
      console.error("فشل تحديث المفضلة:", err);
    } finally {
      setBusy(false);
    }
  };

  const handleViewProfile = () => {
    navigate(getTeacherProfilePath(id));
  };

  return (
    <div className="teacherCard">
      <div className="teacherHeader">
        {showImage ? (
          <img
            src={photoUrl}
            alt={name}
            className="teacherImg"
            onError={() => setImgError(true)}
          />
        ) : (
          <AvatarFallback gender={gender} seed={id} className="teacherImg" />
        )}

        <div className="teacherDetails">
          <div className="nameRow">
            <h3>{name}</h3>
            <div className="rating">
              <span className="material-symbols-outlined filled">star</span>
              <span>{rating}</span>
            </div>
          </div>
          <p className="subText">
            {subject} - خبرة {experience} سنوات
          </p>
          <div className="tagsContainer">
            {modes.includes("online") && (
              <span className="tag online">أونلاين</span>
            )}
            {modes.includes("offline") && (
              <span className="tag offline">حضوري</span>
            )}
          </div>
        </div>
      </div>
      <div className="teacherFooter">
        <div className="actions">
          <button className="favBtn" onClick={handleFavClick} disabled={busy}>
            {isFavorite ? (
              <FaBookmark color="#2563eb" />
            ) : (
              <FaRegBookmark color="#6b7280" />
            )}
          </button>
          <button className="profileBtn" onClick={handleViewProfile}>
            عرض الملف
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherCard2;