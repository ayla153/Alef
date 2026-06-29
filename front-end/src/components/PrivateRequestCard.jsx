import {
  FaLock,
  FaBook,
  FaChalkboard,
  FaClock,
  FaMoneyBillWave,
  FaRegFileAlt,
  FaTag,
  FaCheckCircle,
  FaStar,
  FaHandPointer,
  FaAddressBook,
} from 'react-icons/fa';
import '../styles/PrivateRequestCard.css';
import {
  tuitionTypeAr,
  leadStatusAr,
  translateSubject,
  translateLevel,
  formatCurrency,
} from '../utils/translations';
import { formatRelativeTime } from '../utils/formatRelativeTime';

function studentDisplayName(lead) {
  const name = lead.student_name?.trim();
  if (name) return name;
  return 'طالب';
}

function privateStatus(lead) {
  if (lead.lead_status === 'open') {
    return { label: 'بانتظار ردك', cls: 'awaiting', icon: FaHandPointer };
  }
  if (lead.lead_status === 'closed_matched') {
    return { label: leadStatusAr.closed_matched, cls: 'matched', icon: FaStar };
  }
  return { label: leadStatusAr[lead.lead_status] || 'مغلق', cls: 'closed', icon: FaCheckCircle };
}

export default function PrivateRequestCard({ request, onAcceptContact, onGoToContacts }) {
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
    subjectTitle,
    levelTitle,
    lead_status,
  } = request;

  const studentName = studentDisplayName(request);
  const { label: statusLabel, cls: statusClass, icon: StatusIcon } = privateStatus(request);
  const isOpen = lead_status === 'open';
  const isMatched = lead_status === 'closed_matched';

  const budgetDisplay =
    min_expected_fee != null && max_expected_fee != null
      ? `${formatCurrency(min_expected_fee)} – ${formatCurrency(max_expected_fee)}`
      : '—';

  const tuitionText = tuitionTypeAr[tution_type] || tution_type || '—';
  const subject = subjectTitle ? translateSubject(subjectTitle) : '—';
  const level = levelTitle ? translateLevel(levelTitle) : '';

  return (
    <article className={`private-message-card ${statusClass}`}>
      <aside className="pmc-aside">
        <h3 className="pmc-student-name">{studentName}</h3>
        {subject !== '—' && (
          <span className="pmc-aside-meta pmc-aside-subject">
            <FaBook /> {subject}
          </span>
        )}
        {level && (
          <span className="pmc-aside-meta pmc-aside-level">
            {level}
          </span>
        )}
      </aside>

      <div className="pmc-main">
        <div className="pmc-main-head">
          <span className="pmc-private-badge">
            <FaLock /> طلب خاص
          </span>
          <h4 className="pmc-title">{title}</h4>
          {foundation_tution && (
            <span className="pmc-tag"><FaTag /> تأسيس</span>
          )}
          <div className={`pmc-status ${statusClass}`}>
            <StatusIcon />
            <span>{statusLabel}</span>
          </div>
          <span className="pmc-time-ago">{formatRelativeTime(created_at)}</span>
        </div>

        <p className="pmc-message-text">{description || '—'}</p>

        <div className="pmc-meta-row">
          <span><FaBook /> {subject}{level ? ` · ${level}` : ''}</span>
          <span><FaChalkboard /> {tuitionText}</span>
          <span><FaClock /> {weekly_classes} حصة/أسبوع</span>
          <span><FaRegFileAlt /> {help_type || '—'}</span>
          <span><FaMoneyBillWave /> {budgetDisplay}</span>
        </div>
      </div>

      <div className="pmc-action">
        {isOpen && onAcceptContact && (
          <button
            type="button"
            className="pmc-accept-btn"
            onClick={() => onAcceptContact(post_requirements_id)}
          >
            <FaCheckCircle />
            <span>أريد التواصل</span>
          </button>
        )}
        {isMatched && onGoToContacts && (
          <button
            type="button"
            className="pmc-contacts-link-btn"
            onClick={onGoToContacts}
          >
            <FaAddressBook />
            <span>الرقم والطلب</span>
          </button>
        )}
        {isMatched && !onGoToContacts && (
          <div className="pmc-matched-badge">
            <FaStar />
            <span>تم التواصل</span>
          </div>
        )}
      </div>
    </article>
  );
}
