// src/components/TeacherCard3.jsx
import { useState, useMemo } from "react";
import "../styles/sstyle/TeacherCard.css";
import NiceAvatar, { genConfig } from "react-nice-avatar";
import { FaLaptop, FaUsers } from "react-icons/fa";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const getFullImageUrl = (url) => {
  if (!url) return null;
  if (url.includes('pravatar.cc') || url.includes('ui-avatars.com')) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${BASE_URL}${url}`;
  return `${BASE_URL}/${url}`;
};

// ─── أفاتار كرتوني واقعي حسب الجنس ───
const AvatarFallback = ({ gender, seed, className }) => {
  const sex = gender === "female" ? "woman" : "man";
  const config = useMemo(() => genConfig({ sex }), [sex, seed]);
  return <NiceAvatar className={className} shape="circle" {...config} />;
};

const TeacherCard3 = ({ teacher }) => {
  const [imgError, setImgError] = useState(false);

  const imageUrl = getFullImageUrl(teacher.tutorPhoto || teacher.image);
  const showImage = !!imageUrl && !imgError;

  const formatPrice = (price) => {
    if (!price) return "0";
    return Number(price).toLocaleString();
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

        {/* تم حذف زر المفضلة */}
      </div>

      <div className="tc-tags">
        {(teacher.subjects || []).map((sub, i) => (
          <span key={i} className="tc-tag">{sub}</span>
        ))}
      </div>

      {/* عرض الخدمات (أونلاين / حضوري) مع الأسعار */}
      <div className="tc-services">
        <div className={`tc-service-item ${teacher.modes?.includes("online") ? "" : "disabled"}`}>
          <span className="tc-service-name online">
            <FaLaptop className="tc-price-icon" /> أونلاين
          </span>
          <span className="tc-service-price">
            {teacher.modes?.includes("online") ? formatPrice(teacher.onlinePrice) : "0"} ل.س
          </span>
        </div>
        <div className={`tc-service-item ${teacher.modes?.includes("offline") ? "" : "disabled"}`}>
          <span className="tc-service-name offline">
            <FaUsers className="tc-price-icon" /> حضوري
          </span>
          <span className="tc-service-price">
            {teacher.modes?.includes("offline") ? formatPrice(teacher.offlinePrice) : "0"} ل.س
          </span>
        </div>
      </div>

      {/* تم حذف زر "عرض الملف الشخصي" و "اختيار المعلم" */}
    </div>
  );
};

export default TeacherCard3;