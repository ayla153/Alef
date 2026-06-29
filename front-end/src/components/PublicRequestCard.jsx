import {
  FaBook,
  FaGlobe,
  FaMoneyBillWave,
  FaCheckCircle,
  FaExclamationCircle,
  FaArrowLeft,
  FaBriefcase,
  FaChalkboard,
  FaVenusMars,
  FaClock,
  FaPaperPlane,
  FaLaptop,
  FaHome,
} from 'react-icons/fa';
import '../styles/PublicRequestCard.css';
import {
  leadStatusAr,
  translateSubject,
  translateLevel,
  formatCurrency,
  tuitionTypeAr,
  genderPrefAr,
} from '../utils/translations';

const statusInfo = (lead) => {
  if (lead.has_my_offer) {
    return { label: 'قدّمت عرضاً', cls: 'applied', icon: FaPaperPlane };
  }
  if (!lead.accepting_applications) {
    return { label: 'الأماكن ممتلئة', cls: 'slots-full', icon: FaExclamationCircle };
  }
  const status = lead.lead_status || 'open';
  if (status === 'open') {
    return { label: leadStatusAr.open, cls: 'open', icon: FaCheckCircle };
  }
  return { label: leadStatusAr[status] || status, cls: 'closed', icon: FaExclamationCircle };
};

function tuitionIcon(type) {
  if (type === 'online') return FaLaptop;
  if (type === 'offline') return FaHome;
  return FaChalkboard;
}

export default function PublicRequestCard({ request, onViewDetails }) {
  const {
    post_requirements_id,
    title,
    description,
    min_expected_fee,
    max_expected_fee,
    pending_offer_count,
    max_applications,
    accepting_applications,
    subjectTitle,
    levelTitle,
    foundation_tution,
    tution_type,
    preferred_gender,
    weekly_classes,
    has_my_offer,
  } = request;

  const translatedSubject = subjectTitle ? translateSubject(subjectTitle) : 'غير محددة';
  const translatedLevel = levelTitle ? translateLevel(levelTitle) : '';
  const { label: statusLabel, cls: statusClass, icon: StatusIcon } = statusInfo(request);
  const TuitionIcon = tuitionIcon(tution_type);

  const budgetDisplay =
    min_expected_fee != null && max_expected_fee != null
      ? `${formatCurrency(min_expected_fee)} – ${formatCurrency(max_expected_fee)}`
      : 'غير محدد';

  const tuitionText = tuitionTypeAr[tution_type] || tution_type || 'غير محدد';
  const genderText = preferred_gender ? genderPrefAr[preferred_gender] || preferred_gender : null;

  return (
    <article
      className={`public-request-card ${statusClass}${has_my_offer ? ' already-applied' : ''}`}
    >
      <div className="prc-top">
        <span className="prc-type">
          <FaGlobe /> طلب عام
        </span>
        <span className={`prc-status ${statusClass}`}>
          <StatusIcon /> {statusLabel}
        </span>
      </div>

      <h3 className="prc-title">{title}</h3>

      <div className="prc-subject-line">
        <FaBook className="prc-subject-icon" />
        <span>{translatedSubject}{translatedLevel ? ` · ${translatedLevel}` : ''}</span>
        {foundation_tution && <span className="prc-chip prc-chip-gold">تأسيس</span>}
      </div>

      <div className="prc-tags">
        <span className="prc-chip prc-chip-blue">
          <TuitionIcon /> {tuitionText}
        </span>
        {genderText && (
          <span className="prc-chip prc-chip-purple">
            <FaVenusMars /> {genderText}
          </span>
        )}
        <span className="prc-chip prc-chip-gray">
          <FaClock /> {weekly_classes} حصة/أسبوع
        </span>
      </div>

      {description && (
        <p className="prc-desc">{description}</p>
      )}

      <div className="prc-footer">
        <div className="prc-stats">
          <span className="prc-stat">
            <FaMoneyBillWave />
            <span className="prc-stat-label">الميزانية</span>
            <strong>{budgetDisplay}</strong>
          </span>
          <span className="prc-stat">
            <FaBriefcase />
            <span className="prc-stat-label">العروض</span>
            <strong>
              {pending_offer_count ?? 0}/{max_applications ?? '∞'}
              {!accepting_applications && !has_my_offer && (
                <em className="prc-full"> ممتلئ</em>
              )}
            </strong>
          </span>
        </div>

        <button
          type="button"
          className={`prc-details-btn${has_my_offer ? ' prc-details-btn-muted' : ''}`}
          onClick={() => onViewDetails?.(post_requirements_id)}
        >
          {has_my_offer ? 'عرض طلبي' : 'عرض التفاصيل'} <FaArrowLeft />
        </button>
      </div>
    </article>
  );
}
