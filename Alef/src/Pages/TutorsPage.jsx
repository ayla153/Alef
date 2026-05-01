import Header from "../components/Header";
import FiltersBar from "../components/FiltersBar";
import TeacherCard from "../components/TeacherCard";
import "../styles/TutorsPage.css";
import teacherImg from "../assets/user-avatar.jpg"; 

function TutorsPage() {
  const teachers = [
    {
      name: "خالد عمر",
      subtitle: "دكتوراه في العلوم",
      rating: 5.0,
      reviews: 42,
      experience: 10,
      subjects: ["فيزياء", "كيمياء"],
      onlinePrice: 180,
      offlinePrice: 250,
      modes: ["online", "offline"],
      image: teacherImg
    },
    {
      name: "أحمد علي",
      subtitle: "مدرس رياضيات",
      rating: 4.8,
      reviews: 30,
      experience: 7,
      subjects: ["رياضيات"],
      onlinePrice: 120,
      modes: ["online"],
      image: teacherImg
    },
    {
      name: "سارة محمد",
      subtitle: "مدرسة إنجليزي",
      rating: 4.9,
      reviews: 55,
      experience: 5,
      subjects: ["إنجليزي"],
      offlinePrice: 150,
      modes: ["offline"],
      image: teacherImg
    },
    {
      name: "محمد خالد",
      subtitle: "مدرس فيزياء",
      rating: 4.7,
      reviews: 20,
      experience: 8,
      subjects: ["فيزياء"],
      onlinePrice: 140,
      offlinePrice: 200,
      modes: ["online", "offline"],
      image: teacherImg
    },
    {
      name: "سارة محمد",
      subtitle: "مدرسة إنجليزي",
      rating: 4.9,
      reviews: 55,
      experience: 5,
      subjects: ["إنجليزي"],
      offlinePrice: 150,
      modes: ["offline"],
      image: teacherImg
    },
    {
      name: "سارة محمد",
      subtitle: "مدرسة إنجليزي",
      rating: 4.9,
      reviews: 55,
      experience: 5,
      subjects: ["إنجليزي"],
      offlinePrice: 150,
      modes: ["offline"],
      image: teacherImg
    },

  ];

  return (
    <>
      <Header activeTab="tutors" />
      <main className="container">
        <div className="page-header">
          <h1>الأساتذة</h1>
          <p>ابحث عن المعلم المناسب لاحتياجاتك التعليمية من بين نخبة من أفضل المعلمين المسجلين في المنصة.</p>
        </div>
        <FiltersBar />
        <section className="teachers-grid">
          {teachers.map((teacher, index) => (
            <TeacherCard key={index} teacher={teacher} />
          ))}
        </section>
      </main>
    </>
  );
}

export default TutorsPage;