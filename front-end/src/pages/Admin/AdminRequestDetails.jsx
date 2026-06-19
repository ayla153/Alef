import { useParams, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import AdminHeader from './AdminHeader';
import '../../styles/Admin/AdminDashboard.css';  // تأكد من وجود هذا الملف
import '../../styles/Admin/AdminRequestDetails.css';

// بيانات وهمية (نفس البيانات المستخدمة في AdminRequestsTab)
const mockRequests = [
  {
    id: 1,
    firstname: 'أحمد',
    lastname: 'محمد',
    email: 'ahmed@example.com',
    phone: '+963988888888',
    status: 'pending',
    submittedAt: '2025-05-20',
    yearsExperience: 5,
    teachingMethods: { online: true, offline: false },
    subjects: [
      { name: 'رياضيات', years: 5 },
      { name: 'فيزياء', years: 3 }
    ],
    stagesPrices: [
      { stage: 'المرحلة الابتدائية', price: 300000 },
      { stage: 'المرحلة المتوسطة', price: 400000 },
      { stage: 'المرحلة الثانوية', price: 500000 }
    ],
    bio: 'أنا مدرس رياضيات خبرة 5 سنوات...',
    certificates: ['شهادة.pdf', 'دورة.jpg']
  },
  {
    id: 2,
    firstname: 'سارة',
    lastname: 'خالد',
    email: 'sara@example.com',
    phone: '+963911111111',
    status: 'accepted',
    submittedAt: '2025-05-18',
    yearsExperience: 8,
    teachingMethods: { online: true, offline: true },
    subjects: [
      { name: 'لغة عربية', years: 8 }
    ],
    stagesPrices: [
      { stage: 'المرحلة الابتدائية', price: 250000 },
      { stage: 'المرحلة المتوسطة', price: 350000 },
      { stage: 'المرحلة الثانوية', price: 450000 }
    ],
    bio: 'مدرسة لغة عربية متميزة...',
    certificates: ['شهادة ماجستير.pdf']
  },
  {
    id: 3,
    firstname: 'عمر',
    lastname: 'علي',
    email: 'omar@example.com',
    phone: '+963922222222',
    status: 'rejected',
    submittedAt: '2025-05-15',
    yearsExperience: 2,
    teachingMethods: { online: false, offline: true },
    subjects: [
      { name: 'كيمياء', years: 2 }
    ],
    stagesPrices: [
      { stage: 'المرحلة الابتدائية', price: 200000 },
      { stage: 'المرحلة المتوسطة', price: 250000 },
      { stage: 'المرحلة الثانوية', price: 300000 }
    ],
    bio: 'مدرس كيمياء مبتدئ...',
    certificates: []
  }
];

export default function AdminRequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // حساب الطلب باستخدام useMemo (لا يحتاج useEffect ولا useState)
  const request = useMemo(() => {
    return mockRequests.find(r => r.id === parseInt(id));
  }, [id]);

  if (!request) return <div className="loading">جاري التحميل...</div>;

  return (
    <div className="admin-dashboard-container">
      {/* ✅ الهيدر سيظهر الآن في كل الأحوال */}
      <AdminHeader activeTab="requests" setActiveTab={() => {}} />
      <div className="admin-content">
        <button className="back-btn" onClick={() => navigate('/admin')}>
          ← العودة لقائمة الطلبات
        </button>

        <div className="details-card">
          <h2>المعلومات الشخصية</h2>
          <div className="info-row">
            <span>الاسم الكامل:</span> {request.firstname} {request.lastname}
          </div>
          <div className="info-row">
            <span>البريد الإلكتروني:</span> {request.email}
          </div>
          <div className="info-row">
            <span>رقم الهاتف:</span> {request.phone}
          </div>
        </div>

        <div className="details-card">
          <h2>تفاصيل التدريس والتسعير</h2>
          <div className="info-row">
            <span>سنوات الخبرة الإجمالية:</span> {request.yearsExperience}
          </div>
          <div className="info-row">
            <span>طرق التدريس:</span>
            {request.teachingMethods.online && ' أونلاين '}
            {request.teachingMethods.offline && ' حضوري '}
          </div>
          <div className="info-row">
            <span>المواد التي يدرسها:</span>
            {request.subjects.map(s => `${s.name} (${s.years} سنوات)`).join(', ')}
          </div>
          <div className="info-row">
            <span>الأسعار حسب المرحلة:</span>
            {request.stagesPrices.map(p => `${p.stage}: ${p.price} ل.س`).join(' | ')}
          </div>
          <div className="info-row">
            <span>نبذة عنك:</span> {request.bio}
          </div>
        </div>

        <div className="details-card">
          <h2>الشهادات والمستندات</h2>
          {request.certificates.length > 0 ? (
            <ul>
              {request.certificates.map((cert, idx) => <li key={idx}>{cert}</li>)}
            </ul>
          ) : <p>لا توجد شهادات مرفوعة</p>}
        </div>

        <div className="action-buttons">
          <button className="accept-btn">قبول الطلب</button>
          <button className="reject-btn">رفض الطلب</button>
        </div>
      </div>
    </div>
  );
}