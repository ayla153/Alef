import React, { useState } from "react";
import '../styles/TeacherCard.css'
import { FaBookmark, FaRegBookmark } from "react-icons/fa";

const TeacherCard = ({ teacher }) => {
  const [saved, setSaved] = useState(false);

  return (
    <div className="card">

      {/* HEADER */}
      <div className="card-header">

        <img
          src={teacher.image || "https://via.placeholder.com/80"}
          alt={teacher.name}
          className="profile-img"
        />

        <div className="info">
          <h3>{teacher.name}</h3>

          {/* تخصص أو وصف */}
          <p className="subtitle">
            {teacher.subtitle || "مدرس محترف"}
          </p>

          {/* التقييم */}
          <div className="rating">
            <span className="star">★</span>
            <span className="score">{teacher.rating}</span>
            <span className="reviews-count">
              ({teacher.reviews || "0 تقييم"})
            </span>
          </div>

          <div className="experience">
            {teacher.experience} سنوات خبرة
          </div>
        </div>

        {/* Bookmark */}
        <button
          className="fav-btn"
          onClick={() => setSaved(!saved)}
        >
          {saved ? (
            <FaBookmark color="#2563eb" />
          ) : (
            <FaRegBookmark />
          )}
        </button>
      </div>

      {/* المواد */}
      <div className="tags">
        {teacher.subjects.map((sub, i) => (
          <span key={i} className="tag">
            {sub}
          </span>
        ))}
      </div>

      
      <div className="services">

        
        <div
          className={`service-item ${
            teacher.modes?.includes("online") ? "" : "disabled"
          }`}
        >
          <span className="service-name online"> أونلاين</span>
          <span className="price">
            {teacher.modes?.includes("online") ? teacher.onlinePrice : "0"} $
            <small>/ساعة</small>
          </span>
        </div>

        
        <div
          className={`service-item ${
            teacher.modes?.includes("offline") ? "" : "disabled"
          }`}
        >
          <span className="service-name offline"> حضوري</span>
          <span className="price">
            {teacher.modes?.includes("offline") ? teacher.offlinePrice : "0"} $
            <small>/ساعة</small>
          </span>
        </div>

      </div>

      <button className="profile-btn">
        عرض الملف الشخصي
      </button>

    </div>
  );
};

export default TeacherCard;