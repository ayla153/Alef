import React, { useState } from "react";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";

const TeacherCard2 = ({
  name,
  rating,
  subject,
  experience,
  modes,
  price,
  image,
  onToggleFav,
}) => {
  const [saved, setSaved] = useState(false);

  const handleFavClick = () => {
    const newState = !saved;
    setSaved(newState);
    if (onToggleFav) onToggleFav(newState); 
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
          {price} ل.س <span>/ ساعة</span>
        </div>

        <div className="actions">
          {/* Bookmark Button */}
          <button className="favBtn" onClick={handleFavClick}>
            {saved ? (
              <FaBookmark color="
#2563eb" />
            ) : (
              <FaRegBookmark color="
#6b7280" />
            )}
          </button>

          {/* Profile Button */}
          <button className="profileBtn">عرض الملف</button>
        </div>
      </div>
    </div>
  );
};

export default TeacherCard2;