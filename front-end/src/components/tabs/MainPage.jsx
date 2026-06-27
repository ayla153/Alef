import { useState, useEffect } from 'react';
import '../../styles/MainPage.css';
import RequestsCard from '../common/StatisticsCard';
import RecentRequests from '../common/RecentRequests'
import { FaPlusCircle, FaClipboardList, FaUserEdit, FaEnvelope, FaClock, FaStar, FaCheckCircle, FaHandHoldingHeart, FaRegClock, FaBolt, FaChartLine, FaBook, FaFlask, FaAtom, FaGlobe, FaLandmark, FaLeaf, FaLaptop, FaLanguage, FaBookOpen, FaFlagCheckered, FaTimesCircle, FaBell } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getMyProfile } from '../../api/tutorProfile';
import { getTutorInbox, getTutorOffers } from '../../api/tutorLeads';
import { getMyReviews } from '../../api/reviews';
import { formatRelativeTime } from '../../utils/formatRelativeTime';

// يبني عدد "الطلبات" (خاصة + عامة) لكل يوم من آخر 7 أيام، من تواريخ إنشاء حقيقية
function buildWeeklyData(timestamps) {
  const order = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
  const jsDayToLabel = { 6: 'السبت', 0: 'الأحد', 1: 'الاثنين', 2: 'الثلاثاء', 3: 'الأربعاء', 4: 'الخميس', 5: 'الجمعة' };
  const counts = {};
  order.forEach((d) => { counts[d] = 0; });

  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  timestamps.forEach((ts) => {
    if (!ts) return;
    const date = new Date(ts);
    if (date < sevenDaysAgo || date > now) return;
    const label = jsDayToLabel[date.getDay()];
    if (label) counts[label] += 1;
  });

  return order.map((day) => ({ day, requests: counts[day] }));
}

// يبني قائمة "نشاط حديث" حقيقية من أحداث صندوق الوارد الخاص + متابعة العروض العامة
function buildRecentActivities(inbox, offers) {
  const events = [];

  inbox.forEach((lead) => {
    if (lead.lead_status === 'closed_matched') {
      events.push({
        text: 'تم تأكيد التواصل على طلب خاص',
        icon: <FaCheckCircle />,
        color: '#10b981',
        timestamp: lead.closed_at || lead.created_at
      });
    } else if (lead.lead_status === 'open') {
      events.push({
        text: 'وصلك طلب تدريس خاص جديد',
        icon: <FaEnvelope />,
        color: '#6366f1',
        timestamp: lead.created_at
      });
    }
  });

  offers.forEach((offer) => {
    if (offer.outcome === 'contact_shared') {
      events.push({
        text: `تم قبول عرضك على طلب "${offer.lead_title}"`,
        icon: <FaCheckCircle />,
        color: '#10b981',
        timestamp: offer.contact_revealed_at || offer.offer_created_at
      });
    } else if (offer.outcome === 'rejected') {
      events.push({
        text: `تم رفض عرضك على طلب "${offer.lead_title}"`,
        icon: <FaTimesCircle />,
        color: '#ef4444',
        timestamp: offer.offer_created_at
      });
    }
  });

  events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return events.slice(0, 5).map((e, idx) => ({
    id: idx,
    text: e.text,
    icon: e.icon,
    color: e.color,
    time: formatRelativeTime(e.timestamp)
  }));
}

export default function MainPage() {
  const [tutorName, setTutorName] = useState('');
  const [stats, setStats] = useState({ newCount: 0, pendingCount: 0, acceptedCount: 0, rating: 0 });
  const [weeklyData, setWeeklyData] = useState([
    { day: 'السبت', requests: 0 }, { day: 'الأحد', requests: 0 }, { day: 'الاثنين', requests: 0 },
    { day: 'الثلاثاء', requests: 0 }, { day: 'الأربعاء', requests: 0 }, { day: 'الخميس', requests: 0 }, { day: 'الجمعة', requests: 0 }
  ]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [profileRes, inboxRes, offersRes, reviewsRes] = await Promise.all([
        getMyProfile(),
        getTutorInbox(),
        getTutorOffers(),
        getMyReviews()
      ]);

      setTutorName(profileRes.data.first_name || '');

      const inbox = inboxRes.data || [];
      const offers = offersRes.data || [];
      const reviews = reviewsRes.data || [];

      // ✅ تفسير الإحصائيات بناءً على البيانات الحقيقية المتاحة:
      // - "الطلبات الجديدة": عروض عامة قدّمها المعلّم وما زالت بانتظار رد الطالب (outcome: pending)
      // - "الطلبات المعلقة": طلبات خاصة بصندوق الوارد بانتظار موافقة المعلّم (lead_status: open)
      // - "الطلبات المقبولة": طلبات خاصة تم قبولها + عروض عامة تم قبولها (contact_shared)
      const newCount = offers.filter((o) => o.outcome === 'pending').length;
      const pendingCount = inbox.filter((l) => l.lead_status === 'open').length;
      const acceptedCount =
        inbox.filter((l) => l.lead_status === 'closed_matched').length +
        offers.filter((o) => o.outcome === 'contact_shared').length;
      const rating = reviews.length > 0
        ? Number((reviews.reduce((sum, r) => sum + r.number_of_stars, 0) / reviews.length).toFixed(1))
        : 0;

      setStats({ newCount, pendingCount, acceptedCount, rating });

      // ✅ مشتق فعلياً من تواريخ إنشاء حقيقية (created_at / offer_created_at)
      const allTimestamps = [
        ...inbox.map((l) => l.created_at),
        ...offers.map((o) => o.offer_created_at)
      ];
      setWeeklyData(buildWeeklyData(allTimestamps));

      // ✅ مشتق فعلياً من أحداث حقيقية (وليس Mock)
      setRecentActivities(buildRecentActivities(inbox, offers));
    } catch (err) {
      console.error('فشل تحميل بيانات لوحة التحكم:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const id = setTimeout(() => {
      fetchDashboardData();
    }, 0);
    return () => clearTimeout(id);
  }, []);

  // ⚠️ "أفضل المواد طلباً" تبقى بيانات تجريبية: لا يمكن اشتقاقها بشكل صحيح من حساب معلّم واحد
  // لأن /leads/browse مفلترة سلفاً من السيرفر لتُظهر فقط مواد هذا المعلّم تحديداً، وليست إحصائية
  // شاملة لكل السوق. تحتاج Endpoint تحليلات (Analytics) مخصص من الباك إند لحساب هذا بشكل صحيح.
   const topSubjects = [
    { name: 'الرياضيات', percentage: 45, icon: <FaBook />, color: '#3b82f6' },
    { name: 'الكيمياء', percentage: 25, icon: <FaFlask />, color: '#10b981' },
    { name: 'الفيزياء', percentage: 20, icon: <FaAtom />, color: '#f59e0b' },
    { name: 'اللغة العربية', percentage: 18, icon: <FaBookOpen />, color: '#8b5cf6' },
    { name: 'اللغة الانكليزية', percentage: 15, icon: <FaLanguage />, color: '#ec4898' },
    { name: 'اللغة الفرنسية', percentage: 12, icon: <FaLanguage />, color: '#06b6d4' },
    { name: 'العلوم', percentage: 22, icon: <FaFlask />, color: '#84cc16' },
    { name: 'التاريخ', percentage: 10, icon: <FaLandmark />, color: '#ef4444' },
    { name: 'الجغرافية', percentage: 9, icon: <FaGlobe />, color: '#14b8a6' },
    { name: 'التربية الاسلامية', percentage: 14, icon: <FaLeaf />, color: '#a855f7' },
    { name: 'الوطنية', percentage: 7, icon: <FaFlagCheckered />, color: '#f97316' },
    { name: 'معلوماتية', percentage: 16, icon: <FaLaptop />, color: '#6b7280' }
  ];

  return (
    <div className='con fade-in'>
      <div className="welcome-section">
        <FaHandHoldingHeart className="welcome-icon" />
        <div className="welcome-text">
          <h2>أهلا بك أستاذ {isLoading ? '...' : tutorName}</h2>
          <p>ألق نظرة على نشاطك التعليمي !</p>
        </div>
      </div>

      <div className="requests-container">
        <RequestsCard title="الطلبات الجديدة" icon={<FaEnvelope style={{ color: '#10b981' }} />} count={isLoading ? '...' : stats.newCount} bgcolor='#d1fae5' hcolor='#10b981' />
        <RequestsCard title="الطلبات المعلقة" icon={<FaClock style={{ color: '#6366f1' }} />} count={isLoading ? '...' : stats.pendingCount} bgcolor='#e0e7ff' hcolor='#6366f1' />
        <RequestsCard title="الطلبات المقبولة" icon={<FaCheckCircle style={{ color: '#10b981' }} />} count={isLoading ? '...' : stats.acceptedCount} bgcolor='#d1fae5' hcolor='#10b981' />
        <RequestsCard title="التقييم" icon={<FaStar style={{ color: '#f59e0b' }} />} count={isLoading ? '...' : stats.rating} bgcolor='#fef3c7' hcolor='#f59e0b' />
      </div>

      <div className="bottom-row">
        <div className="left-column">
          <div className='LastRequests'>
            <div className='LastRequestsTitle'>
              <div className='RT'>
                <FaRegClock className="title-icon" />
                الطلبات الأخيرة
              </div>
              <button className='allReqBtn'>عرض جميع الطلبات</button>
            </div>
            <div className='RecentRequestsCon'>
              <RecentRequests/>
              <RecentRequests/>
              <RecentRequests/>
            </div>
          </div>

          <div className="top-subjects-card">
            <div className="top-subjects-header">
              <FaBook className="top-icon" />
              <h3>أفضل المواد طلبًا</h3>
            </div>
            <div className="top-subjects-list">
              {topSubjects.map((subject, index) => (
                <div key={index} className="subject-item">
                  <div className="subject-info">
                    <span className="subject-icon" style={{ color: subject.color }}>{subject.icon}</span>
                    <span className="subject-name">{subject.name}</span>
                  </div>
                  <div className="subject-percentage">
                    <div className="percentage-bar" style={{ width: `${subject.percentage}%`, backgroundColor: subject.color }}></div>
                    <span className="percentage-text">{subject.percentage}%</span>
                  </div>
                </div>
              ))}
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
              <button className="quick-action-btn"><FaPlusCircle className="action-icon" /> إضافة مادة</button>
              <button className="quick-action-btn"><FaClipboardList className="action-icon" /> مراجعة الطلبات</button>
              <button className="quick-action-btn"><FaUserEdit className="action-icon" /> تعديل الملف الشخصي</button>
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
                  <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 12 }} axisLine={{ stroke: '#cbd5e1' }} />
                  <YAxis tick={{ fill: '#475569', fontSize: 12 }} axisLine={{ stroke: '#cbd5e1' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#1e293b', fontFamily: 'Cairo' }} labelStyle={{ fontWeight: 'bold' }} />
                  <Bar dataKey="requests" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="recent-activity-card">
            <div className="recent-activity-header">
              <FaBell className="activity-icon" />
              <h3>نشاط حديث</h3>
            </div>
            <div className="activity-list">
              {recentActivities.length === 0 && !isLoading && (
                <p>لا يوجد نشاط حديث بعد.</p>
              )}
              {recentActivities.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <span className="activity-icon-wrapper" style={{ color: activity.color }}>{activity.icon}</span>
                  <div className="activity-content">
                    <span className="activity-text">{activity.text}</span>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}