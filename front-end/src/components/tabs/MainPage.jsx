// src/Pages/teacher/MainPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/MainPage.css';
import StatisticsCard from '../common/StatisticsCard';
import {
  FaPlusCircle, FaClipboardList, FaUserEdit, FaEnvelope, FaClock,
  FaStar, FaCheckCircle, FaHandHoldingHeart, FaRegClock, FaBolt,
  FaChartLine, FaBell, FaTimesCircle, FaTimes, FaBook, FaUserGraduate,FaInfoCircle,
} from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getMyProfile, getMyStats, getMyRecentRequests, getMyRecentActivity } from '../../api/tutorProfile';
import { formatRelativeTime } from '../../utils/formatRelativeTime';

const availableSubjects = [
  'الرياضيات', 'اللغة العربية', 'اللغة الانكليزية', 'اللغة الفرنسية',
  'العلوم', 'الفيزياء', 'الكيمياء', 'التربية الاسلامية',
  'التاريخ', 'الجغرافية', 'الوطنية', 'معلوماتية',
];

function iconForActivity(type) {
  if (type === 'private_lead_received') return { icon: <FaEnvelope />, color: '#6366f1' };
  if (type === 'private_lead_accepted' || type === 'offer_accepted' || type === 'contact_shared')
    return { icon: <FaCheckCircle />, color: '#10b981' };
  if (type === 'offer_rejected' || type === 'private_lead_rejected')
    return { icon: <FaTimesCircle />, color: '#ef4444' };
  return { icon: <FaBell />, color: '#f59e0b' };
}

function leadStatusLabel(status) {
  const map = {
    open: 'مفتوح',
    closed_shortlist: 'مختصر',
    closed_empty: 'مغلق بدون تطابق',
    closed_matched: 'تم التواصل',
    closed_expired: 'منتهي',
  };
  return map[status] || status;
}

export default function MainPage() {
  const navigate = useNavigate();

  const [tutorName, setTutorName]           = useState('');
  const [stats, setStats]                   = useState(null);
  const [weeklyData, setWeeklyData]         = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [isLoading, setIsLoading]           = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjectYears, setSubjectYears] = useState(0);

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const [profileRes, statsRes, requestsRes] = await Promise.all([
        getMyProfile(),
        getMyStats(),
        getMyRecentRequests(),
        getMyRecentActivity(),
      ]);

      setTutorName(profileRes.data.first_name || '');

      const s = statsRes.data;
      setStats({
        newCount:      s.new_requests,
        pendingCount:  s.pending_requests,
        acceptedCount: s.accepted_requests,
        rating:        s.average_rating ?? 0,
      });

      setWeeklyData(
        (s.weekly_activity || []).map((p) => ({ day: p.day, requests: p.count }))
      );

      setRecentActivity(
        (s.recent_activity || []).slice(0, 5).map((item, idx) => ({
          id: idx,
          text: item.text,
          time: formatRelativeTime(item.timestamp),
          ...iconForActivity(item.type),
        }))
      );

      setRecentRequests((requestsRes.data?.items || []).slice(0, 3));

    } catch (err) {
      console.error('فشل تحميل لوحة التحكم:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const id = setTimeout(fetchDashboard, 0);
    return () => clearTimeout(id);
  }, []);

  const handleAddSubject = () => {
    if (!selectedSubject) {
      alert('الرجاء اختيار مادة');
      return;
    }
    navigate('/profile', {
      state: {
        addSubject: { name: selectedSubject, years: subjectYears || 0 },
        startEditing: true,
      },
    });
    setIsModalOpen(false);
    setSelectedSubject('');
    setSubjectYears(0);
  };

  const openModal = () => {
    setIsModalOpen(true);
    setSelectedSubject('');
    setSubjectYears(0);
  };

  return (
    <div className="con fade-in">
      {/* ─── ترحيب ─── */}
      <div className="welcome-section">
        <FaHandHoldingHeart className="welcome-icon" />
        <div className="welcome-text">
          <h2>أهلاً بك أستاذ {isLoading ? '...' : tutorName}</h2>
          <p>ألقِ نظرة على نشاطك التعليمي!</p>
        </div>
      </div>

      {/* ─── بطاقات الإحصائيات ─── */}
      <div className="requests-container">
        <StatisticsCard title="الطلبات الجديدة"   icon={<FaEnvelope   style={{ color: '#10b981' }} />} count={isLoading ? '...' : (stats?.newCount      ?? 0)} bgcolor="#d1fae5" hcolor="#10b981" />
        <StatisticsCard title="الطلبات المعلقة"   icon={<FaClock       style={{ color: '#6366f1' }} />} count={isLoading ? '...' : (stats?.pendingCount  ?? 0)} bgcolor="#e0e7ff" hcolor="#6366f1" />
        <StatisticsCard title="الطلبات المقبولة"  icon={<FaCheckCircle style={{ color: '#10b981' }} />} count={isLoading ? '...' : (stats?.acceptedCount ?? 0)} bgcolor="#d1fae5" hcolor="#10b981" />
        <StatisticsCard title="التقييم"            icon={<FaStar        style={{ color: '#f59e0b' }} />} count={isLoading ? '...' : (stats?.rating        ?? 0)} bgcolor="#fef3c7" hcolor="#f59e0b" />
      </div>

      <div className="bottom-row">
        <div className="left-column">

          <div className="LastRequests">
            <div className="LastRequestsTitle">
              <div className="RT">
                <FaRegClock className="title-icon" />
                الطلبات الأخيرة
              </div>
              <button className="allReqBtn" onClick={() => navigate('/requests')}>
                عرض جميع الطلبات
              </button>
            </div>
            <div className="RecentRequestsCon">
              {isLoading ? (
                <p>جارِ التحميل...</p>
              ) : recentRequests.length === 0 ? (
                <p className="hint">لا توجد طلبات بعد.</p>
              ) : (
                recentRequests.map((req) => (
                  <div key={req.lead_id} className="recent-request-item">
                    <div className="rr-header">
                      <span className="rr-title">{req.title}</span>
                      <span className={`rr-status ${req.lead_status}`}>{leadStatusLabel(req.lead_status)}</span>
                    </div>
                    <div className="rr-meta">
                      <span>{req.subject} — {req.level}</span>
                      <span className={`rr-type ${req.is_public ? 'public' : 'private'}`}>
                        {req.is_public ? 'عام' : 'خاص'}
                      </span>
                    </div>
                    {req.student_name && (
                      <div className="rr-student">الطالب: {req.student_name}</div>
                    )}
                    <div className="rr-date">{new Date(req.created_at).toLocaleDateString('ar')}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <FaChartLine className="chart-icon" />
              <h3>عدد الطلبات خلال الأسبوع</h3>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day"      tick={{ fill: '#475569', fontSize: 12 }} axisLine={{ stroke: '#cbd5e1' }} />
                  <YAxis                    tick={{ fill: '#475569', fontSize: 12 }} axisLine={{ stroke: '#cbd5e1' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#1e293b', fontFamily: 'Cairo' }} labelStyle={{ fontWeight: 'bold' }} />
                  <Bar dataKey="requests" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        <div className="right-column">

          <div className="quick-actions-card">
            <div className="quick-actions-header">
              <FaBolt className="bolt-icon" />
              <h3>إجراءات سريعة</h3>
            </div>
            <div className="quick-actions-container">
              <button className="quick-action-btn" onClick={openModal}>
                <FaPlusCircle className="action-icon" /> إضافة مادة
              </button>
              <button className="quick-action-btn" onClick={() => navigate('/requests', { state: { filter: 'private' } })}>
                <FaClipboardList className="action-icon" /> مراجعة الطلبات
              </button>
              <button 
                className="quick-action-btn" 
                onClick={() => navigate('/profile', { state: { startEditing: true } })}
              >
                <FaUserEdit className="action-icon" /> تعديل الملف الشخصي
              </button>
            </div>
          </div>

          <div className="recent-activity-card">
            <div className="recent-activity-header">
              <FaBell className="activity-icon" />
              <h3>نشاط حديث</h3>
            </div>
            <div className="activity-list">
              {isLoading ? (
                <p>جارِ التحميل...</p>
              ) : recentActivity.length === 0 ? (
                <p>لا يوجد نشاط حديث بعد.</p>
              ) : (
                recentActivity.map((a) => (
                  <div key={a.id} className="activity-item">
                    <span className="activity-icon-wrapper" style={{ color: a.color }}>{a.icon}</span>
                    <div className="activity-content">
                      <span className="activity-text">{a.text}</span>
                      <span className="activity-time">{a.time}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ─── مودال إضافة مادة ─── */}
      {isModalOpen && (
        <div className="modal-overlay-new" onClick={() => setIsModalOpen(false)}>
          <div className="modal-box-new" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-new">
              <h3>
                <FaPlusCircle className="modal-header-icon" /> إضافة مادة جديدة
              </h3>
              <button className="close-modal-btn-new" onClick={() => setIsModalOpen(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="modal-body-new">
              <div className="form-group-new">
                <label><FaBook className="field-icon" /> اختر المادة</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  <option value="">-- اختر مادة --</option>
                  {availableSubjects.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div className="form-group-new">
                <label><FaUserGraduate className="field-icon" /> سنوات الخبرة في هذه المادة</label>
                <input
                  type="number"
                  min="0"
                  placeholder="مثال: 3"
                  value={subjectYears}
                  onChange={(e) => setSubjectYears(Number(e.target.value))}
                />
              </div>

              <div className="modal-hint-new">
                <FaInfoCircle className="hint-icon" />
                <span>سيتم إضافة المادة إلى ملفك الشخصي وتفعيل وضع التعديل تلقائياً.</span>
              </div>
            </div>

            <div className="modal-footer-new">
              <button className="btn-cancel-new" onClick={() => setIsModalOpen(false)}>إلغاء</button>
              <button className="btn-add-new" onClick={handleAddSubject}>
                <FaPlusCircle /> إضافة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}