// src/components/tabs/RequestCard.jsx
import React from 'react';
import { FaBook, FaGraduationCap, FaLaptop, FaChalkboardTeacher, FaMoneyBillWave, FaGlobe, FaEnvelope, FaPaperPlane, FaUser } from 'react-icons/fa';
import '../styles/RequestCard.css';

export default function RequestCard({ request }) {
  const {
    studentName,
    subject,
    level,
    teachingMethod,
    helpType,
    genderPreference,
    sessionsPerWeek,
    suitableTime,
    budget,
    description,
    status,
    requestType,
    targetTutor,
    deadline,
  } = request;

  const getStatusBadge = () => {
    if (status === 'open') return <span className="status-badge open">مفتوح</span>;
    if (status === 'slots_full') return <span className="status-badge slots-full">العروض ممتلئة</span>;
    return null;
  };

  const handleSendRequest = () => {
    alert(`سيتم إرسال طلب تدريس للمادة: ${subject} من الطالب: ${studentName}`);
  };

  return (
    <div className="request-card">
      <div className="card-header">
        <div className="student-info">
          <FaUser className="student-icon" />
          <h3>{studentName}</h3>
        </div>
        {getStatusBadge()}
      </div>

      <div className="subject-row">
        <FaBook className="subject-icon" />
        <span className="subject-name">{subject}</span>
      </div>

      {/* ✅ قسم وصف الطلب (منقول إلى الأعلى ومُبرَز) */}
      <div className="description-highlight">
        <p>{description}</p>
      </div>

      <div className="quick-info">
        <div className="info-chip">
          <FaGraduationCap />
          <span>{level}</span>
        </div>
        <div className="info-chip">
          {teachingMethod === 'online' ? <FaLaptop /> : <FaChalkboardTeacher />}
          <span>{teachingMethod === 'online' ? 'أونلاين' : 'حضوري'}</span>
        </div>
        {requestType === 'private' && targetTutor ? (
          <div className="info-chip private">
            <FaEnvelope />
            <span>مرسل إلى: {targetTutor}</span>
          </div>
        ) : (
          <div className="info-chip public">
            <FaGlobe />
            <span>طلب عام</span>
          </div>
        )}
      </div>

      <div className="details-grid">
        <div className="detail-item">
          <span className="detail-label">نوع المساعدة</span>
          <span className="detail-value">{helpType}</span>
        </div>
        {genderPreference && (
          <div className="detail-item">
            <span className="detail-label">الجنس المفضل</span>
            <span className="detail-value">{genderPreference === 'male' ? 'ذكر' : 'أنثى'}</span>
          </div>
        )}
        <div className="detail-item">
          <span className="detail-label">الحصص أسبوعياً</span>
          <span className="detail-value">{sessionsPerWeek}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">الوقت المناسب</span>
          <span className="detail-value">{suitableTime}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">الميزانية</span>
          <span className="detail-value budget">{budget.toLocaleString()} ل.س</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">الموعد النهائي</span>
          <span className="detail-value">{deadline}</span>
        </div>
      </div>

      <button className="send-request-btn" onClick={handleSendRequest}>
        <FaPaperPlane /> إرسال طلب تدريس
      </button>
    </div>
  );
}