// src/components/RequestCard.jsx
import {
  FaUser,
  FaBook,
  FaClock,
  FaVenusMars,
  FaRegFileAlt,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaChalkboard,
  FaCheckCircle,
  FaExclamationCircle,
  FaTag,
  FaGlobe,
  FaLock,
  FaStar,
  FaRegStar,
  FaBriefcase,
  FaHourglassHalf,
  FaClipboardList,
  FaUserGraduate,
} from 'react-icons/fa';
import '../styles/RequestCard.css';
import {
  tuitionTypeAr,
  genderPrefAr,
  leadStatusAr,
  translateSubject,
  translateLevel,
  formatCurrency,
  formatDate,
} from '../utils/translations';

const statusInfo = (lead) => {
  if (!lead.accepting_applications) {
    return { label: 'الأماكن ممتلئة', cls: 'slots-full', icon: FaExclamationCircle };
  }
  if (lead.lead_status === 'open') {
    return { label: leadStatusAr.open, cls: 'open', icon: FaCheckCircle };
  }
  if (lead.lead_status === 'closed_matched') {
    return { label: leadStatusAr.closed_matched, cls: 'matched', icon: FaStar };
  }
  if (lead.lead_status === 'closed_shortlist') {
    return { label: leadStatusAr.closed_shortlist, cls: 'shortlist', icon: FaRegStar };
  }
  return { label: lead.lead_status || 'مغلق', cls: 'closed', icon: FaExclamationCircle };
};

export default function RequestCard({ request, onSubmitOffer, onAcceptContact }) {
  const {
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
    subjectTitle,
    levelTitle,
    accepting_applications,
    pending_offer_count,
    max_applications,
    lead_status,
    student_phone_number,
    expired_at,
    isPrivate,
  } = request;

  // ترجمة المادة والمستوى
  const translatedSubject = subjectTitle ? translateSubject(subjectTitle) : 'غير محددة';
  const translatedLevel = levelTitle ? translateLevel(levelTitle) : '';

  const { label: statusLabel, cls: statusClass, icon: StatusIcon } = statusInfo(request);
  const isOpen = lead_status === 'open' && accepting_applications;
  const isMatched = lead_status === 'closed_matched';
  const isShortlist = lead_status === 'closed_shortlist';

  const budgetDisplay =
    min_expected_fee != null && max_expected_fee != null
      ? `${formatCurrency(min_expected_fee)} – ${formatCurrency(max_expected_fee)}`
      : 'غير محدد';

  const tuitionText = tuitionTypeAr[tution_type] || tution_type || 'غير محدد';
  const genderText = preferred_gender ? genderPrefAr[preferred_gender] || preferred_gender : null;

  return (
    <div className={`request-card-premium ${isPrivate ? 'private' : 'public'} ${statusClass}`}>
      {/* ─── شريط النوع والحالة ─── */}
      <div className="card-top-bar">
        <div className="type-badge-wrapper">
          {isPrivate ? <FaLock className="type-icon private-icon" /> : <FaGlobe className="type-icon public-icon" />}
          <span className="type-label">{isPrivate ? 'طلب خاص' : 'طلب عام'}</span>
        </div>
        <div className={`status-badge-premium ${statusClass}`}>
          <StatusIcon className="status-icon" />
          <span>{statusLabel}</span>
        </div>
      </div>

      {/* ─── العنوان ─── */}
      <div className="card-title-section">
        <FaUser className="title-user-icon" />
        <h3 className="request-title">{title}</h3>
        {foundation_tution && (
          <span className="foundation-badge">
            <FaTag className="foundation-icon" /> تأسيس
          </span>
        )}
      </div>

      {/* ─── المادة والمستوى ─── */}
      <div className="subject-level-row">
        <div className="subject-badge">
          <FaBook className="badge-icon" />
          <span className="badge-label">المادة:</span>
          <span className="badge-value">{translatedSubject}</span>
        </div>
        {translatedLevel && (
          <div className="level-badge">
            <FaUserGraduate className="badge-icon" />
            <span className="badge-label">المستوى:</span>
            <span className="badge-value">{translatedLevel}</span>
          </div>
        )}
      </div>

      {/* ─── قسم الوصف (بارز جداً) ─── */}
      {description && (
        <div className="description-premium-section">
          <div className="description-header">
            <FaClipboardList className="description-icon" />
            <span className="description-title">تفاصيل الطلب</span>
          </div>
          <p className="description-text">{description}</p>
        </div>
      )}

      {/* ─── شبكة المعلومات السريعة ─── */}
      <div className="quick-info-grid">
        <div className="info-item">
          <FaChalkboard className="info-icon" />
          <span className="info-label">طريقة التدريس:</span>
          <span className="info-text">{tuitionText}</span>
        </div>
        <div className="info-item">
          <FaClock className="info-icon" />
          <span className="info-label">عدد الحصص:</span>
          <span className="info-text">{weekly_classes} حصة/أسبوع</span>
        </div>
        <div className="info-item">
          <FaRegFileAlt className="info-icon" />
          <span className="info-label">نوع المساعدة:</span>
          <span className="info-text">{help_type || 'غير محدد'}</span>
        </div>
        {genderText && (
          <div className="info-item">
            <FaVenusMars className="info-icon" />
            <span className="info-label">الجنس المفضل:</span>
            <span className="info-text">{genderText}</span>
          </div>
        )}
      </div>

      {/* ─── تفاصيل إضافية ─── */}
      <div className="details-premium-grid">
        <div className="detail-premium-item">
          <div className="detail-label-wrapper">
            <FaMoneyBillWave className="detail-icon" />
            <span className="detail-label">الميزانية المتوقعة</span>
          </div>
          <span className="detail-value highlight">{budgetDisplay}</span>
        </div>

        <div className="detail-premium-item">
          <div className="detail-label-wrapper">
            <FaBriefcase className="detail-icon" />
            <span className="detail-label">العروض المقدمة</span>
          </div>
          <span className="detail-value">
            {pending_offer_count ?? 0} / {max_applications ?? '∞'}
            {isOpen && pending_offer_count < max_applications && (
              <span className="slots-available"> (متاح)</span>
            )}
            {!isOpen && !accepting_applications && (
              <span className="slots-full-label"> (ممتلئ)</span>
            )}
          </span>
        </div>

        <div className="detail-premium-item">
          <div className="detail-label-wrapper">
            <FaCalendarAlt className="detail-icon" />
            <span className="detail-label">تاريخ النشر</span>
          </div>
          <span className="detail-value">{formatDate(created_at)}</span>
        </div>

        {expired_at && (
          <div className="detail-premium-item">
            <div className="detail-label-wrapper">
              <FaHourglassHalf className="detail-icon" />
              <span className="detail-label">ينتهي في</span>
            </div>
            <span className="detail-value">{formatDate(expired_at)}</span>
          </div>
        )}
      </div>

      {/* ─── رقم الطالب ─── */}
      {student_phone_number && (
        <div className="phone-reveal-premium">
          <FaUserGraduate className="phone-icon" />
          <span className="phone-label">رقم الطالب:</span>
          <span className="phone-number">{student_phone_number}</span>
        </div>
      )}

      {/* ─── أزرار الإجراء ─── */}
      <div className="card-actions-premium">
        {!isPrivate && accepting_applications && onSubmitOffer && (
          <button className="action-btn-premium offer-btn" onClick={() => onSubmitOffer(post_requirements_id)}>
            <FaMoneyBillWave className="btn-icon" /> تقديم عرض
          </button>
        )}

        {isPrivate && lead_status === 'open' && onAcceptContact && (
          <button className="action-btn-premium accept-btn" onClick={() => onAcceptContact(post_requirements_id)}>
            <FaCheckCircle className="btn-icon" /> أوافق على التواصل
          </button>
        )}

        {isMatched && (
          <div className="matched-badge-premium">
            <FaStar className="matched-icon" /> تم التطابق
          </div>
        )}

        {isShortlist && (
          <div className="shortlist-badge-premium">
            <FaRegStar className="shortlist-icon" /> في القائمة المختصرة
          </div>
        )}
      </div>
    </div>
  );
}