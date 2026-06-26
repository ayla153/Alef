import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AdminHeader from './AdminHeader';
import '../../styles/Admin/AdminTeacherDetails.css';
import { getTutorById, deleteTutor } from '../../api/adminTeachers';
import { mapTutorToUI } from '../../api/tutorMapper';
import { getErrorMessage } from '../../utils/apiErrors';

export default function AdminTeacherDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [teacher, setTeacher] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchTeacher = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await getTutorById(id);
        setTeacher(mapTutorToUI(response.data));
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeacher();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المعلم؟')) return;

    setIsDeleting(true);
    setError('');
    try {
      await deleteTutor(id);
      navigate('/admin');
    } catch (err) {
      setError(getErrorMessage(err));
      setIsDeleting(false);
    }
  };

  if (isLoading) return <div className="loading">جاري التحميل...</div>;
  if (!teacher) return <div className="loading">{error || 'لم يتم العثور على المعلم'}</div>;

  return (
    <div className="admin-dashboard-container">
      <AdminHeader activeTab="teachers" setActiveTab={() => {}} />
      <div className="admin-content">
        <button className="back-btn" onClick={() => navigate('/admin')}>← العودة إلى لوحة التحكم</button>

        {error && <div className="error-message">{error}</div>}

        <div className="teacher-details-card">
          <h2>البيانات الشخصية</h2>
          <div className="info-row"><span>الاسم الكامل:</span> {teacher.firstname} {teacher.lastname}</div>
          <div className="info-row"><span>البريد الإلكتروني:</span> {teacher.email}</div>
          <div className="info-row"><span>رقم الهاتف:</span> {teacher.phone}</div>
          <div className="info-row"><span>سنوات الخبرة الإجمالية:</span> {teacher.yearsExperience}</div>
          <div className="info-row">
            <span>طرق التدريس:</span> {teacher.teachingMethods.online && 'أونلاين '}{teacher.teachingMethods.offline && 'حضوري'}
          </div>
          <div className="info-row">
            <span>المواد التي يدرسها:</span> {teacher.subjects.map((s) => `${s.name} (${s.years} سنوات)`).join(', ') || '—'}
          </div>
          <div className="info-row">
            <span>الأسعار حسب المادة/المرحلة:</span> {teacher.stagesPrices.map((p) => `${p.stage}: ${p.price} ل.س`).join(' | ') || '—'}
          </div>
          <div className="info-row"><span>نبذة عن المعلم:</span> {teacher.bio || '—'}</div>
          {/* ⚠️ الباك إند الحالي لا يرجّع رابط الشهادات ضمن بيانات المعلّم */}
          <div className="info-row">
            <span>الشهادات:</span> {teacher.certificates.length > 0 ? teacher.certificates.join(', ') : 'لا توجد بيانات متاحة'}
          </div>
        </div>

        <button className="delete-teacher-btn" onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? 'جارِ الحذف...' : 'حذف المعلم'}
        </button>
      </div>
    </div>
  );
}