// src/components/tabs/MainPage.jsx
import { useState, useEffect, useCallback } from 'react';
import '../../styles/MainPage.css';
import StatisticsCard from '../common/StatisticsCard';
import {
  FaPlusCircle, FaClipboardList, FaUserEdit, FaEnvelope, FaClock,
  FaStar, FaCheckCircle, FaHandHoldingHeart, FaRegClock, FaBolt,
  FaChartLine, FaBell, FaTimesCircle, FaTimes, FaBook, FaUserGraduate,
  FaInfoCircle, FaGlobe, FaLock, FaArrowLeft,
} from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getMyProfile, getMyStats, getMyRecentRequests } from '../../api/tutorProfile';
import { getSubjects, getLevels } from '../../api/tutorRegistration';
import { formatRelativeTime } from '../../utils/formatRelativeTime';
import { leadStatusAr } from '../../utils/translations';

const DAY_AR = {
  Saturday: 'السبت',
  Sunday: 'الأحد',
  Monday: 'الإثنين',
  Tuesday: 'الثلاثاء',
  Wednesday: 'الأربعاء',
  Thursday: 'الخميس',
  Friday: 'الجمعة',
};

function iconForActivity(type) {
  if (type === 'private_lead_received') return { icon: <FaEnvelope />, color: '#6366f1' };
  if (type === 'private_lead_accepted' || type === 'offer_accepted' || type === 'contact_shared')
    return { icon: <FaCheckCircle />, color: '#10b981' };
  if (type === 'offer_rejected' || type === 'private_lead_rejected')
    return { icon: <FaTimesCircle />, color: '#ef4444' };
  return { icon: <FaBell />, color: '#f59e0b' };
}

function statusClass(status) {
  const map = {
    open: 'open',
    closed_shortlist: 'shortlist',
    closed_empty: 'closed',
    closed_matched: 'matched',
    closed_expired: 'expired',
  };
  return map[status] || 'closed';
}

export default function MainPage({ onGoToRequests, onGoToMyOffers, onGoToContacts, onGoToProfile, onGoToLeadDetail }) {
  const [tutorName, setTutorName] = useState('');
  const [stats, setStats] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subjectsList, setSubjectsList] = useState([]);
  const [levelsList, setLevelsList] = useState([]);
  const [existingSubjects, setExistingSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedLevelId, setSelectedLevelId] = useState('');
  const [subjectYears, setSubjectYears] = useState(0);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const [profileRes, statsRes, requestsRes] = await Promise.all([
        getMyProfile(),
        getMyStats(),
        getMyRecentRequests(),
      ]);

      setTutorName(profileRes.data.first_name || '');

      const s = statsRes.data;
      setStats({
        newCount: s.new_requests,
        pendingCount: s.pending_requests,
        acceptedCount: s.accepted_requests,
        rating: s.average_rating,
      });

      setWeeklyData(
        (s.weekly_activity || []).map((p) => ({
          day: DAY_AR[p.day] || p.day,
          requests: p.count,
        }))
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
      setExistingSubjects(
        (profileRes.data.tutor_subjects || []).map((ts) => ({
          subject_id: ts.subject_id,
          level_id: ts.level_id,
        }))
      );
    } catch (err) {
      console.error('فشل تحميل لوحة التحكم:', err);
      setLoadError('تعذّر تحميل لوحة التحكم. حاول تحديث الصفحة.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const openAddSubjectModal = async () => {
    setIsModalOpen(true);
    setSelectedSubjectId('');
    setSelectedLevelId('');
    setSubjectYears(0);
    setModalLoading(true);
    try {
      const [subjectsRes, levelsRes] = await Promise.all([getSubjects(), getLevels()]);
      setSubjectsList(subjectsRes.data || []);
      setLevelsList(levelsRes.data || []);
    } catch (err) {
      console.error('فشل جلب المواد:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const isSubjectLevelTaken = (subjectId, levelId) =>
    existingSubjects.some(
      (s) => String(s.subject_id) === String(subjectId) && String(s.level_id) === String(levelId)
    );

  const handleAddSubject = () => {
    if (!selectedSubjectId || !selectedLevelId) {
      alert('الرجاء اختيار المادة والمستوى');
      return;
    }
    if (isSubjectLevelTaken(selectedSubjectId, selectedLevelId)) {
      alert('هذه المادة والمستوى مضافان مسبقاً في ملفك');
      return;
    }

    const subject = subjectsList.find((s) => String(s.subject_id) === String(selectedSubjectId));
    const level = levelsList.find((l) => String(l.level_id) === String(selectedLevelId));

    onGoToProfile?.({
      addSubject: {
        name: subject?.subject_title || '',
        levelName: level?.level_title || '',
        years: subjectYears || 0,
        subject_id: Number(selectedSubjectId),
        level_id: Number(selectedLevelId),
      },
    });

    setIsModalOpen(false);
  };

  const ratingDisplay =
    stats?.rating == null ? '—' : stats.rating;

  return (
    <div className="con fade-in">
      <div className="welcome-section">
        <FaHandHoldingHeart className="welcome-icon" />
        <div className="welcome-text">
          <h2>أهلاً بك أستاذ {isLoading ? '...' : tutorName}</h2>
          <p>نظرة سريعة على نشاطك وفرصك التعليمية</p>
        </div>
      </div>

      {loadError && <p className="dashboard-error">{loadError}</p>}

      <div className="requests-container">
        <StatisticsCard
          title="فرص جديدة"
          subtitle="طلبات عامة لم تقدّم عليها (7 أيام)"
          icon={<FaEnvelope style={{ color: '#0ea5e9' }} />}
          count={isLoading ? '...' : (stats?.newCount ?? 0)}
          bgcolor="#e0f2fe"
          hcolor="#0ea5e9"
          onClick={() => onGoToRequests?.('public')}
        />
        <StatisticsCard
          title="عروض معلّقة"
          subtitle="بانتظار قرار الطالب"
          icon={<FaClock style={{ color: '#6366f1' }} />}
          count={isLoading ? '...' : (stats?.pendingCount ?? 0)}
          bgcolor="#e0e7ff"
          hcolor="#6366f1"
          onClick={() => onGoToMyOffers?.()}
        />
        <StatisticsCard
          title="تواصل ناجح"
          subtitle="اضغط لعرض أرقام الطلاب"
          icon={<FaCheckCircle style={{ color: '#10b981' }} />}
          count={isLoading ? '...' : (stats?.acceptedCount ?? 0)}
          bgcolor="#d1fae5"
          hcolor="#10b981"
          onClick={() => onGoToContacts?.()}
        />
        <StatisticsCard
          title="التقييم"
          subtitle={stats?.rating == null && !isLoading ? 'لا توجد تقييمات بعد' : 'متوسط تقييم الطلاب'}
          icon={<FaStar style={{ color: '#f59e0b' }} />}
          count={isLoading ? '...' : ratingDisplay}
          bgcolor="#fef3c7"
          hcolor="#f59e0b"
        />
      </div>

      <div className="bottom-row">
        <div className="left-column">
          <div className="LastRequests">
            <div className="LastRequestsTitle">
              <div className="RT">
                <FaRegClock className="title-icon" />
                الطلبات الأخيرة
              </div>
              <button type="button" className="allReqBtn" onClick={() => onGoToRequests?.('all')}>
                عرض جميع الطلبات <FaArrowLeft className="btn-arrow" />
              </button>
            </div>
            <p className="section-hint">
              آخر 3 طلبات موجهة إليك أو عامة بموادك ومستوياتك
            </p>
            <div className="RecentRequestsCon">
              {isLoading ? (
                <p className="empty-hint">جارِ التحميل...</p>
              ) : recentRequests.length === 0 ? (
                <p className="empty-hint">لا توجد طلبات بعد. راجع تبويب الطلبات لاحقاً.</p>
              ) : (
                recentRequests.map((req) => {
                  const leadId = req.post_requirements_id ?? req.lead_id;
                  return (
                  <button
                    key={leadId}
                    type="button"
                    className="recent-request-item recent-request-item-clickable"
                    onClick={() => onGoToLeadDetail?.(leadId, req.is_public)}
                  >
                    <div className="rr-top">
                      <span className={`rr-type-badge ${req.is_public ? 'public' : 'private'}`}>
                        {req.is_public ? <FaGlobe /> : <FaLock />}
                        {req.is_public ? 'عام' : 'خاص'}
                      </span>
                      <span className="rr-id">#{leadId}</span>
                      <span className={`rr-status ${statusClass(req.lead_status)}`}>
                        {leadStatusAr[req.lead_status] || req.lead_status}
                      </span>
                    </div>
                    <h4 className="rr-title">{req.title}</h4>
                    <div className="rr-meta">
                      <span><FaBook /> {req.subject}{req.level ? ` — ${req.level}` : ''}</span>
                    </div>
                    {req.student_name && (
                      <div className="rr-student"><FaUserGraduate /> {req.student_name}</div>
                    )}
                    <div className="rr-footer">
                      <span className="rr-date">{formatRelativeTime(req.created_at)}</span>
                      <span className="rr-view-link">عرض التفاصيل <FaArrowLeft /></span>
                    </div>
                  </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <FaChartLine className="chart-icon" />
              <div>
                <h3>عروضك خلال الأسبوع</h3>
                <p className="chart-subtitle">عدد العروض التي قدّمتها يومياً (آخر 7 أيام)</p>
              </div>
            </div>
            <div className="chart-container">
              {weeklyData.every((d) => d.requests === 0) && !isLoading ? (
                <p className="empty-hint chart-empty">لا توجد عروض مسجّلة هذا الأسبوع.</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={weeklyData} margin={{ top: 16, right: 16, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 11 }} axisLine={{ stroke: '#cbd5e1' }} />
                    <YAxis allowDecimals={false} tick={{ fill: '#475569', fontSize: 11 }} axisLine={{ stroke: '#cbd5e1' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '12px', fontFamily: 'Cairo' }}
                      formatter={(value) => [`${value} عرض`, 'العدد']}
                    />
                    <Bar dataKey="requests" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              )}
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
              <button type="button" className="quick-action-btn" onClick={openAddSubjectModal}>
                <FaPlusCircle className="action-icon" /> إضافة مادة
              </button>
              <button type="button" className="quick-action-btn" onClick={() => onGoToRequests?.('private')}>
                <FaClipboardList className="action-icon" /> الطلبات الخاصة
              </button>
              <button type="button" className="quick-action-btn" onClick={() => onGoToMyOffers?.()}>
                <FaEnvelope className="action-icon" /> عروضي
              </button>
              <button type="button" className="quick-action-btn" onClick={() => onGoToProfile?.()}>
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
                <p className="empty-hint">جارِ التحميل...</p>
              ) : recentActivity.length === 0 ? (
                <p className="empty-hint">لا يوجد نشاط حديث بعد.</p>
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

      {isModalOpen && (
        <div className="modal-overlay-new" onClick={() => setIsModalOpen(false)}>
          <div className="modal-box-new" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-new">
              <h3>
                <FaPlusCircle className="modal-header-icon" /> إضافة مادة جديدة
              </h3>
              <button type="button" className="close-modal-btn-new" onClick={() => setIsModalOpen(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="modal-body-new">
              {modalLoading ? (
                <p className="empty-hint">جارِ تحميل المواد...</p>
              ) : (
                <>
                  <div className="form-group-new">
                    <label><FaBook className="field-icon" /> المادة</label>
                    <select
                      value={selectedSubjectId}
                      onChange={(e) => setSelectedSubjectId(e.target.value)}
                    >
                      <option value="">— اختر مادة —</option>
                      {subjectsList.map((sub) => (
                        <option key={sub.subject_id} value={sub.subject_id}>
                          {sub.subject_title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group-new">
                    <label><FaUserGraduate className="field-icon" /> المستوى</label>
                    <select
                      value={selectedLevelId}
                      onChange={(e) => setSelectedLevelId(e.target.value)}
                    >
                      <option value="">— اختر مستوى —</option>
                      {levelsList.map((level) => (
                        <option key={level.level_id} value={level.level_id}>
                          {level.level_title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group-new">
                    <label><FaUserGraduate className="field-icon" /> سنوات الخبرة</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="مثال: 3"
                      value={subjectYears}
                      onChange={(e) => setSubjectYears(Number(e.target.value))}
                    />
                  </div>

                  {selectedSubjectId && selectedLevelId && isSubjectLevelTaken(selectedSubjectId, selectedLevelId) && (
                    <p className="modal-warning">هذه المادة والمستوى موجودان مسبقاً في ملفك.</p>
                  )}

                  <div className="modal-hint-new">
                    <FaInfoCircle className="hint-icon" />
                    <span>
                      سيفتح ملفك الشخصي في وضع التعديل. راجع المادة ثم احفظ التغييرات.
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer-new">
              <button type="button" className="btn-cancel-new" onClick={() => setIsModalOpen(false)}>إلغاء</button>
              <button
                type="button"
                className="btn-add-new"
                onClick={handleAddSubject}
                disabled={modalLoading || !selectedSubjectId || !selectedLevelId}
              >
                <FaPlusCircle /> متابعة في الملف الشخصي
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
