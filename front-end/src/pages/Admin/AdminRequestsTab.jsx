import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Admin/AdminRequestsTab.css';
import { FaEnvelope, FaCheckCircle, FaTimesCircle, FaClock, FaClipboardCheck } from 'react-icons/fa';
import { getAllTutors } from '../../api/adminTeachers';
import { mapTutorToUI } from "../../api/tutorMapper";
import { getAdminTutorStatus } from '../../utils/adminTutorStatus';
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
          status: getAdminTutorStatus(tutor),
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

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const stats = {
    pending: requests.filter((r) => r.status === 'pending').length,
    accepted: requests.filter((r) => r.status === 'accepted').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
    overdueReview: requests.filter((r) => {
      if (r.status !== 'pending' || !r.submittedAt) return false;
      return new Date(r.submittedAt).getTime() < sevenDaysAgo;
    }).length,
  };

  const filteredRequests = filter === 'all' ? requests : requests.filter((r) => r.status === filter);

  const handleViewDetails = (requestId) => {
    navigate(`/admin/request/${requestId}`);
  };

  const formatDate = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('ar-SY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
        <div className="stat-card overdue">
          <FaClock className="stat-icon" />
          <div className="stat-info">
            <span className="stat-value">{stats.overdueReview}</span>
            <span className="stat-label">التدقيق</span>
          </div>
        </div>
      </div>

      <div className="filter-buttons">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>الكل</button>
        <button className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>بانتظار التحقق</button>
        <button className={filter === 'accepted' ? 'active' : ''} onClick={() => setFilter('accepted')}>موثّقون</button>
        <button className={filter === 'rejected' ? 'active' : ''} onClick={() => setFilter('rejected')}>محظورون</button>
      </div>

      <div className="requests-table">
        <div className="table-header">
          <span>المعلّم</span>
          <span>البريد الإلكتروني</span>
          <span>تاريخ التسجيل</span>
          <span>الحالة</span>
          <span>الإجراءات</span>
        </div>
        {filteredRequests.length === 0 && (
          <div className="table-row table-row-empty">
            <span>لا توجد حسابات لعرضها.</span>
          </div>
        )}
        {filteredRequests.map((req) => (
          <div key={req.id} className="table-row">
            <span className="cell-name">{req.firstname} {req.lastname}</span>
            <span className="cell-email">{req.email}</span>
            <span className="cell-date">{formatDate(req.submittedAt)}</span>
            <span className={`status-badge ${req.status}`}>
              {req.status === 'pending'
                ? 'بانتظار التحقق'
                : req.status === 'accepted'
                  ? 'موثّق'
                  : 'محظور'}
            </span>
            <div className="actions-cell">
              <button
                type="button"
                className="review-btn"
                onClick={() => handleViewDetails(req.id)}
                title="عرض الملف للتحقق"
              >
                <FaClipboardCheck aria-hidden />
                <span>تحقق</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}