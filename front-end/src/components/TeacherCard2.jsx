import React, { useState } from "react";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../api/api.js";
import { getTeacherProfilePath } from "../utils/authRedirect";
import { formatHourlyPrice } from "../utils/Translations";

const TeacherCard2 = ({
  id,
  name,
  rating,
  subject,
  experience,
  modes,
  price,
  image,
  isFavorite = false,
  favoriteId = null,
  onFavoriteChange,
}) => {
  const [saved, setSaved] = useState(isFavorite);
  const [savedFavoriteId, setSavedFavoriteId] = useState(favoriteId);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const handleFavClick = async () => {
    if (busy) return; // تجنّب الضغط المزدوج أثناء انتظار الرد
    setBusy(true);

    try {
      if (!saved) {
        // إضافة للمفضلة
        const { data } = await api.post("/favorites/", { tutor_id: id });
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

  const handleViewProfile = () => {
    navigate(getTeacherProfilePath(id));
  };

  return (
    <div className="teacherCard">
      <div className="teacherHeader">
        <div
          className="teacherImg"
          style={{ backgroundImage: `url(${image})` }}
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
          {formatHourlyPrice(price)} <span>/ ساعة</span>
        </div>

        <div className="actions">
          {/* Bookmark Button */}
          <button className="favBtn" onClick={handleFavClick} disabled={busy}>
            {saved ? (
              <FaBookmark color="
#2563eb" />
            ) : (
              <FaRegBookmark color="
#6b7280" />
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