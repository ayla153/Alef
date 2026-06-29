import React, { useState } from "react";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import '../styles/BestTutors.css';
import { formatHourlyPriceRange } from '../utils/Translations';
import { resolveTutorPhotoUrl } from '../utils/tutorPhoto';

export default function BesTutors({ teacher = {}, onViewProfile }) {
  const [saved, setSaved] = useState(false);

  const {
    id,
    gender,
    tutorPhoto,
    name = "اسم غير معروف",
    subtitle = "مدرس محترف",
    rating = 0,
    reviews = 0,
    experience = 0,
    subjects = [],
    modes = [],
    onlinePrice = 0,
    offlinePrice = 0,
    minPrice = null,
    maxPrice = null,
  } = teacher;

  const displayImage = resolveTutorPhotoUrl(tutorPhoto, { gender, tutorId: id });

  const handleClick = () => {
    if (onViewProfile) {
      onViewProfile(teacher);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <img src={displayImage} alt={name} className="profile-img" />
        <div className="info">
          <h3>{name}</h3>
          <p className="subtitle">{subtitle}</p>
          <div className="rating">
            <span className="star">★</span>
            <span className="score">{rating}</span>
            <span className="reviews-count">({reviews} تقييم)</span>
          </div>
          <div className="experience">{experience} سنوات خبرة</div>
        </div>
        <button className="fav-btn" onClick={() => setSaved(!saved)}>
          {saved ? <FaBookmark color="#2563eb" /> : <FaRegBookmark />}
        </button>
      </div>

      <div className="tags">
        {subjects.map((sub, i) => (
          <span key={i} className="tag">{sub}</span>
        ))}
      </div>

      <div className="services">
        <div className={`service-item ${modes.includes("online") ? "" : "disabled"}`}>
          <span className="service-name online">أونلاين</span>
          <span className="price">
            {formatHourlyPriceRange(minPrice ?? onlinePrice, maxPrice ?? onlinePrice, modes.includes("online"))} <small>/ساعة</small>
          </span>
        </div>
        <div className={`service-item ${modes.includes("offline") ? "" : "disabled"}`}>
          <span className="service-name offline">حضوري</span>
          <span className="price">
            {formatHourlyPriceRange(minPrice ?? offlinePrice, maxPrice ?? offlinePrice, modes.includes("offline"))} <small>/ساعة</small>
          </span>
        </div>
      </div>

      <button className="profile-btn" onClick={handleClick}>
        عرض الملف الشخصي
      </button>
    </div>
  );
}
