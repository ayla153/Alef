import React, { useState } from "react";
import BesTutors from "../BesTutors";
import "../../styles/tstyle/TeacherTab.css";
import { 
  FaSearch, 
  FaStar, 
  FaChalkboardTeacher, 
  FaUserGraduate, 
  FaLaptop, 
  FaUsers, 
  FaFilter, 
  FaBookmark 
} from "react-icons/fa";

export default function TeachersTab() {
  // حالات الفلاتر
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedRating, setSelectedRating] = useState(0); // 0 يعني الكل
  const [selectedExperience, setSelectedExperience] = useState(0); // 0 الكل، 1: أقل من 3، 2: 3-5، 3: 5+ 
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedMode, setSelectedMode] = useState(""); // online, offline

  // قائمة المواد (ثابتة)
  const subjectList = [
    "الرياضيات",
    "اللغة العربية",
    "اللغة الانكليزية",
    "اللغة الفرنسية",
    "العلوم",
    "الفيزياء",
    "الكيمياء",
    "التربية الاسلامية",
    "التاريخ",
    "الجغرافية",
    "الوطنية",
    "معلوماتية",
  ];

  // قائمة المراحل الدراسية
  const levelList = ["تأسيس", "ابتدائية", "إعدادية", "ثانوية"];

  // بيانات المعلمين (موسعة ومتنوعة)
  const teachers = [
    {
      id: 1,
      name: "رغد طليمات",
      image: "https://randomuser.me/api/portraits/women/68.jpg",
      subtitle: "مدرسة رياضيات متخصصة",
      rating: 4.8,
      reviews: 120,
      experience: 5,
      subjects: ["رياضيات", "فيزياء"],
      levels: ["ابتدائية", "إعدادية"],
      modes: ["online", "offline"],
      onlinePrice: 300,
      offlinePrice: 400,
    },
    {
      id: 2,
      name: "شهد عبارة",
      image: "https://randomuser.me/api/portraits/women/65.jpg",
      subtitle: "مدرسة لغة إنجليزية",
      rating: 4.9,
      reviews: 95,
      experience: 4,
      subjects: ["اللغة الانكليزية"],
      levels: ["إعدادية", "ثانوية"],
      modes: ["online"],
      onlinePrice: 250,
      offlinePrice: 0,
    },
    {
      id: 3,
      name: "هدى الطبال",
      image: "https://randomuser.me/api/portraits/women/29.jpg",
      subtitle: "مدرسة لغة عربية",
      rating: 4.7,
      reviews: 88,
      experience: 6,
      subjects: ["اللغة العربية", "التربية الاسلامية"],
      levels: ["ابتدائية", "إعدادية", "ثانوية"],
      modes: ["online", "offline"],
      onlinePrice: 280,
      offlinePrice: 350,
    },
    {
      id: 4,
      name: "أيلة الراس",
      image: "https://randomuser.me/api/portraits/women/33.jpg",
      subtitle: "مدرسة تاريخ",
      rating: 4.6,
      reviews: 72,
      experience: 3,
      subjects: ["التاريخ", "الجغرافية"],
      levels: ["إعدادية", "ثانوية"],
      modes: ["online"],
      onlinePrice: 220,
      offlinePrice: 0,
    },
    {
      id: 5,
      name: "رقية الأبرش",
      image: "https://randomuser.me/api/portraits/women/52.jpg",
      subtitle: "مدرسة فرنسي",
      rating: 4.6,
      reviews: 72,
      experience: 3,
      subjects: ["اللغة الفرنسية", "الجغرافية"],
      levels: ["ابتدائية", "إعدادية"],
      modes: ["online"],
      onlinePrice: 220,
      offlinePrice: 0,
    },
    {
      id: 6,
      name: "عفاف شاهين",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      subtitle: "مدرسة فيزياء",
      rating: 4.6,
      reviews: 72,
      experience: 3,
      subjects: ["الفيزياء", "الكيمياء"],
      levels: ["ثانوية"],
      modes: ["online"],
      onlinePrice: 220,
      offlinePrice: 0,
    },
    {
      id: 7,
      name: "رهف الحاج يونس",
      image: "https://randomuser.me/api/portraits/women/57.jpg",
      subtitle: "مدرسة جغرافية",
      rating: 4.6,
      reviews: 72,
      experience: 3,
      subjects: ["التاريخ", "الجغرافية"],
      levels: ["إعدادية", "ثانوية"],
      modes: ["online"],
      onlinePrice: 220,
      offlinePrice: 0,
    },
    {
      id: 8,
      name: "قمر طليمات",
      image: "https://randomuser.me/api/portraits/women/91.jpg",
      subtitle: "مدرسة علوم",
      rating: 4.7,
      reviews: 55,
      experience: 2,
      subjects: ["العلوم", "الأحياء"],
      levels: ["ابتدائية", "إعدادية"],
      modes: ["online"],
      onlinePrice: 200,
      offlinePrice: 0,
    },
    {
      id: 9,
      name: "ليان الحسين",
      image: "https://randomuser.me/api/portraits/women/12.jpg",
      subtitle: "مدرسة رياضيات",
      rating: 4.9,
      reviews: 110,
      experience: 8,
      subjects: ["الرياضيات"],
      levels: ["ثانوية"],
      modes: ["online", "offline"],
      onlinePrice: 350,
      offlinePrice: 450,
    },
    {
      id: 10,
      name: "سلمى الشيخ",
      image: "https://randomuser.me/api/portraits/women/45.jpg",
      subtitle: "مدرسة لغة عربية",
      rating: 4.5,
      reviews: 60,
      experience: 2,
      subjects: ["اللغة العربية"],
      levels: ["تأسيس", "ابتدائية"],
      modes: ["offline"],
      onlinePrice: 0,
      offlinePrice: 250,
    },
  ];

  // دالة التصفية الرئيسية
  const filteredTeachers = teachers.filter((teacher) => {
    // فلتر المادة
    if (selectedSubject && !teacher.subjects.includes(selectedSubject)) return false;

    // فلتر التقييم (نجوم)
    if (selectedRating > 0 && teacher.rating < selectedRating) return false;

    // فلتر الخبرة
    if (selectedExperience === 1 && teacher.experience < 3) return false;
    if (selectedExperience === 2 && (teacher.experience < 3 || teacher.experience > 5)) return false;
    if (selectedExperience === 3 && teacher.experience <= 5) return false;

    // فلتر المرحلة
    if (selectedLevel && !teacher.levels.includes(selectedLevel)) return false;

    // فلتر نوع الحضور
    if (selectedMode === "online" && !teacher.modes.includes("online")) return false;
    if (selectedMode === "offline" && !teacher.modes.includes("offline")) return false;

    return true;
  });

  return (
    <div className="teachers_tab fade-in">
      <div className="hero-section">
        <h1 className="TtabTitle">الأساتذة</h1>
        <p className="TtabsubTitle">ابحث عن معلم مناسب لاحتياجاتك من بين نخبة من أفضل المعلمين</p>
      </div>

      {/* الفلاتر */}
      <div className="filters-container">
        <div className="filter-row">
          <div className="filter-group">
            <FaBookmark className="filter-icon" />
            <select
              className="filter-select"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="">جميع المواد</option>
              {subjectList.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <FaStar className="filter-icon" />
            <select
              className="filter-select"
              value={selectedRating}
              onChange={(e) => setSelectedRating(Number(e.target.value))}
            >
              <option value={0}>جميع التقييمات</option>
              <option value={4.5}>4.5 نجوم فأكثر</option>
              <option value={4}>4 نجوم فأكثر</option>
              <option value={3.5}>3.5 نجوم فأكثر</option>
            </select>
          </div>

          <div className="filter-group">
            <FaChalkboardTeacher className="filter-icon" />
            <select
              className="filter-select"
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(Number(e.target.value))}
            >
              <option value={0}>جميع سنوات الخبرة</option>
              <option value={1}>أقل من 3 سنوات</option>
              <option value={2}>3 - 5 سنوات</option>
              <option value={3}>أكثر من 5 سنوات</option>
            </select>
          </div>

          <div className="filter-group">
            <FaUserGraduate className="filter-icon" />
            <select
              className="filter-select"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
            >
              <option value="">جميع المراحل</option>
              {levelList.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            {selectedMode === "online" ? <FaLaptop className="filter-icon" /> : <FaUsers className="filter-icon" />}
            <select
              className="filter-select"
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
            >
              <option value="">جميع (أونلاين / حضوري)</option>
              <option value="online">أونلاين فقط</option>
              <option value="offline">حضوري فقط</option>
            </select>
          </div>
        </div>
      </div>

      {/* عدد النتائج */}
      <div className="results-count">
        <FaFilter /> {filteredTeachers.length} أستاذ/ة متاح(ة)
      </div>

      {/* بطاقات الأساتذة */}
      <div className="bestTutorsContainer">
        {filteredTeachers.map((teacher) => (
          <BesTutors key={teacher.id} teacher={teacher} />
        ))}
      </div>
    </div>
  );
}