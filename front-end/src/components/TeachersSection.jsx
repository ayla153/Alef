import React, { useMemo } from "react";
import TeacherCard2 from "./TeacherCard2";
import { Link, useNavigate } from "react-router-dom";

// تختار عدد عشوائي من العناصر بدون تكرار من المصفوفة الأصلية
const getRandomItems = (array, count) => {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

const TeachersSection = ({ teachers = [] }) => {
  const navigate = useNavigate();

  // نختار مدرّسين عشوائيين فقط، ونعيد الاختيار فقط إذا تغيّرت قائمة teachers
  const randomTeachers = useMemo(() => getRandomItems(teachers, 2), [teachers]);

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
        {randomTeachers.length === 0 ? (
          <p style={{ color: "#9ca3af", textAlign: "center", width: "100%" }}>
            لا يوجد مدرسون متاحون حالياً
          </p>
        ) : (
          randomTeachers.map((teacher, i) => <TeacherCard2 key={i} {...teacher} />)
        )}
      </div>
    </div>
  );
};

export default TeachersSection;