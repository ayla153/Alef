// src/components/RequestCard.jsx
//
// يقبل هذا المكوّن نوعين من البيانات:
//   • LeadBrowseCardOut  — بطاقة عامة من /leads/browse  (بدون اسم طالب أو هاتف)
//   • LeadOut            — طلب خاص من /leads/tutor/inbox (مع target_tutor_id)
//
// يُحوَّل كلا الشكلين قبل التمرير بواسطة mapLeadToCard() في Requests.jsx

import {
  FaUserGraduate,
  FaBook,
  FaClock,
  FaVenusMars,
  FaRegFileAlt,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaChalkboard,
  FaEnvelope,
} from 'react-icons/fa';
import '../styles/RequestCard.css';

// ترجمة TuitionTypeEnum → نص عربي
const tuitionLabel = (type) => {
  if (type === 'online') return 'أونلاين';
  if (type === 'offline') return 'حضوري';
  if (type === 'both') return 'أونلاين وحضوري';
  return 'غير محدد';
};

// ترجمة gender_enum → نص عربي
const genderLabel = (g) => {
  if (g === 'male') return 'ذكر';
  if (g === 'female') return 'أنثى';
  return 'غير محدد';
};

// حالة الطلب → نص + class
const statusInfo = (lead) => {
  if (!lead.accepting_applications) return { label: 'الأماكن ممتلئة', cls: 'slots-full' };
  if (lead.lead_status === 'open') return { label: 'مفتوح', cls: 'open' };
  return { label: lead.lead_status, cls: 'closed' };
};

export default function RequestCard({ request, onSubmitOffer, onAcceptContact }) {
  const {
    // حقول مشتركة بين LeadBrowseCardOut و LeadOut
    post_requirements_id,
    title,
    description,
    foundation_tution,
    tution_type,
    help_type,
    min_expected_fee,
    max_expected_fee,
    weekly_classes,
    created_at,
    preferred_gender,
    subject_id,
    level_id,
    accepting_applications,
    pending_offer_count,
    max_applications,
    // حقول موجودة فقط في LeadOut (صندوق الوارد)
    lead_status,
    student_phone_number,
    expired_at,
    // حقول مُعدَّة مسبقاً من mapLeadToCard
    subjectTitle,
    levelTitle,
    isPrivate,
  } = request;

  const { label: statusLabel, cls: statusClass } = statusInfo(request);

  return (
    <div className={`request-card ${isPrivate ? 'private-card' : ''}`}>
      {/* ─── رأس البطاقة ─── */}
      <div className="card-header">
        <div className="student-info">
          {isPrivate ? <FaEnvelope className="student-icon private-icon" /> : <FaUserGraduate className="student-icon" />}
          <h3>{title}</h3>
        </div>
        <div className="header-badges">
          <span className={`type-badge ${isPrivate ? 'private' : 'public'}`}>
            {isPrivate ? 'طلب خاص' : 'طلب عام'}
          </span>
          <span className={`status-badge ${statusClass}`}>{statusLabel}</span>
        </div>
      </div>

      {/* ─── المادة والمرحلة ─── */}
      <div className="subject-row">
        <FaBook className="subject-icon" />
        <span className="subject-name">
          {subjectTitle || `مادة #${subject_id}`}
          {levelTitle ? ` — ${levelTitle}` : level_id ? ` — مستوى #${level_id}` : ''}
          {foundation_tution && <span className="foundation-tag"> (تأسيس)</span>}
        </span>
      </div>

      {/* ─── رقائق سريعة ─── */}
      <div className="quick-info">
        <span className="info-chip">
          <FaChalkboard /> {tuitionLabel(tution_type)}
        </span>
        <span className="info-chip">
          <FaClock /> {weekly_classes} حصة / أسبوع
        </span>
        {preferred_gender && (
          <span className="info-chip">
            <FaVenusMars /> {genderLabel(preferred_gender)}
          </span>
        )}
        <span className="info-chip">
          <FaRegFileAlt /> {help_type}
        </span>
      </div>

      {/* ─── شبكة التفاصيل ─── */}
      <div className="details-grid">
        <div className="detail-item">
          <span className="detail-label">الميزانية</span>
          <span className="detail-value budget">
            <FaMoneyBillWave />
            {min_expected_fee != null && max_expected_fee != null
              ? `${min_expected_fee.toLocaleString('ar-SA')} – ${max_expected_fee.toLocaleString('ar-SA')} ل.س`
              : 'غير محدد'}
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-label">العروض</span>
          <span className="detail-value">
            {pending_offer_count ?? 0} / {max_applications ?? '—'}
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-label">تاريخ النشر</span>
          <span className="detail-value">
            <FaCalendarAlt /> {created_at ? new Date(created_at).toLocaleDateString('ar') : '—'}
          </span>
        </div>
        {expired_at && (
          <div className="detail-item">
            <span className="detail-label">ينتهي في</span>
            <span className="detail-value">
              {new Date(expired_at).toLocaleDateString('ar')}
            </span>
          </div>
        )}
      </div>

      {/* ─── الوصف ─── */}
      {description && (
        <div className="description-box">
          <p>{description}</p>
        </div>
      )}

      {/* ─── رقم الطالب (يظهر فقط بعد الكشف) ─── */}
      {student_phone_number && (
        <div className="phone-reveal">
          <FaUserGraduate /> رقم الطالب: <strong>{student_phone_number}</strong>
        </div>
      )}

      {/* ─── أزرار الإجراء ─── */}
      <div className="card-actions">
        {/* طلب عام: زر تقديم عرض */}
        {!isPrivate && accepting_applications && onSubmitOffer && (
          <button
            className="action-btn offer-btn"
            onClick={() => onSubmitOffer(post_requirements_id)}
          >
            تقديم عرض
          </button>
        )}

        {/* طلب خاص: زر قبول التواصل */}
        {isPrivate && lead_status === 'open' && onAcceptContact && (
          <button
            className="action-btn accept-btn"
            onClick={() => onAcceptContact(post_requirements_id)}
          >
            أوافق على التواصل
          </button>
        )}
      </div>
    </div>
  );
}