import { useMemo, useState } from "react";

import Header from "../../components/Header";
import FiltersBar from "../../components/FiltersBar";
import TeacherCard from "../../components/TeacherCard";

import "../../styles/sstyle/TutorsPage.css";
import teacherImg from "../../assets/user-avatar.jpg";
import { useLocation, useNavigate } from "react-router-dom";

function TutorsPage() {
  const teachers = [
    {
      name: "خالد عمر",
      subtitle: "دكتوراه في العلوم",
      rating: 5.0,
      reviews: 42,
      experience: 10,
      subjects: ["فيزياء", "كيمياء"],
      stage: "ثانوي",
      onlinePrice: 180,
      offlinePrice: 250,
      modes: ["online", "offline"],
      image: teacherImg,
    },
    {
      name: "أحمد علي",
      subtitle: "مدرس رياضيات",
      rating: 4.8,
      reviews: 30,
      experience: 7,
      subjects: ["رياضيات"],
      stage: "متوسط",
      onlinePrice: 120,
      modes: ["online"],
      image: teacherImg,
    },
    {
      name: "سارة محمد",
      subtitle: "مدرسة إنجليزي",
      rating: 4.9,
      reviews: 55,
      experience: 5,
      subjects: ["إنجليزي"],
      stage: "ابتدائي",
      offlinePrice: 150,
      modes: ["offline"],
      image: teacherImg,
    },
    {
      name: "محمد خالد",
      subtitle: "مدرس فيزياء",
      rating: 4.7,
      reviews: 20,
      experience: 8,
      subjects: ["فيزياء"],
      stage: "ثانوي",
      onlinePrice: 140,
      offlinePrice: 200,
      modes: ["online", "offline"],
      image: teacherImg,
    },
  ];

  // ===== FILTER STATES =====
  const [subjectSelected, setSubjectSelected] = useState(null);
  const [stageSelected, setStageSelected] = useState(null);
  const [sortSelected, setSortSelected] = useState(null);
  const [modeSelected, setModeSelected] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  const mode = location.state?.from === "create-lead" ? "select" : "view";

  // ===== السعر الذكي حسب mode =====
  const getPrice = (teacher) => {
    // حضوري فقط
    if (modeSelected === "offline") {
      return teacher.offlinePrice ?? Infinity;
    }

    // أونلاين فقط
    if (modeSelected === "online") {
      return teacher.onlinePrice ?? Infinity;
    }

    // بدون تحديد → أقل سعر متاح
    const prices = [];

    if (teacher.onlinePrice) prices.push(teacher.onlinePrice);
    if (teacher.offlinePrice) prices.push(teacher.offlinePrice);

    return prices.length ? Math.min(...prices) : Infinity;
  };

  // ===== FILTER + SORT =====
  const filteredTeachers = useMemo(() => {
    let result = [...teachers];

    // فلترة المادة
    if (subjectSelected) {
      result = result.filter((t) => t.subjects.includes(subjectSelected));
    }

    // فلترة المرحلة
    if (stageSelected) {
      result = result.filter((t) => t.stage === stageSelected);
    }

    // فلترة mode
    if (modeSelected) {
      result = result.filter((t) => t.modes.includes(modeSelected));
    }

    // ترتيب
    if (sortSelected === "الأعلى تقييمًا") {
      result.sort((a, b) => b.rating - a.rating);
    }

    if (sortSelected === "الأقل سعرًا") {
      result.sort((a, b) => getPrice(a) - getPrice(b));
    }

    return result;
  }, [teachers, subjectSelected, stageSelected, sortSelected, modeSelected]);

  return (
    <>
      <Header activeTab="tutors" />

      <main className="tutors-container ">
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
        />

        <section className="teachers-grid">
          {filteredTeachers.length > 0 ? (
            filteredTeachers.map((teacher, index) => (
              <TeacherCard
                teacher={teacher}
                mode={mode}
                onSelect={(t) => {
                  navigate("/Create/Lead", {
                    state: {
                      from: "create-lead",
                      selectedTeacher: t,
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
