import { useNavigate } from 'react-router-dom';
import '../../styles/HowItWorks.css'
import { useState } from 'react';
import HowitWorkSteps from '../HowitWorkSteps'

export default function HowItWorksTab() {
  const [activeTab, setActiveTab] = useState("student");
  const navigate = useNavigate();
  return (
    <div className="howitworks_tab fade-in">
      <section className="hero-short">
      <div className="hero-short-content">
        <h1>كيف تعمل المنصة؟</h1>
        <p>
          سواء كنت تبحث عن مدرس خصوصي لتطوير مهاراتك أو كنت مدرساً ترغب في مشاركة معرفتك.
          نحن هنا لنجعل العملية سهلة وسلسة.
        </p>
      </div>
    </section>
    
    <div className="path-container">
      <div className="path-buttons-wrapper">
        <button
          className={`path-btn ${activeTab === "student" ? "active" : ""}`}
          onClick={() => setActiveTab("student")}>
          للطلاب
        </button>
        <button
          className={`path-btn ${activeTab === "teacher" ? "active" : ""}`}
          onClick={() => setActiveTab("teacher")}>
          للأساتذة
        </button>
      </div>
    </div>

    <div>
      {activeTab === "student" && (
        <div className='student-content'>
            <div className="section-title">رحلتك كطالب في 3 خطوات</div>
            <div className="section-subtitle">نسهل عليك العثور على المعلم المثالي والبدء في دروسك الخصوصية</div>
            <div className="steps-container">
            <HowitWorkSteps 
              title="ابحث عن مدرس" 
              description="تصفح آلاف الملفات الشخصية للمدرسين المؤهلين. استخدم الفلتر لتحديد المادة، السعر، والموقع المناسب لك." 
            />
            <HowitWorkSteps 
              title="تواصل واحجز" 
              description="تحدث مع المدرس مباشرة عبر رسائل الصباحية للاستفسار. ثم احجز موعد الدرس بسهولة عبر التقييم المدمج." 
            />
            <HowitWorkSteps 
              title="ابدأ التعلم" 
              description="احضر الدرس في الموعد المحدد. سواء كان أولادك أو أطفالك، يمكنك أن تعرفون أكثر من 10 خيارات لتعلم." 
            />
          </div>
          <button className='btn-teacher-student' onClick={() => navigate('/register')}>سجل كطالب</button>
        </div>
      )}

      {activeTab === "teacher" && (
        <div className="teacher-content">
          <div className="section-title">انطلق كمعلم في 4 خطوات</div>
          <div className="section-subtitle">انضم إلى شبكة واسعة من المعلمين و شارك خبراتك مع طلاب يبحثون عن مهاراتك</div>
          <div className="steps-container">
            <HowitWorkSteps 
              title="بناء الملف الشخصي" 
              description="أشهر حساساً شائعاً ببرز خبراتك، سوقتك العالمية، وسورة إخراجية لخدمت الطلب والتميز في نتائج البحث." 
            />
            <HowitWorkSteps 
              title="المواد والمعايير" 
              description="حدد المواد الدراسية التي تدرسها، واصطلاحات الجوائز الأساسية لإظهار الأدوات المتاحة لتسجيل الطلب." 
            />
            <HowitWorkSteps 
              title="إدارة الطلبات" 
              description="استقبل طلبات الطالب. نواصل معهم للتفاعل، وقم بقبول الحجوزات وإدارتها بسهولة من لوحة التحكم." 
            />
            <HowitWorkSteps 
              title="تقديم الدروس" 
              description="قدم دروس سودا أولئك عبر فرصة الإفتراضية أو حضوري. واحصل على تقييمات لزيادة موثوقيتك." 
            />
          </div>
          <button className='btn-teacher-student' onClick={() => navigate('/teacher/register')}>سجل كمعلم</button>
        </div>
      )}
      


    </div>

    </div>
  );
}
