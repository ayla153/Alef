import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Admin/AdminAcceptedTeachersTab.css';
import { getAllTutors, deleteTutor } from '../../api/adminTeachers';
import { getErrorMessage } from '../../utils/apiErrors';

// تحويل بيانات المعلّم القادمة من الباك إند (TutorOut) إلى الشكل الذي تتوقعه الواجهة
function mapTutorToUI(tutor) {
  return {
    id: tutor.tutor_id,
    firstname: tutor.first_name,
    lastname: tutor.last_name,
    email: tutor.email,
    phone: tutor.phone_number,
    yearsExperience: tutor.total_experience_years ?? 0,
    subjects: (tutor.tutor_subjects || []).map((ts) => ({
      name: ts.subject?.subject_title || '—',
      years: ts.experience_years
    })),
    bio: tutor.bio || '',
    // ⚠️ الباك إند الحالي (TutorOut) لا يرجع رابط الشهادات ضمن بيانات المعلّم،
    // لذلك هذا الحقل سيبقى فارغاً لحين إضافة الحقل من طرف الباك إند.
    certificates: [],
    teachingMethods: {
      online: tutor.tution_type === 'online' || tutor.tution_type === 'both',
      offline: tutor.tution_type === 'offline' || tutor.tution_type === 'both'
    },
    // ⚠️ الأسعار بالباك إند مرتبطة بكل مادة على حدة (price_per_hour ضمن tutor_subjects)
    // وليست "سعر موحّد لكل مرحلة" كما كان مفترضاً بالواجهة الأصلية (mock data).
    // لذلك تم بناء القائمة هنا من بيانات المواد الفعلية لكل معلّم.
    stagesPrices: (tutor.tutor_subjects || []).map((ts) => {
      const stageLabels = [
        ts.elementory_stage ? 'ابتدائي' : null,
        ts.middle_stage ? 'متوسط' : null,
        ts.high_stage ? 'ثانوي' : null
      ].filter(Boolean);

      return {
        stage: `${ts.subject?.subject_title || 'مادة'} (${stageLabels.join(' / ') || 'غير محدد'})`,
        price: ts.price_per_hour
      };
    })
  };
}

export default function AdminAcceptedTeachersTab() {
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAcceptedTeachers = async () => {
      setIsLoading(true);
      setError('');
      try {
        // نجلب كل المعلمين (حتى 100) ثم نفلتر الموثّقين فقط (verified === true)
        const response = await getAllTutors({ page: 1, page_size: 100 });
        const acceptedOnly = response.data.filter((tutor) => tutor.verified === true);
        setTeachers(acceptedOnly.map(mapTutorToUI));
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAcceptedTeachers();
  }, []);

  const handleViewTeacher = (id) => {
    navigate(`/admin/teacher/${id}`);
  };

  const handleDeleteTeacher = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المعلم؟ لا يمكن التراجع عن هذا الإجراء.')) {
      return;
    }

    setDeletingId(id);
    setError('');
    try {
      await deleteTutor(id);
      setTeachers((prev) => prev.filter((teacher) => teacher.id !== id));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="accepted-teachers-tab">
        <p>جارِ تحميل قائمة المعلمين...</p>
      </div>
    );
  }

  return (
    <div className="accepted-teachers-tab">
      {error && <div className="error-message">{error}</div>}

      <div className="teachers-table">
        <div className="table-header">
          <span>المعلم</span>
          <span>البريد الإلكتروني</span>
          <span>الهاتف</span>
          <span>سنوات الخبرة</span>
          <span>المواد</span>
          <span>الإجراءات</span>
        </div>
        {teachers.length === 0 && !error && (
          <div className="table-row">
            <span>لا يوجد معلمون موثّقون حالياً.</span>
          </div>
        )}
        {teachers.map((teacher) => (
          <div key={teacher.id} className="table-row">
            <span>{teacher.firstname} {teacher.lastname}</span>
            <span>{teacher.email}</span>
            <span>{teacher.phone}</span>
            <span>{teacher.yearsExperience}</span>
            <span>{teacher.subjects.map((s) => s.name).join(', ') || '—'}</span>
            <div className="action-buttons">
              <button className="view-btn" onClick={() => handleViewTeacher(teacher.id)}>
                عرض الملف
              </button>
              <button
                className="delete-btn"
                onClick={() => handleDeleteTeacher(teacher.id)}
                disabled={deletingId === teacher.id}
              >
                {deletingId === teacher.id ? 'جارِ الحذف...' : 'حذف'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
