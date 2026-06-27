import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Admin/AdminAcceptedTeachersTab.css';
import { FaChartBar, FaEye, FaTrashAlt, FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { getAllTutors, banTutor } from '../../api/adminTeachers';
import { isMarketplaceTutor } from '../../utils/adminTutorStatus';
import { getErrorMessage } from '../../utils/apiErrors';

function computeAverageRating(reviews) {
  if (!reviews?.length) return null;
  const avg = reviews.reduce((sum, review) => sum + review.number_of_stars, 0) / reviews.length;
  return Number(avg.toFixed(1));
}

function TeacherRating({ rating }) {
  const starTypes = [];
  for (let i = 1; i <= 5; i += 1) {
    if (rating == null) {
      starTypes.push('empty');
    } else if (rating >= i) {
      starTypes.push('full');
    } else if (rating >= i - 0.5) {
      starTypes.push('half');
    } else {
      starTypes.push('empty');
    }
  }

  return (
    <div className="teacher-rating" aria-label={rating != null ? `التقييم ${rating.toFixed(1)} من 5` : 'لا يوجد تقييم'}>
      <span className="teacher-rating-stars">
        {starTypes.map((type, index) => {
          if (type === 'full') return <FaStar key={index} aria-hidden />;
          if (type === 'half') return <FaStarHalfAlt key={index} aria-hidden />;
          return <FaRegStar key={index} className="star-empty" aria-hidden />;
        })}
      </span>
      <span className="teacher-rating-score">
        {rating != null ? `${rating.toFixed(1)} / 5.0` : '— / 5.0'}
      </span>
    </div>
  );
}

// تحويل بيانات المعلّم القادمة من الباك إند (TutorOut) إلى الشكل الذي تتوقعه الواجهة
function mapTutorToUI(tutor) {
  return {
    id: tutor.tutor_id,
    firstname: tutor.first_name,
    lastname: tutor.last_name,
    email: tutor.email,
    phone: tutor.phone_number,
    yearsExperience: tutor.total_experience_years ?? 0,
    averageRating: computeAverageRating(tutor.reviews),
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
  const [banningId, setBanningId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAcceptedTeachers = async () => {
      setIsLoading(true);
      setError('');
      try {
        // نجلب كل المعلمين (حتى 100) ثم نفلتر الموثّقين فقط (verified === true)
        const response = await getAllTutors({ page: 1, page_size: 100 });
        const acceptedOnly = response.data.filter(isMarketplaceTutor);
        setTeachers(acceptedOnly.map(mapTutorToUI));
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAcceptedTeachers();
  }, []);

  const handleViewReport = (id) => {
    navigate(`/admin/teacher/${id}/report`);
  };

  const handleViewTeacher = (id) => {
    navigate(`/admin/teacher/${id}`);
  };

  const handleBanTeacher = async (id) => {
    if (!window.confirm('حظر هذا المعلّم سيُخفيه من المنصة ويوقف نشاطه. هل أنت متأكد؟')) {
      return;
    }

    setBanningId(id);
    setError('');
    try {
      await banTutor(id);
      setTeachers((prev) => prev.filter((teacher) => teacher.id !== id));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBanningId(null);
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
          <div className="table-row table-row-empty">
            <span>لا يوجد معلمون موثّقون حالياً.</span>
          </div>
        )}
        {teachers.map((teacher) => (
          <div key={teacher.id} className="table-row">
            <div className="cell-name-block">
              <span className="cell-teacher-name">{teacher.firstname} {teacher.lastname}</span>
              <TeacherRating rating={teacher.averageRating} />
            </div>
            <span className="cell-email">{teacher.email}</span>
            <span>{teacher.phone}</span>
            <span>{teacher.yearsExperience}</span>
            <span className="cell-subjects">{teacher.subjects.map((s) => s.name).join('، ') || '—'}</span>
            <div className="actions-cell">
              <div className="action-buttons">
                <button
                  type="button"
                  className="action-btn report-btn"
                  onClick={() => handleViewReport(teacher.id)}
                  title="عرض تقرير النشاط والتقييمات"
                >
                  <FaChartBar aria-hidden />
                  <span>التقارير</span>
                </button>
                <button
                  type="button"
                  className="action-btn view-btn"
                  onClick={() => handleViewTeacher(teacher.id)}
                  title="عرض ملف المعلّم"
                >
                  <FaEye aria-hidden />
                  <span>الملف</span>
                </button>
                <button
                  type="button"
                  className="action-btn delete-btn"
                  onClick={() => handleBanTeacher(teacher.id)}
                  disabled={banningId === teacher.id}
                  title="حظر المعلّم"
                >
                  <FaTrashAlt aria-hidden />
                  <span>{banningId === teacher.id ? 'جارِ الحظر...' : 'حظر'}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
