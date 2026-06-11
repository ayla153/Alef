<<<<<<< HEAD
import '../../styles/MainPage.css';
import RequestsCard from '../common/StatisticsCard';
=======
import '../../styles/tstyle/MainPage.css';
import RequestsCard from '../common/RequestsCard';
>>>>>>> 8041f6f5 (new name)
import RecentRequests from '../common/RecentRequests'
import { FaPlusCircle, FaClipboardList, FaUserEdit, FaEnvelope, FaClock, FaStar, FaCheckCircle, FaHandHoldingHeart, FaRegClock, FaBolt, FaChartLine, FaBook, FaFlask, FaAtom, FaGlobe, FaLandmark, FaLeaf, FaLaptop, FaChalkboardTeacher, FaLanguage, FaBookOpen, FaFlagCheckered, FaTimesCircle, FaBell } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function MainPage() {
    const weeklyData = [
    { day: 'السبت', requests: 12 },
    { day: 'الأحد', requests: 19 },
    { day: 'الاثنين', requests: 15 },
    { day: 'الثلاثاء', requests: 10 },
    { day: 'الأربعاء', requests: 14 },
    { day: 'الخميس', requests: 18 },
    { day: 'الجمعة', requests: 8 },
  ];
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

   const recentActivities = [
    { id: 1, text: 'تم قبول طلب من أحمد', icon: <FaCheckCircle />, color: '#10b981', time: 'منذ 5 دقائق' },
    { id: 2, text: 'تم إلغاء جلسة مع سارة', icon: <FaTimesCircle />, color: '#ef4444', time: 'منذ ساعة' },
    { id: 3, text: 'تم استلام تقييم جديد', icon: <FaStar />, color: '#f59e0b', time: 'منذ 3 ساعات' }
  ];

  return (
    <div className='con fade-in'>
      <div className="welcome-section">
        <FaHandHoldingHeart className="welcome-icon" />
        <div className="welcome-text">
          <h2>أهلا بك أستاذ أحمد</h2>
          <p>ألق نظرة على نشاطك التعليمي !</p>
        </div>
      </div>

      <div className="requests-container">
        <RequestsCard title="الطلبات الجديدة" icon={<FaEnvelope style={{ color: '#10b981' }} />} count='3' bgcolor='#d1fae5' hcolor='#10b981' />
        <RequestsCard title="الطلبات المعلقة" icon={<FaClock style={{ color: '#6366f1' }} />} count='5' bgcolor='#e0e7ff' hcolor='#6366f1' />
        <RequestsCard title="الطلبات المقبولة" icon={<FaCheckCircle style={{ color: '#10b981' }} />} count='2' bgcolor='#d1fae5' hcolor='#10b981' />
        <RequestsCard title="التقييم" icon={<FaStar style={{ color: '#f59e0b' }} />} count='4.1' bgcolor='#fef3c7' hcolor='#f59e0b' />
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