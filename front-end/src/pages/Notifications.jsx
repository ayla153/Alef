// src/components/tutor/Notifications.jsx
import React, { useState } from 'react';
import { FaBell, FaCheckCircle, FaEnvelope, FaTrashAlt, FaUserPlus, FaClock, FaFilter, FaEyeSlash } from 'react-icons/fa';
import '../styles/Notifications.css';

const allNotifications = [
  {
    id: 1,
    type: 'private_request',
    studentName: 'أحمد السالم',
    subject: 'الرياضيات',
    title: 'طلب تدريس جديد',
    description: 'يحتاج مساعدة في التفاضل والتكامل، 3 حصص أسبوعياً',
    time: '2025-06-02T10:30:00',
    isIgnored: false,
  },
  {
    id: 2,
    type: 'offer_accepted',
    studentName: 'نورا علي',
    subject: 'الفيزياء',
    title: 'تم قبول عرضك',
    description: 'تم قبول عرضك على طلب الفيزياء. يمكنك التواصل مع الطالبة.',
    time: '2025-06-02T08:15:00',
    isIgnored: false,
  },
  {
    id: 3,
    type: 'system',
    title: 'تحديث حالة الطلب',
    description: 'تم تغيير حالة طلب "رياضيات - منهج دراسي" إلى قيد المراجعة.',
    time: '2025-06-01T14:20:00',
    isIgnored: false,
  },
  {
    id: 4,
    type: 'private_request',
    studentName: 'خالد ياسر',
    subject: 'الإنجليزية',
    title: 'طلب تدريس خاص',
    description: 'طلب تدريس في اللغة الإنجليزية لتقوية المحادثة.',
    time: '2025-06-01T09:00:00',
    isIgnored: false,
  },
  {
    id: 5,
    type: 'offer_accepted',
    studentName: 'سعاد محمود',
    subject: 'العربية',
    title: 'تم قبول عرضك',
    description: 'تم قبول عرضك لتأسيس في النحو والصرف.',
    time: '2025-05-31T16:45:00',
    isIgnored: true,
  },
  {
    id: 6,
    type: 'system',
    title: 'تذكير باستكمال الملف الشخصي',
    description: 'أضف تفاصيل الوقت والمكان للحصول على أفضل تطابق.',
    time: '2025-05-30T11:00:00',
    isIgnored: false,
  },
  {
    id: 7,
    type: 'private_request',
    studentName: 'ليلى كريم',
    subject: 'الكيمياء',
    title: 'طلب تدريس خاص',
    description: 'مساعدة في الكيمياء العضوية وحل المسائل.',
    time: '2025-05-29T13:20:00',
    isIgnored: false,
  },
  {
    id: 8,
    type: 'offer_accepted',
    studentName: 'عمر رائد',
    subject: 'التاريخ',
    title: 'تم قبول عرضك',
    description: 'تم قبول عرضك لإعداد بحث عن الحضارة الإسلامية.',
    time: '2025-05-28T10:00:00',
    isIgnored: false,
  },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(allNotifications);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isIgnored: true })));
  };

  const handleIgnore = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isIgnored: true } : n));
  };

  const handleDelete = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filtered = notifications.filter(n => {
    if (filter === 'private') return n.type === 'private_request';
    if (filter === 'accepted') return n.type === 'offer_accepted';
    if (filter === 'system') return n.type === 'system';
    return true;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="page-container2">
      <div className="notifications-container">
        <div className="notif-header">
          <div className="header-left">
            <FaBell className="header-icon" />
            <h1>مركز التنبيهات</h1>
          </div>
          <button className="mark-read-btn" onClick={handleMarkAllAsRead}>
            <FaCheckCircle /> تحديد الكل كمقروء
          </button>
        </div>

        <div className="filter-tabs">
          <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => { setFilter('all'); setCurrentPage(1); }}>الكل</button>
          <button className={`filter-tab ${filter === 'private' ? 'active' : ''}`} onClick={() => { setFilter('private'); setCurrentPage(1); }}>الطلبات الخاصة</button>
          <button className={`filter-tab ${filter === 'accepted' ? 'active' : ''}`} onClick={() => { setFilter('accepted'); setCurrentPage(1); }}>العروض المقبولة</button>
          <button className={`filter-tab ${filter === 'system' ? 'active' : ''}`} onClick={() => { setFilter('system'); setCurrentPage(1); }}>النظام</button>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">لا توجد إشعارات</div>
        ) : (
          <div className="notif-list">
            {currentItems.map(notif => (
              <div key={notif.id} className={`notif-card ${notif.isIgnored ? 'ignored' : ''}`}>
                <div className={`notif-icon ${notif.type}`}>
                  {notif.type === 'private_request' && <FaEnvelope />}
                  {notif.type === 'offer_accepted' && <FaUserPlus />}
                  {notif.type === 'system' && <FaBell />}
                </div>
                <div className="notif-content">
                  <div className="notif-title-row">
                    <h3>{notif.title}</h3>
                    {notif.studentName && <span className="student-badge">{notif.studentName}</span>}
                  </div>
                  <p className="notif-desc">{notif.description}</p>
                  <div className="notif-footer">
                    <span className="notif-time"><FaClock /> {new Date(notif.time).toLocaleString('ar')}</span>
                    <div className="notif-actions">
                      <button className="action-ignore" onClick={() => handleIgnore(notif.id)}><FaEyeSlash /> تجاهل</button>
                      <button className="action-delete" onClick={() => handleDelete(notif.id)}><FaTrashAlt /> حذف</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>السابق</button>
            {[...Array(totalPages)].map((_, i) => (
              <button key={i} className={currentPage === i + 1 ? 'active' : ''} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
            ))}
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>التالي</button>
          </div>
        )}
      </div>
    </div>
  );
}