import React, { useState } from "react";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../api/api.js";
import { getTeacherProfilePath } from "../utils/authRedirect";
import { formatHourlyPriceRange } from "../utils/Translations";
import { resolveTeacherPrices } from "../api/tutorMapper";
import { resolveTutorPhotoUrl } from "../utils/tutorPhoto";

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
  const photoUrl = resolveTutorPhotoUrl(tutorPhoto, { gender, tutorId: id });
  const { minPrice: priceMin, maxPrice: priceMax } = resolveTeacherPrices({
    minPrice,
    maxPrice,
    price,
  });
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const handleFavClick = async () => {
    if (busy) return; // تجنّب الضغط المزدوج أثناء انتظار الرد
    setBusy(true);

    try {
      if (!isFavorite) {
        // إضافة للمفضلة
        const { data } = await api.post("/favorites/", { tutor_id: id });
        if (onFavoriteChange) onFavoriteChange(true, data.favorite_id);
      } else {
        // حذف من المفضلة (يحتاج favorite_id لا tutor_id)
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
        <div
          className="teacherImg"
          style={{ backgroundImage: `url(${photoUrl})` }}
        ></div>

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

      {/* Footer */}
      <div className="teacherFooter">
        <div className="price">
          {formatHourlyPriceRange(priceMin, priceMax)}{" "}
          <span>/ساعة</span>
        </div>

        <div className="actions">
          {/* Bookmark Button */}
          <button className="favBtn" onClick={handleFavClick} disabled={busy}>
            {isFavorite ? (
              <FaBookmark color="#2563eb" />
            ) : (
              <FaRegBookmark color="#6b7280" />
            )}
          </button>

          {/* Profile Button */}
          <button className="profileBtn" onClick={handleViewProfile}>
            عرض الملف
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherCard2;