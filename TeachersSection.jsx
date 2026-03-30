import React from "react";
import TeacherCard2 from "./TeacherCard2";

const TeachersSection = ({ teachers = [] }) => {
  return (
    <div className="teachersSection">
      
      {/* العنوان + زر */}
      <div className="sectionTitle">
        <h2>مدرسون مقترحون لك</h2>
        <button className="viewAllBtn">عرض الكل</button>
      </div>

      {/* الكروت */}
      <div className="teachersGrid">
        {teachers.map((teacher, i) => (
          <TeacherCard2 key={i} {...teacher} />
        ))}
      </div>

    </div>
  );
};

export default TeachersSection;