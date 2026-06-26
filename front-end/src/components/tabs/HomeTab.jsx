import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HowitWorkSteps from '../HowitWorkSteps';
import TeacherCard from '../TeacherCard';
import FAQItem from '../FAQItem';
import '../../styles/HomeTab.css';
import studentImage from '../../assets/homePageImage.png';

const BASE_URL = 'http://localhost:8000';

function mapTutorToTeacher(tutor) {
  const subjects = tutor.tutor_subjects?.map(s => s.subject?.subject_title).filter(Boolean) ?? [];

  const modes = [];
  if (tutor.tution_type === 'online' || tutor.tution_type === 'both') modes.push('online');
  if (tutor.tution_type === 'offline' || tutor.tution_type === 'both') modes.push('offline');

  const onlineSubject = tutor.tutor_subjects?.find(s =>
    tutor.tution_type === 'online' || tutor.tution_type === 'both'
  );
  const offlineSubject = tutor.tutor_subjects?.find(s =>
    tutor.tution_type === 'offline' || tutor.tution_type === 'both'
  );

  const avgRating = tutor.reviews?.length
    ? (tutor.reviews.reduce((sum, r) => sum + r.number_of_stars, 0) / tutor.reviews.length).toFixed(1)
    : 0;

  return {
    id: tutor.tutor_id,
    name: `${tutor.first_name} ${tutor.last_name}`,
    image: tutor.tutor_photo || 'https://via.placeholder.com/80',
    subtitle: tutor.bio ?? '',
    stage: tutor.bio ?? '',
    rating: avgRating,
    reviews: tutor.reviews?.length ?? 0,
    experience: tutor.total_experience_years ?? 0,
    subjects,
    modes,
    onlinePrice: onlineSubject?.price_per_hour ?? 0,
    offlinePrice: offlineSubject?.price_per_hour ?? 0,
  };
}

export default function HomeTab({ onViewProfile }) {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const res = await fetch(`${BASE_URL}/tutors/?page=1&page_size=4`);
        if (!res.ok) throw new Error('فشل جلب البيانات');
        const data = await res.json();
        setTeachers(data.map(mapTutorToTeacher));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, []);

  return (
    <>
      <div className="firstsection fade-in">
        <div className="homepageTitle">
          <div className="homepageTitle2">
            <div>أتقن أي مادة مع</div>
            <div><span className="besttutor">أفضل المعلمين</span></div>
            <div className="homepagesubtitle">
              انضم إلى منصة ألف التعليمية وحقق أهدافك الأكاديمية من خلال دروس
              خصوصية مع معلمين من اختيارك
            </div>
            <div className="homepagebuttons">
              <button className="btn-glow" onClick={() => navigate('/register')}>انضم كطالب</button>
              <button className="btn-glow" onClick={() => navigate('/teacher/register')}>انضم كمعلم</button>
            </div>
          </div>
        </div>
        <div className="ImageContainer">
          <img className="StudentImage" src={studentImage} alt="student" />
        </div>
      </div>

      <div className="section2 fade-in">
        <div className="howitWork">
          كيف تعمل منصة ألف
          <div><span>تربطك بأفضل المعلمين من خلال عملية مبسطة مكونة من ثلاث خطوات</span></div>
        </div>
        <div className="stepsCards">
          <HowitWorkSteps title="ابحث" description="تصفح الملفات الشخصية، إقرأ التقييمات، و قم بالتصفية حسب المادة لتجد معلمك المناسب." />
          <HowitWorkSteps title="تواصل" description="راسل المعلمين مباشرة و ناقش معهم أهدافك ثم سارع لحجز جلسة تناسب جدولك الدراسي" />
          <HowitWorkSteps title="تعلم" description="انضم إلى موقعنا التفاعلي ثم احجز جلستك و ابدأ بإتقان موادك مع أفضل المعلمين" />
        </div>
      </div>

      <div className="section3 fade-in">
        <div className="bestTutors">
          <div>نخبة من المعلمين المتميزين</div>
          <div className="bestTutorssubtitle">
            اختر المعلم الأنسب لك من بين مجموعة واسعة من الخبراء في جميع المجالات الدراسية
          </div>
        </div>

        <div className="bestTutorsContainer">
          {loading && <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>جاري التحميل...</p>}
          {error && <p style={{ textAlign: 'center', color: 'var(--text-danger)' }}>{error}</p>}
          {!loading && !error && teachers.map(teacher => (
            <TeacherCard key={teacher.id} teacher={teacher} />
          ))}
        </div>
      </div>

      <div className="section4 fade-in">
        <span className="s4Title">أسئلة شائعة</span>
        <div className="s4Title">كل ما تحتاج معرفته</div>
        <div className="s4subtitle">إجابات على الأسئلة الأكثر شيوعاً حول منصة ألف و كيفية الاستفادة منها</div>
        <FAQItem question="كيف يمكنني العثور على معلم مناسب؟" answer={<>1 - اختر المادة التي تبحث عن أستاذ لها<br />2 - اختر المرحلة التي تدرس فيها<br />3 - يمكنك ترتيب الأساتذة حسب التقييم</>} />
        <FAQItem question="كيف يمكنني التسجيل في المنصة كطالب ؟" answer={<>1 - إنشاء حساب كطالب<br />2 - املأ معلومات التواصل الخاصة بك<br />3 - إملأ المعلومات الدراسية الخاصة بك</>} />
        <FAQItem question="كيف يمكنني التسجيل في المنصة كأستاذ ؟" answer={<>1 - إنشاء حساب كأستاذ<br />2 - املأ معلومات التواصل الخاصة بك<br />3 - اختر المواد التي تدرسها و حدد سنوات خبرتك</>} />
      </div>
    </>
  );
}