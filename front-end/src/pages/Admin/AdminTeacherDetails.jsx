import { useParams, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import AdminHeader from './AdminHeader';
import '../../styles/Admin/AdminTeacherDetails.css';

// نفس بيانات mockAccepted (يمكن استيرادها من ملف مشترك)
const mockTeachers = [
  {
    id: 2,
    firstname: 'سارة',
    lastname: 'خالد',
    email: 'sara@example.com',
    phone: '+963911111111',
    yearsExperience: 8,
    subjects: [{ name: 'لغة عربية', years: 8 }],
    bio: 'مدرسة لغة عربية متميزة، خبرة 8 سنوات في تدريس المراحل المتوسطة والثانوية.',
    certificates: ['شهادة ماجستير لغة عربية.pdf'],
    teachingMethods: { online: true, offline: true },
    stagesPrices: [
      { stage: 'المرحلة الابتدائية', price: 250000 },
      { stage: 'المرحلة المتوسطة', price: 350000 },
      { stage: 'المرحلة الثانوية', price: 450000 }
    ]
  }
];

export default function AdminTeacherDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const teacher = useMemo(() => {
    return mockTeachers.find(t => t.id === parseInt(id));
  }, [id]);

  const handleDelete = () => {
    if (window.confirm('هل أنت متأكد من حذف هذا المعلم؟')) {
      // حذف من قاعدة البيانات (API)
      alert('تم حذف المعلم بنجاح');
      navigate('/admin');
    }
  };

  if (!teacher) return <div className="loading">لم يتم العثور على المعلم</div>;

  return (
    <div className="admin-dashboard-container">
      <AdminHeader activeTab="teachers" setActiveTab={() => {}} />
      <div className="admin-content">
        <button className="back-btn" onClick={() => navigate('/admin')}>← العودة إلى لوحة التحكم</button>

        <div className="teacher-details-card">
          <h2>البيانات الشخصية</h2>
          <div className="info-row"><span>الاسم الكامل:</span> {teacher.firstname} {teacher.lastname}</div>
          <div className="info-row"><span>البريد الإلكتروني:</span> {teacher.email}</div>
          <div className="info-row"><span>رقم الهاتف:</span> {teacher.phone}</div>
          <div className="info-row"><span>سنوات الخبرة الإجمالية:</span> {teacher.yearsExperience}</div>
          <div className="info-row"><span>طرق التدريس:</span> {teacher.teachingMethods.online && 'أونلاين '}{teacher.teachingMethods.offline && 'حضوري'}</div>
          <div className="info-row"><span>المواد التي يدرسها:</span> {teacher.subjects.map(s => `${s.name} (${s.years} سنوات)`).join(', ')}</div>
          <div className="info-row"><span>الأسعار حسب المرحلة:</span> {teacher.stagesPrices.map(p => `${p.stage}: ${p.price} ل.س`).join(' | ')}</div>
          <div className="info-row"><span>نبذة عن المعلم:</span> {teacher.bio}</div>
          <div className="info-row"><span>الشهادات:</span> {teacher.certificates.join(', ')}</div>
        </div>

        <button className="delete-teacher-btn" onClick={handleDelete}>حذف المعلم</button>
      </div>
    </div>
  );
}