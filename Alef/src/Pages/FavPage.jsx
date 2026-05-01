import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import TeacherCard from "../components/TeacherCard";
import "../styles/FavPage.css";

const FavPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch("/api/favorites");
        if (!response.ok) throw new Error("فشل تحميل البيانات");
        const data = await response.json();
        setTeachers(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const removeTeacher = (indexToRemove) => {
    setTeachers((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  return (
    <>
      <Header activeTab="favorites" />
      <div className="wrapper">
        <main className="content">
          <div className="container">
            <section className="hero">
              <h1 className="hero-title">المفضلة</h1>
              <p className="hero-desc">
                المدرسون الذين قمت بحفظهم للوصول السريع ومتابعة توفرهم.
              </p>
              <div className="counter-badge">
                <span className="material-symbols-outlined">group</span>
                <span>{teachers.length} مدرسين في قائمتك</span>
              </div>

              {loading ? (
                <p>جارٍ تحميل المدرسين...</p>
              ) : teachers.length === 0 ? (
                <p className="No-Teachers">لا يوجد مدرسين في المفضلة بعد.</p>
              ) : (
                <div className="teachers-list">
                  {teachers.map((teacher, index) => (
                    <TeacherCard
                      key={index}
                      teacher={teacher}
                      onRemove={() => removeTeacher(index)}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </>
  );
};

export default FavPage;
