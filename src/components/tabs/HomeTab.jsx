import HowitWorkSteps from '../HowitWorkSteps';
import BesTutors from '../BesTutors';
import FAQItem from '../FAQItem';
import '../../styles/HomeTab.css';
import studentImage from '../../assets/homePageImage.png';

export default function HomeTab() {
  const teachers = [
    {
      id: 1,
      name: 'رغد طليمات',
      image: 'https://randomuser.me/api/portraits/women/1.jpg',
      subtitle: 'مدرسة رياضيات متخصصة',
      rating: 4.8,
      reviews: 120,
      experience: 5,
      subjects: ['رياضيات', 'فيزياء'],
      modes: ['online', 'offline'],
      onlinePrice: 300,
      offlinePrice: 400,
    },
    {
      id: 2,
      name: 'شهد عبارة',
      image: 'https://randomuser.me/api/portraits/women/2.jpg',
      subtitle: 'مدرسة لغة إنجليزية',
      rating: 4.9,
      reviews: 95,
      experience: 4,
      subjects: ['انكليزي'],
      modes: ['online'],
      onlinePrice: 250,
      offlinePrice: 0,
    },
    {
      id: 3,
      name: 'هدى الطبال',
      image: 'https://randomuser.me/api/portraits/women/3.jpg',
      subtitle: 'مدرسة لغة عربية',
      rating: 4.7,
      reviews: 88,
      experience: 6,
      subjects: ['عربي', 'تربية إسلامية'],
      modes: ['online', 'offline'],
      onlinePrice: 280,
      offlinePrice: 350,
    },
    {
      id: 4,
      name: 'أيلة الراس',
      image: 'https://randomuser.me/api/portraits/women/4.jpg',
      subtitle: 'مدرسة تاريخ',
      rating: 4.6,
      reviews: 72,
      experience: 3,
      subjects: ['تاريخ', 'جغرافية'],
      modes: ['online'],
      onlinePrice: 220,
      offlinePrice: 0,
    }
  ];
  return (
    <>
      <div className="firstsection fade-in">
        <div className="homepageTitle">
          <div className="homepageTitle2">
            <div>أتقن أي مادة مع</div>
            <div><span className="besttutor">أفضل المعلمين</span></div>
            <div className="homepagesubtitle">انضم إلى منصة ألف التعليمية وحقق أهدافك الأكاديمية من خلال دروس خصوصية مع معلمين من اختيارك</div>
            <div className="homepagebuttons">
              <button className="btn-glow">انضم كطالب</button>
              <button className="btn-glow">انضم كمعلم</button>
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
          <div className="bestTutorssubtitle">اختر المعلم الأنسب لك من بين مجموعة واسعة من الخبراء في جميع المجالات الدراسية</div>
        </div>
        <div className="bestTutorsContainer">
            {teachers.map((teacher) => (
                <BesTutors key={teacher.id} teacher={teacher} />
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