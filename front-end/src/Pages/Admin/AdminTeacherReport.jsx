import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AdminHeader from './AdminHeader';
import '../../styles/Admin/AdminDashboard.css';
import '../../styles/Admin/AdminTeacherReport.css';
import { getTutorReport } from '../../api/adminTeachers';
import { getErrorMessage } from '../../utils/apiErrors';
import {
  FaPaperPlane,
  FaUserFriends,
  FaHeart,
  FaStar,
  FaClock,
  FaCalendarAlt,
} from 'react-icons/fa';

function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('ar-SY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function renderStars(count) {
  return '★'.repeat(count) + '☆'.repeat(5 - count);
}

export default function AdminTeacherReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await getTutorReport(id);
        setReport(response.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  if (isLoading) {
    return <div className="loading">جارِ تحميل التقرير...</div>;
  }

  if (!report) {
    return <div className="loading">{error || 'لم يتم العثور على التقرير'}</div>;
  }

  return (
    <div className="admin-dashboard-container">
      <AdminHeader activeTab="teachers" setActiveTab={() => {}} />
      <div className="admin-content">
        <button className="back-btn" onClick={() => navigate('/admin')}>
          ← العودة إلى المعلّمون الموثّقون
        </button>

        {error && <div className="error-message">{error}</div>}

        <div className="report-header">
          <h1>تقرير المعلّم: {report.tutor_name}</h1>
          <p className="report-subtitle">ملخص النشاط والتقييمات على المنصة</p>
        </div>

        <div className="report-stats-grid">
          <div className="report-stat-card">
            <FaPaperPlane className="report-stat-icon offers" />
            <div>
              <span className="report-stat-value">{report.offers_submitted_count}</span>
              <span className="report-stat-label">عروض قدّمها</span>
            </div>
          </div>
          <div className="report-stat-card">
            <FaUserFriends className="report-stat-icon private" />
            <div>
              <span className="report-stat-value">{report.private_leads_received_count}</span>
              <span className="report-stat-label">طلبات خاصة وصلته</span>
            </div>
          </div>
          <div className="report-stat-card">
            <FaHeart className="report-stat-icon favorites" />
            <div>
              <span className="report-stat-value">{report.favorites_count}</span>
              <span className="report-stat-label">حفظه بالمفضلة</span>
            </div>
          </div>
          <div className="report-stat-card">
            <FaStar className="report-stat-icon rating" />
            <div>
              <span className="report-stat-value">
                {report.average_rating != null ? report.average_rating : '—'}
              </span>
              <span className="report-stat-label">متوسط التقييم ({report.reviews_count})</span>
            </div>
          </div>
          <div className="report-stat-card">
            <FaClock className="report-stat-icon activity" />
            <div>
              <span className="report-stat-value report-stat-date">
                {formatDateTime(report.last_seen_at)}
              </span>
              <span className="report-stat-label">آخر نشاط</span>
            </div>
          </div>
          <div className="report-stat-card">
            <FaCalendarAlt className="report-stat-icon registered" />
            <div>
              <span className="report-stat-value report-stat-date">
                {formatDateTime(report.registered_at)}
              </span>
              <span className="report-stat-label">تاريخ التسجيل</span>
            </div>
          </div>
        </div>

        <div className="report-reviews-card">
          <h2>التقييمات ({report.reviews_count})</h2>
          {report.reviews.length === 0 ? (
            <p className="report-empty">لا توجد تقييمات بعد.</p>
          ) : (
            <div className="reviews-list">
              {report.reviews.map((review) => (
                <div key={review.review_id} className="review-item">
                  <div className="review-item-header">
                    <span className="review-student">{review.student_name}</span>
                    <span className="review-stars" title={`${review.number_of_stars} من 5`}>
                      {renderStars(review.number_of_stars)}
                    </span>
                  </div>
                  {review.comment && <p className="review-comment">{review.comment}</p>}
                  <span className="review-date">{formatDateTime(review.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          className="view-profile-btn"
          onClick={() => navigate(`/admin/teacher/${id}`)}
        >
          عرض الملف الكامل
        </button>
      </div>
    </div>
  );
}
