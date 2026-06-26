import React from 'react';
import { FaUserGraduate, FaBook, FaClock, FaMapMarkerAlt, FaMale, FaRegFileAlt, FaCalendarAlt } from 'react-icons/fa';
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
    deadline
  } = request;

  const genderLabel = genderPreference === 'male' ? 'Male'
    : genderPreference === 'female' ? 'Female'
    : 'Not specified';

  const statusLabel = status === 'open' ? 'Open' : 'Full';
  const statusClass = status === 'open' ? 'open' : 'slots-full';
  const requestTypeLabel = requestType === 'public' ? 'Public' : 'Private';

  return (
    <div className="request-card">
      <div className="card-header">
        <div className="student-info">
          <FaUserGraduate className="student-icon" />
          <h3>{studentName}</h3>
        </div>
        <span className={`status-badge ${statusClass}`}>{statusLabel}</span>
      </div>

      <div className="subject-row">
        <FaBook className="subject-icon" />
        <span className="subject-name">{subject} - {level}</span>
      </div>

      <div className="quick-info">
        <span className={`info-chip ${requestType}`}><FaRegFileAlt /> {requestTypeLabel}</span>
        <span className="info-chip"><FaClock /> {teachingMethod === 'online' ? 'Online' : teachingMethod === 'offline' ? 'Offline' : 'Not specified'}</span>
        <span className="info-chip"><FaMapMarkerAlt /> {suitableTime || 'Not specified'}</span>
        <span className="info-chip"><FaMale /> {genderLabel}</span>
      </div>

      <div className="details-grid">
        <div className="detail-item">
          <span className="detail-label">Help type</span>
          <span className="detail-value">{helpType || 'Not specified'}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Sessions</span>
          <span className="detail-value">{sessionsPerWeek != null ? `${sessionsPerWeek} / week` : 'Not specified'}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Preferred time</span>
          <span className="detail-value">{suitableTime || 'Not specified'}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Budget</span>
          <span className="detail-value budget">{budget != null ? `${budget.toLocaleString('en-US')} SYP` : 'Not specified'}</span>
        </div>
      </div>

      <div className="description-box">
        <p>{description || 'No additional notes.'}</p>
      </div>

      <div className="quick-info">
        <span className="info-chip">Target tutor: {targetTutor || 'Not specified'}</span>
        <span className="info-chip"><FaCalendarAlt /> {deadline || 'Not specified'}</span>
      </div>
    </div>
  );
}
