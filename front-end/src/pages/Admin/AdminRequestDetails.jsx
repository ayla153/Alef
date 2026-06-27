import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AdminHeader from './AdminHeader';
import '../../styles/Admin/AdminDashboard.css';
import '../../styles/Admin/AdminRequestDetails.css';
import { getTutorById, verifyTutor, banTutor } from '../../api/adminTeachers';
import { mapTutorToUI } from '../../api/tutorMapper';
import { getAdminTutorStatus } from '../../utils/adminTutorStatus';
import { getErrorMessage } from '../../utils/apiErrors';

export default function AdminRequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchRequest = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await getTutorById(id);
        const mapped = {
          ...mapTutorToUI(response.data),
          status: getAdminTutorStatus(response.data),
        };
        setRequest(mapped);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequest();
  }, [id]);

  const handleAccept = async () => {
    setIsProcessing(true);
    setError('');
    try {
      await verifyTutor(id, true);
      navigate('/admin');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    // ⚠️ الباك إند الحالي لا يملك حالة "مرفوض" منفصلة عن الحذف.
    // الإجراء الوحيد المتاح حالياً هو حذف حساب المعلّم نهائياً.
    const confirmed = window.confirm(
      'حظر الحساب سيُخفيه من الماركت بليس ويمنعه من تقديم العروض واستقبال الطلبات الخاصة. هل تريد المتابعة؟'
    );
    if (!confirmed) return;

    setIsProcessing(true);
    setError('');
    try {
      await banTutor(id);
      navigate('/admin');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) return <div className="loading">جاري التحميل...</div>;
  if (!request) return <div className="loading">{error || 'لم يتم العثور على الحساب'}</div>;

  return (
    <div className="admin-dashboard-container">
      <AdminHeader activeTab="requests" setActiveTab={() => {}} />
      <div className="admin-content">
        <button className="back-btn" onClick={() => navigate('/admin')}>
          ← العودة لمراجعة الحسابات
        </button>

        {error && <div className="error-message">{error}</div>}

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
            {request.subjects.map((s) => `${s.name} (${s.years} سنوات)`).join(', ') || '—'}
          </div>
          <div className="info-row">
            <span>الأسعار حسب المادة/المرحلة:</span>
            {request.stagesPrices.map((p) => `${p.stage}: ${p.price} ل.س`).join(' | ') || '—'}
          </div>
          <div className="info-row">
            <span>نبذة عنك:</span> {request.bio || '—'}
          </div>
        </div>

        <div className="details-card">
          <h2>الشهادات والمستندات</h2>
          {/* ⚠️ الباك إند الحالي لا يرجّع رابط الشهادات ضمن بيانات المعلّم */}
          {request.certificates.length > 0 ? (
            <ul>
              {request.certificates.map((cert, idx) => <li key={idx}>{cert}</li>)}
            </ul>
          ) : (
            <p>لا توجد بيانات شهادات متاحة من الباك إند حالياً</p>
          )}
        </div>

        <div className="action-buttons">
          {request.status !== 'rejected' && (
            <>
              <button className="accept-btn" onClick={handleAccept} disabled={isProcessing}>
                {isProcessing ? 'جارِ المعالجة...' : 'توثيق الحساب'}
              </button>
              <button className="reject-btn" onClick={handleReject} disabled={isProcessing}>
                {isProcessing ? 'جارِ المعالجة...' : 'حظر الحساب'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}