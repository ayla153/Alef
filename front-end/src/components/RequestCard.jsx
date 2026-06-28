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

  // 🔥 ترجمة المادة والمستوى مع التحقق من القيم الفارغة
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
    <div className={`request-card-v2 ${isPrivate ? 'private' : 'public'} ${statusClass}`}>
      {/* ─── رأس البطاقة: النوع والحالة ─── */}
      <div className="card-header-v2">
        <div className="type-badge-v2">
          {isPrivate ? <FaLock className="type-icon-v2 private" /> : <FaGlobe className="type-icon-v2 public" />}
          <span>{isPrivate ? 'طلب خاص' : 'طلب عام'}</span>
        </div>
        <div className={`status-badge-v2 ${statusClass}`}>
          <StatusIcon className="status-icon-v2" />
          <span>{statusLabel}</span>
        </div>
      </div>

      {/* ─── العنوان ─── */}
      <div className="card-title-v2">
        <FaUser className="title-icon-v2" />
        <h3>{title}</h3>
        {foundation_tution && <span className="foundation-tag-v2">تأسيس</span>}
      </div>

      {/* ─── المادة والمستوى ─── */}
      <div className="subject-level-v2">
        <span className="subject-tag-v2">
          <FaBook className="tag-icon-v2" /> {translatedSubject}
        </span>
        {translatedLevel && (
          <span className="level-tag-v2">
            <FaUserGraduate className="tag-icon-v2" /> {translatedLevel}
          </span>
        )}
      </div>

      {/* ─── الوصف (بارز جداً في الأعلى) ─── */}
      {description && (
        <div className="description-v2">
          <div className="description-header-v2">
            <FaClipboardList className="desc-icon-v2" />
            <span>تفاصيل الطلب</span>
          </div>
          <p className="description-text-v2">{description}</p>
        </div>
      )}

      {/* ─── شبكة المعلومات الأساسية ─── */}
      <div className="info-grid-v2">
        <div className="info-item-v2">
          <FaChalkboard className="info-icon-v2" />
          <span className="info-label-v2">طريقة التدريس:</span>
          <span className="info-value-v2">{tuitionText}</span>
        </div>
        <div className="info-item-v2">
          <FaClock className="info-icon-v2" />
          <span className="info-label-v2">عدد الحصص:</span>
          <span className="info-value-v2">{weekly_classes} حصة/أسبوع</span>
        </div>
        <div className="info-item-v2">
          <FaRegFileAlt className="info-icon-v2" />
          <span className="info-label-v2">نوع المساعدة:</span>
          <span className="info-value-v2">{help_type || 'غير محدد'}</span>
        </div>
        {genderText && (
          <div className="info-item-v2">
            <FaVenusMars className="info-icon-v2" />
            <span className="info-label-v2">الجنس المفضل:</span>
            <span className="info-value-v2">{genderText}</span>
          </div>
        )}
      </div>

      {/* ─── التفاصيل الإضافية (ميزانية، عروض، تواريخ) ─── */}
      <div className="details-v2">
        <div className="detail-v2">
          <span className="detail-label-v2">
            <FaMoneyBillWave className="detail-icon-v2" /> الميزانية المتوقعة
          </span>
          <span className="detail-value-v2 highlight">{budgetDisplay}</span>
        </div>
        <div className="detail-v2">
          <span className="detail-label-v2">
            <FaBriefcase className="detail-icon-v2" /> العروض المقدمة
          </span>
          <span className="detail-value-v2">
            {pending_offer_count ?? 0} / {max_applications ?? '∞'}
            {isOpen && pending_offer_count < max_applications && (
              <span className="slots-available-v2"> (متاح)</span>
            )}
            {!isOpen && !accepting_applications && (
              <span className="slots-full-v2"> (ممتلئ)</span>
            )}
          </span>
        </div>
        <div className="detail-v2">
          <span className="detail-label-v2">
            <FaCalendarAlt className="detail-icon-v2" /> تاريخ النشر
          </span>
          <span className="detail-value-v2">{formatDate(created_at)}</span>
        </div>
        {expired_at && (
          <div className="detail-v2">
            <span className="detail-label-v2">
              <FaHourglassHalf className="detail-icon-v2" /> ينتهي في
            </span>
            <span className="detail-value-v2">{formatDate(expired_at)}</span>
          </div>
        )}
      </div>

      {/* ─── رقم الطالب (عند الكشف) ─── */}
      {student_phone_number && (
        <div className="phone-reveal-v2">
          <FaUserGraduate className="phone-icon-v2" />
          <span>رقم الطالب: <strong>{student_phone_number}</strong></span>
        </div>
      )}

      {/* ─── أزرار الإجراء ─── */}
      <div className="actions-v2">
        {!isPrivate && accepting_applications && onSubmitOffer && (
          <button className="btn-offer-v2" onClick={() => onSubmitOffer(post_requirements_id)}>
            <FaMoneyBillWave /> تقديم عرض
          </button>
        )}
        {isPrivate && lead_status === 'open' && onAcceptContact && (
          <button className="btn-accept-v2" onClick={() => onAcceptContact(post_requirements_id)}>
            <FaCheckCircle /> أوافق على التواصل
          </button>
        )}
        {isMatched && (
          <div className="badge-matched-v2">
            <FaStar /> تم التطابق
          </div>
        )}
        {isShortlist && (
          <div className="badge-shortlist-v2">
            <FaRegStar /> في القائمة المختصرة
          </div>
        )}
      </div>
    </div>
  );
}