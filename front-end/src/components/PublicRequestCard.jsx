import {
  FaBook,
  FaGlobe,
  FaMoneyBillWave,
  FaCheckCircle,
  FaExclamationCircle,
  FaArrowLeft,
  FaBriefcase,
  FaUserGraduate,
} from 'react-icons/fa';
import '../styles/PublicRequestCard.css';
import {
  leadStatusAr,
  translateSubject,
  translateLevel,
  formatCurrency,
} from '../utils/translations';

const statusInfo = (lead) => {
  if (!lead.accepting_applications) {
    return { label: 'الأماكن ممتلئة', cls: 'slots-full', icon: FaExclamationCircle };
  }
  const status = lead.lead_status || 'open';
  if (status === 'open') {
    return { label: leadStatusAr.open, cls: 'open', icon: FaCheckCircle };
  }
  return { label: leadStatusAr[status] || status, cls: 'closed', icon: FaExclamationCircle };
};

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
  } = request;

  const translatedSubject = subjectTitle ? translateSubject(subjectTitle) : 'غير محددة';
  const translatedLevel = levelTitle ? translateLevel(levelTitle) : '';
  const { label: statusLabel, cls: statusClass, icon: StatusIcon } = statusInfo(request);

  const budgetDisplay =
    min_expected_fee != null && max_expected_fee != null
      ? `${formatCurrency(min_expected_fee)} – ${formatCurrency(max_expected_fee)}`
      : 'غير محدد';

  return (
    <article className={`public-request-card ${statusClass}`}>
      <div className="prc-top">
        <span className="prc-type">
          <FaGlobe /> طلب عام
        </span>
        <span className={`prc-status ${statusClass}`}>
          <StatusIcon /> {statusLabel}
        </span>
      </div>

      <h3 className="prc-title">{title}</h3>

      <div className="prc-meta">
        <span>
          <FaBook /> {translatedSubject}
          {translatedLevel ? ` — ${translatedLevel}` : ''}
        </span>
        {foundation_tution && <span className="prc-foundation">تأسيس</span>}
      </div>

      {description && (
        <p className="prc-desc">{description}</p>
      )}

      <div className="prc-stats">
        <span>
          <FaMoneyBillWave /> {budgetDisplay}
        </span>
        <span>
          <FaBriefcase /> {pending_offer_count ?? 0}/{max_applications ?? '∞'} عروض
          {!accepting_applications && <em className="prc-full"> (ممتلئ)</em>}
        </span>
      </div>

      <button
        type="button"
        className="prc-details-btn"
        onClick={() => onViewDetails?.(post_requirements_id)}
      >
        عرض التفاصيل <FaArrowLeft />
      </button>
    </article>
  );
}
