import React, { useState } from "react";
import "../styles/sstyle/TeacherCard.css";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const TeacherCard = ({ teacher, mode = "view", onSelect }) => {
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

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
        <button className="tc-fav-btn" onClick={() => setSaved(!saved)}>
          {saved ? <FaBookmark color="#2563eb" /> : <FaRegBookmark />}
        </button>
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
          <span className="tc-price">
            {teacher.modes?.includes("online") ? teacher.onlinePrice : "0"} $
            <small>/ساعة</small>
          </span>
        </div>

        <div
          className={`tc-service-item ${
            teacher.modes?.includes("offline") ? "" : "disabled"
          }`}
        >
          <span className="tc-service-name offline">حضوري</span>
          <span className="tc-price">
            {teacher.modes?.includes("offline") ? teacher.offlinePrice : "0"} $
            <small>/ساعة</small>
          </span>
        </div>
      </div>

      {mode === "select" ? (
        <button className="tc-profile-btn" onClick={() => onSelect(teacher)}>
          اختيار المعلم
        </button>
      ) : (
        <button className="tc-profile-btn">عرض الملف الشخصي</button>
      )}
    </div>
  );
};

export default TeacherCard;