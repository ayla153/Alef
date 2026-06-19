import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Admin/AdminRequestsTab.css';
import { FaEnvelope, FaCheckCircle, FaTimesCircle, FaChartLine } from 'react-icons/fa';

// بيانات وهمية للطلبات (محاكاة لقاعدة البيانات)
const mockRequests = [
  {
    id: 1,
    firstname: 'أحمد',
    lastname: 'محمد',
    email: 'ahmed@example.com',
    phone: '+963988888888',
    status: 'pending',
    submittedAt: '2025-05-20',
    yearsExperience: 5,
    teachingMethods: { online: true, offline: false },
    subjects: [{ name: 'رياضيات', years: 5 }, { name: 'فيزياء', years: 3 }],
    stagesPrices: [
      { stage: 'المرحلة الابتدائية', price: 300000 },
      { stage: 'المرحلة المتوسطة', price: 400000 },
      { stage: 'المرحلة الثانوية', price: 500000 }
    ],
    bio: 'أنا مدرس رياضيات خبرة 5 سنوات...',
    certificates: ['شهادة.pdf', 'دورة.jpg']
  },
  {
    id: 2,
    firstname: 'سارة',
    lastname: 'خالد',
    email: 'sara@example.com',
    phone: '+963911111111',
    status: 'accepted',
    submittedAt: '2025-05-18',
    yearsExperience: 8,
    teachingMethods: { online: true, offline: true },
    subjects: [{ name: 'لغة عربية', years: 8 }],
    stagesPrices: [
      { stage: 'المرحلة الابتدائية', price: 250000 },
      { stage: 'المرحلة المتوسطة', price: 350000 },
      { stage: 'المرحلة الثانوية', price: 450000 }
    ],
    bio: 'مدرسة لغة عربية متميزة...',
    certificates: ['شهادة ماجستير.pdf']
  },
  {
    id: 3,
    firstname: 'عمر',
    lastname: 'علي',
    email: 'omar@example.com',
    phone: '+963922222222',
    status: 'rejected',
    submittedAt: '2025-05-15',
    yearsExperience: 2,
    teachingMethods: { online: false, offline: true },
    subjects: [{ name: 'كيمياء', years: 2 }],
    stagesPrices: [
      { stage: 'المرحلة الابتدائية', price: 200000 },
      { stage: 'المرحلة المتوسطة', price: 250000 },
      { stage: 'المرحلة الثانوية', price: 300000 }
    ],
    bio: 'مدرس كيمياء مبتدئ...',
    certificates: []
  }
];

export default function AdminRequestsTab() {
  const navigate = useNavigate();
  const [requests] = useState(mockRequests); // ✅ تهيئة مباشرة بدون useEffect
  const [filter, setFilter] = useState('all');

  const stats = {
    pending: requests.filter(r => r.status === 'pending').length,
    accepted: requests.filter(r => r.status === 'accepted').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    dailyAverage: (requests.length / 7).toFixed(1)
  };

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(r => r.status === filter);

  const handleViewDetails = (requestId) => {
    navigate(`/admin/request/${requestId}`);
  };

  return (
    <div className="admin-requests-tab">
      <div className="stats-cards">
        <div className="stat-card pending">
          <FaEnvelope className="stat-icon" />
          <div className="stat-info">
            <span className="stat-value">{stats.pending}</span>
            <span className="stat-label">طلبات جديدة</span>
          </div>
        </div>
        <div className="stat-card accepted">
          <FaCheckCircle className="stat-icon" />
          <div className="stat-info">
            <span className="stat-value">{stats.accepted}</span>
            <span className="stat-label">مقبولة</span>
          </div>
        </div>
        <div className="stat-card rejected">
          <FaTimesCircle className="stat-icon" />
          <div className="stat-info">
            <span className="stat-value">{stats.rejected}</span>
            <span className="stat-label">مرفوضة</span>
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

      <div className="filter-buttons">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>الكل</button>
        <button className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>معلقة</button>
        <button className={filter === 'accepted' ? 'active' : ''} onClick={() => setFilter('accepted')}>مقبولة</button>
        <button className={filter === 'rejected' ? 'active' : ''} onClick={() => setFilter('rejected')}>مرفوضة</button>
      </div>

      <div className="requests-table">
        <div className="table-header">
          <span>المعلم</span>
          <span>البريد الإلكتروني</span>
          <span>تاريخ التقديم</span>
          <span>الحالة</span>
          <span></span>
        </div>
        {filteredRequests.map(req => (
          <div key={req.id} className="table-row">
            <span>{req.firstname} {req.lastname}</span>
            <span>{req.email}</span>
            <span>{req.submittedAt}</span>
            <span className={`status-badge ${req.status}`}>
              {req.status === 'pending' ? 'معلق' : req.status === 'accepted' ? 'مقبول' : 'مرفوض'}
            </span>
            <button className="review-btn" onClick={() => handleViewDetails(req.id)}>مراجعة</button>
          </div>
        ))}
      </div>
    </div>
  );
}