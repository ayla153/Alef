import React, { useEffect, useRef, useState } from "react";
import TeacherCard2 from "./TeacherCard2";
import { useNavigate } from "react-router-dom";

// تختار عدد عشوائي من العناصر بدون تكرار من المصفوفة الأصلية
const getRandomItems = (array, count) => {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

const TeachersSection = ({ teachers = [] }) => {
  const navigate = useNavigate();

  // نثبّت أيدي المعلمين المختارين عشوائيًا مرة واحدة فقط (أول ما توصل بيانات)
  // عشان الحفظ/الإلغاء بعدين ما يعيد القرعة العشوائية من جديد
  const [pickedIds, setPickedIds] = useState(null);
  const hasPickedRef = useRef(false);

  useEffect(() => {
    if (hasPickedRef.current) return; // already picked, don't repick
    if (teachers.length === 0) return; // wait until data actually arrives

    const picked = getRandomItems(teachers, 2).map((t) => t.id);
    setPickedIds(picked);
    hasPickedRef.current = true;
  }, [teachers]);

  // نجيب أحدث نسخة من بيانات كل معلم محدد مسبقًا (عشان isFavorite/favoriteId يبقوا متزامنين)
  const randomTeachers =
    pickedIds === null
      ? []
      : pickedIds
          .map((id) => teachers.find((t) => t.id === id))
          .filter(Boolean); // لو معلم محذوف من القائمة الأصلية لأي سبب

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
          randomTeachers.map((teacher) => (
            <TeacherCard2 key={teacher.id} {...teacher} />
          ))
        )}
      </div>
    </div>
  );
};

export default TeachersSection;