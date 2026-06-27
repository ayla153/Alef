import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Admin/AdminRequestsTab.css';
import { FaEnvelope, FaCheckCircle, FaTimesCircle, FaChartLine } from 'react-icons/fa';
import { getAllTutors } from '../../api/adminTeachers';
import { mapTutorToUI } from "../../api/tutorMapper";
import { getErrorMessage } from '../../utils/apiErrors';

export default function AdminRequestsTab() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await getAllTutors({ page: 1, page_size: 100 });
        const mapped = response.data.map((tutor) => ({
          ...mapTutorToUI(tutor),
          // ⚠️ الباك إند الحالي يدعم فقط verified: true/false، ولا توجد حالة "مرفوض" منفصلة.
          // pending = verified:false ، accepted = verified:true ، rejected لا وجود لها فعلياً بالباك إند.
          status: tutor.verified ? 'accepted' : 'pending'
        }));
        setRequests(mapped);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const stats = {
    pending: requests.filter((r) => r.status === 'pending').length,
    accepted: requests.filter((r) => r.status === 'accepted').length,
    // ⚠️ ستبقى دائماً صفر لعدم وجود حالة "مرفوض" بالباك إند الحالي
    rejected: requests.filter((r) => r.status === 'rejected').length,
    dailyAverage: (requests.length / 7).toFixed(1)
  };

  const filteredRequests = filter === 'all' ? requests : requests.filter((r) => r.status === filter);

  const handleViewDetails = (requestId) => {
    navigate(`/admin/request/${requestId}`);
  };

  if (isLoading) {
    return <div className="loading">جارِ تحميل الحسابات...</div>;
  }

  return (
    <div className="admin-requests-tab">
      {error && <div className="error-message">{error}</div>}

      <div className="stats-cards">
        <div className="stat-card pending">
          <FaEnvelope className="stat-icon" />
          <div className="stat-info">
            <span className="stat-value">{stats.pending}</span>
            <span className="stat-label">بانتظار التحقق</span>
          </div>
        </div>
        <div className="stat-card accepted">
          <FaCheckCircle className="stat-icon" />
          <div className="stat-info">
            <span className="stat-value">{stats.accepted}</span>
            <span className="stat-label">موثّقون</span>
          </div>
        </div>
        <div className="stat-card rejected">
          <FaTimesCircle className="stat-icon" />
          <div className="stat-info">
            <span className="stat-value">{stats.rejected}</span>
            <span className="stat-label">محظورون</span>
          </div>
        </div>
        <div className="stat-card average">
          <FaChartLine className="stat-icon" />
          <div className="stat-info">
            <span className="stat-value">{stats.dailyAverage}</span>
            <span className="stat-label">معدل يومي</span>
          </div>
        </div>
      </div>

      <p className="backend-limitation-note">
        * حالة «محظورون» ستُفعَّل لاحقاً مع أرشيف الحسابات المحذوفة وإمكانية الاسترجاع.
      </p>

      <div className="filter-buttons">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>الكل</button>
        <button className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>بانتظار التحقق</button>
        <button className={filter === 'accepted' ? 'active' : ''} onClick={() => setFilter('accepted')}>موثّقون</button>
        <button className={filter === 'rejected' ? 'active' : ''} onClick={() => setFilter('rejected')}>محظورون</button>
      </div>

      <div className="requests-table">
        <div className="table-header">
          <span>المعلم</span>
          <span>البريد الإلكتروني</span>
          <span>تاريخ التسجيل</span>
          <span>الحالة</span>
          <span></span>
        </div>
        {filteredRequests.length === 0 && (
          <div className="table-row">
            <span>لا توجد حسابات لعرضها.</span>
          </div>
        )}
        {filteredRequests.map((req) => (
          <div key={req.id} className="table-row">
            <span>{req.firstname} {req.lastname}</span>
            <span>{req.email}</span>
            <span>{req.submittedAt}</span>
            <span className={`status-badge ${req.status}`}>
              {req.status === 'pending'
                ? 'بانتظار التحقق'
                : req.status === 'accepted'
                  ? 'موثّق'
                  : 'محظور'}
            </span>
            <button className="review-btn" onClick={() => handleViewDetails(req.id)}>
              عرض الملف للتحقق
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}