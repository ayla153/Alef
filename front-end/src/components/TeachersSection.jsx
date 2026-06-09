import React from "react";
import TeacherCard2 from "./TeacherCard2";
import { Link, useNavigate } from "react-router-dom";

const TeachersSection = ({ teachers = [] }) => {
  const navigate = useNavigate();
  return (
    <div className="teachersSection">
      {/* العنوان + زر */}
      <div className="sectionTitle">
        <h2>مدرسون مقترحون لك</h2>
        <button className="viewAllBtn" onClick={() => navigate("/tutors")}>
          عرض الكل
        </button>
      </div>

      {/* الكروت */}
      <div className="teachersGrid">
        {teachers.length === 0 ? (
          <p style={{ color: "#9ca3af", textAlign: "center", width: "100%" }}>
            لا يوجد مدرسون متاحون حالياً
          </p>
        ) : (
          teachers.map((teacher, i) => <TeacherCard2 key={i} {...teacher} />)
        )}
      </div>
    </div>
  );
};

export default TeachersSection;
