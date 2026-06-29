import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import TeacherCard from "../../components/TeacherCard";
import api from "../../api/api.js";
import { getSubjectPriceRange } from "../../api/tutorMapper";
import "../../styles/sstyle/FavPage.css";

// نفس الترجمة المستخدمة بباقي الصفحات (TeacherProfile / TutorsPage)
const subjectTranslation = {
  Mathematics: "رياضيات",
  Physics: "فيزياء",
  Chemistry: "كيمياء",
  Biology: "أحياء",
  English: "لغة إنجليزية",
  Arabic: "لغة عربية",
};

// تحويل بيانات المعلم الخام من الباك (TutorOut) إلى الشكل الذي تتوقعه TeacherCard
// نفس منطق التحويل المستخدم في TutorsPage.jsx
const mapTutorToTeacherCard = (tutor) => {
  const tutorSubjects = tutor.tutor_subjects || [];
  const { min: minPrice, max: maxPrice } = getSubjectPriceRange(tutorSubjects);

  const stage = tutorSubjects.some((s) => s.high_stage)
    ? "ثانوي"
    : tutorSubjects.some((s) => s.middle_stage)
      ? "متوسط"
      : tutorSubjects.some((s) => s.elementory_stage)
        ? "ابتدائي"
        : "تأسيسي";

  return {
    id: tutor.tutor_id,
    name: `${tutor.first_name} ${tutor.last_name}`,
    gender: tutor.gender,
    tutorPhoto: tutor.tutor_photo,
    subtitle: tutor.bio || "",
    rating: tutor.reviews?.length
      ? (
          tutor.reviews.reduce((s, r) => s + r.number_of_stars, 0) /
          tutor.reviews.length
        ).toFixed(1)
      : 0,
    reviews: tutor.reviews?.length || 0,
    experience: tutor.total_experience_years || 0,
    subjects: tutorSubjects
      .map((subject) => {
        const raw = subject?.subject?.subject_title?.trim();
        return subjectTranslation[raw] || raw;
      })
      .filter(Boolean),
    stage,
    onlinePrice: tutor.tution_type === "offline" ? null : minPrice,
    offlinePrice: tutor.tution_type === "online" ? null : minPrice,
    minPrice,
    maxPrice,
    modes:
      tutor.tution_type === "both"
        ? ["online", "offline"]
        : [tutor.tution_type],
    originalData: tutor,
  };
};

const FavPage = () => {
  // نحتفظ بـ favorite_id مع بيانات المعلم سوية لأن الحذف يحتاج favorite_id
  const [favorites, setFavorites] = useState([]); // [{ favoriteId, teacher }]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setError(null);

        // 1) نجيب لائحة المفضلات (فيها فقط tutor_id, favorite_id)
        const { data: favoritesList } = await api.get("/favorites/my-favorites");

        // 2) نجيب تفاصيل كل معلم بالتوازي عبر /tutors/{tutor_id}
        const results = await Promise.allSettled(
          favoritesList.map((fav) => api.get(`/tutors/${fav.tutor_id}`)),
        );

        // 3) نركب البيانات: favorite_id من اللائحة + بيانات المعلم المحوّلة
        const merged = results
          .map((result, index) => {
            if (result.status !== "fulfilled") return null;
            return {
              favoriteId: favoritesList[index].favorite_id,
              teacher: mapTutorToTeacherCard(result.value.data),
            };
          })
          .filter(Boolean);

        setFavorites(merged);
      } catch (err) {
        setError(
          err.response?.data?.detail || "فشل تحميل قائمة المدرسين المفضلين",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  // عند حذف المفضلة من داخل TeacherCard، نزيل الكرت من القائمة هنا أيضاً
  const handleFavoriteChange = (isFav, favoriteId) => {
    if (!isFav) {
      setFavorites((prev) => prev.filter((f) => f.favoriteId !== favoriteId));
    }
  };

  return (
    <>
      <Header activeTab="favorites" />
      <div className="fav-page__wrapper ">
        <main className="fav-page__content">
          <div className="fav-page__container">
            <section className="fav-page__hero">
              <h1 className="fav-page__hero-title">المفضلة</h1>
              <p className="fav-page__hero-desc">
                المدرسون الذين قمت بحفظهم للوصول السريع ومتابعة توفرهم.
              </p>

              <div className="fav-page__counter-badge">
                <span className="material-symbols-outlined">group</span>
                <span>{favorites.length} مدرسين في قائمتك</span>
              </div>

              {loading ? (
                <p className="fav-page__loading">جارٍ تحميل المدرسين...</p>
              ) : error ? (
                <p className="fav-page__empty" style={{ color: "red" }}>
                  {error}
                </p>
              ) : favorites.length === 0 ? (
                <p className="fav-page__empty">
                  لا يوجد مدرسين في المفضلة بعد.
                </p>
              ) : (
                <div className="teachers-grid">
                  {favorites.map(({ favoriteId, teacher }) => (
                    <TeacherCard
                      key={favoriteId}
                      teacher={teacher}
                      isFavorite={true}
                      favoriteId={favoriteId}
                      onFavoriteChange={handleFavoriteChange}
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