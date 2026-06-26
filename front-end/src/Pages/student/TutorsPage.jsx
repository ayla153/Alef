import { useEffect, useMemo, useState } from "react";
import api from "../../api/api";
import { getAuthRole } from "../../api/authStorage";
import { getPublicTutors } from "../../api/publicTutors";

import Header from "../../components/Header";
import FiltersBar from "../../components/FiltersBar";
import TeacherCard from "../../components/TeacherCard";

import "../../styles/sstyle/TutorsPage.css";
import teacherImg from "../../assets/user-avatar.jpg";

import { useLocation, useNavigate } from "react-router-dom";

function TutorsPage() {
  const subjectTranslation = {
    Mathematics: "رياضيات",
    Physics: "فيزياء",
    Chemistry: "كيمياء",
    Biology: "أحياء",
    English: "لغة إنجليزية",
    Arabic: "لغة عربية",
  };
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ===== FILTER STATES =====
  const [subjectSelected, setSubjectSelected] = useState(null);
  const [stageSelected, setStageSelected] = useState(null);
  const [sortSelected, setSortSelected] = useState(null);
  const [modeSelected, setModeSelected] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  const mode = location.state?.from === "create-lead" ? "select" : "view";

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const favsPromise =
          getAuthRole() === "student"
            ? api.get("/favorites/my-favorites")
            : Promise.resolve({ data: [] });

        const [tutorsRes, favsRes] = await Promise.allSettled([
          getPublicTutors({ page: 1, page_size: 100 }),
          favsPromise,
        ]);

        const tutorsData =
          tutorsRes.status === "fulfilled"
            ? (tutorsRes.value.data || []).filter((t) => t.verified === true)
            : [];

        const favsData =
          favsRes.status === "fulfilled" ? favsRes.value.data || [] : [];

        // خريطة tutor_id -> favorite_id لمعرفة مين محفوظ فعلياً بالمفضلة
        const favMap = {};
        favsData.forEach((fav) => {
          favMap[fav.tutor_id] = fav.favorite_id;
        });

        const mappedTutors = tutorsData.map((tutor) => {
          const tutorSubjects = tutor.tutor_subjects || [];

          const prices = tutorSubjects.map((subject) => subject.price_per_hour);

          const minPrice = prices.length > 0 ? Math.min(...prices) : null;

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

            subtitle: tutor.bio || "",

            rating: 0,

            reviews: tutor.reviews?.length || 0,

            experience: tutor.total_experience_years || 0,

            subjects: tutorSubjects
              .map((subject) => {
                const raw = subject?.subject?.subject_title?.trim();
                return subjectTranslation[raw] || raw;
              })
              .filter(Boolean),

            stage: (() => {
              if (tutorSubjects.some((s) => s.high_stage)) return "ثانوي";
              if (tutorSubjects.some((s) => s.middle_stage)) return "متوسط";
              if (tutorSubjects.some((s) => s.elementory_stage))
                return "ابتدائي";
              return "تأسيسي";
            })(),

            onlinePrice: tutor.tution_type === "offline" ? null : minPrice,

            offlinePrice: tutor.tution_type === "online" ? null : minPrice,

            modes:
              tutor.tution_type === "both"
                ? ["online", "offline"]
                : [tutor.tution_type],

            image: tutor.tutor_photo || teacherImg,

            // حالة المفضلة الحقيقية القادمة من الباك، لتلوين البوكمارك من أول تحميل
            isFavorite: favMap[tutor.tutor_id] !== undefined,
            favoriteId: favMap[tutor.tutor_id] ?? null,

            originalData: tutor,
          };
        });

        setTeachers(mappedTutors);
      } catch (error) {
        console.error("Error fetching tutors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, []);

  // عند تغيّر حالة المفضلة من داخل أي كرت، نحدّث القائمة المحلية
  // عشان يضل البوكمارك متزامن وملوّن صحيح بدون الحاجة لإعادة تحميل الصفحة
  const handleFavoriteChange = (tutorId, isFav, favoriteId) => {
    setTeachers((prev) =>
      prev.map((t) =>
        t.id === tutorId
          ? { ...t, isFavorite: isFav, favoriteId: isFav ? favoriteId : null }
          : t,
      ),
    );
  };

  // ===== السعر حسب نوع الدرس =====
  const getPrice = (teacher) => {
    if (modeSelected === "offline") {
      return teacher.offlinePrice ?? Infinity;
    }

    if (modeSelected === "online") {
      return teacher.onlinePrice ?? Infinity;
    }

    const prices = [];

    if (teacher.onlinePrice) prices.push(teacher.onlinePrice);
    if (teacher.offlinePrice) prices.push(teacher.offlinePrice);

    return prices.length ? Math.min(...prices) : Infinity;
  };

  // ===== FILTER + SORT =====
  const filteredTeachers = useMemo(() => {
    let result = [...teachers];

    if (subjectSelected) {
      const selected =
        typeof subjectSelected === "string"
          ? subjectSelected.trim()
          : subjectSelected?.label?.trim?.() ||
            subjectSelected?.value?.trim?.() ||
            "";

      result = result.filter((teacher) => teacher.subjects?.includes(selected));
    }

    if (stageSelected) {
      result = result.filter((teacher) => teacher.stage === stageSelected);
    }

    if (modeSelected) {
      result = result.filter((teacher) =>
        teacher.modes?.includes(modeSelected),
      );
    }

    if (sortSelected === "الأعلى تقييمًا") {
      result.sort((a, b) => b.rating - a.rating);
    }

    if (sortSelected === "الأقل سعرًا") {
      result.sort((a, b) => getPrice(a) - getPrice(b));
    }

    return result;
  }, [teachers, subjectSelected, stageSelected, sortSelected, modeSelected]);

  if (loading) {
    return (
      <>
        <Header activeTab="tutors" />
        <main className="tutors-container">
          <p>جاري تحميل الأساتذة...</p>
        </main>
      </>
    );
  }

  const subjectsList = [
    "رياضيات",
    "فيزياء",
    "كيمياء",
    "أحياء",
    "لغة عربية",
    "لغة إنجليزية",
  ];
  return (
    <>
      <Header activeTab="tutors" />

      <main className="tutors-container">
        <div className="tutor-page-header">
          <h1>الأساتذة</h1>
          <p>ابحث عن المعلم المناسب لاحتياجاتك التعليمية</p>
        </div>

        <FiltersBar
          subjectSelected={subjectSelected}
          setSubjectSelected={setSubjectSelected}
          stageSelected={stageSelected}
          setStageSelected={setStageSelected}
          sortSelected={sortSelected}
          setSortSelected={setSortSelected}
          modeSelected={modeSelected}
          setModeSelected={setModeSelected}
          subjects={subjectsList}
        />

        <section className="teachers-grid">
          {filteredTeachers.length > 0 ? (
            filteredTeachers.map((teacher) => (
              <TeacherCard
                key={teacher.id}
                teacher={teacher}
                mode={mode}
                isFavorite={teacher.isFavorite}
                favoriteId={teacher.favoriteId}
                onFavoriteChange={(isFav, favoriteId) =>
                  handleFavoriteChange(teacher.id, isFav, favoriteId)
                }
                onSelect={(selectedTeacher) => {
                  navigate("/Create/Lead", {
                    state: {
                      from: "create-lead",
                      selectedTeacher,
                    },
                  });
                }}
              />
            ))
          ) : (
            <p className="no-results">لا يوجد أساتذة مطابقين للفلاتر</p>
          )}
        </section>
      </main>
    </>
  );
}

export default TutorsPage;