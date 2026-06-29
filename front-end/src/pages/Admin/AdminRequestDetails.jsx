import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AdminHeader from './AdminHeader';
import '../../styles/Admin/AdminDashboard.css';
import '../../styles/Admin/AdminRequestDetails.css';
import { getTutorById, verifyTutor, banTutor, restoreTutor } from '../../api/adminTeachers';
import { mapTutorToUI } from '../../api/tutorMapper';
import { getAdminTutorStatus } from '../../utils/adminTutorStatus';
import { getErrorMessage } from '../../utils/apiErrors';
import { FaCheckCircle, FaBan, FaUndo } from 'react-icons/fa';

const STATUS_LABELS = {
  pending: 'بانتظار التحقق',
  accepted: 'موثّق',
  rejected: 'محظور',
};

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

  const handleRestore = async () => {
    const confirmed = window.confirm(
      'استرجاع الحساب سيعيد تفعيله على المنصة حسب حالة التوثيق السابقة. هل تريد المتابعة؟'
    );
    if (!confirmed) return;

    setIsProcessing(true);
    setError('');
    try {
      await restoreTutor(id);
      navigate('/admin');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) return <div className="loading">جاري التحميل...</div>;
  if (!request) return <div className="loading">{error || 'لم يتم العثور على الحساب'}</div>;

  const fullName = `${request.firstname} ${request.lastname}`;

  return (
    <div className="admin-dashboard-container">
      <AdminHeader activeTab="requests" setActiveTab={() => {}} />
      <div className="admin-content admin-request-details">
        <button type="button" className="back-btn" onClick={() => navigate('/admin')}>
          ← العودة لمراجعة الحسابات
        </button>

        {error && <div className="error-message">{error}</div>}

        <div className="verification-identity-card">
          <div className="verification-identity-main">
            <span className={`verification-status-badge ${request.status}`}>
              {STATUS_LABELS[request.status] || request.status}
            </span>
            <h1 className="verification-title">{fullName}</h1>
            <p className="verification-subtitle">{request.email}</p>
          </div>

          <div className="verification-identity-actions">
            {request.status === 'rejected' ? (
              <button
                type="button"
                className="action-btn-square restore"
                onClick={handleRestore}
                disabled={isProcessing}
              >
                <FaUndo aria-hidden />
                <span>{isProcessing ? 'جارِ الاسترجاع...' : 'استرجاع الحساب'}</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="action-btn-square accept"
                  onClick={handleAccept}
                  disabled={isProcessing}
                >
                  <FaCheckCircle aria-hidden />
                  <span>{isProcessing ? 'جارِ المعالجة...' : 'توثيق الحساب'}</span>
                </button>
                <button
                  type="button"
                  className="action-btn-square reject"
                  onClick={handleReject}
                  disabled={isProcessing}
                >
                  <FaBan aria-hidden />
                  <span>{isProcessing ? 'جارِ المعالجة...' : 'حظر الحساب'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="details-card">
          <h2>المعلومات الشخصية</h2>
          <div className="info-row">
            <span>الاسم الكامل:</span> {fullName}
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
      </div>
    </div>
  );
}