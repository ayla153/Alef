import { FaPhone, FaWhatsapp, FaLock, FaGlobe, FaBook, FaExternalLinkAlt } from 'react-icons/fa';
import '../styles/StudentContacts.css';

export default function StudentContactRow({ contact, onViewLead }) {
  const {
    studentName,
    phone,
    subjectLabel,
    source,
    title,
    leadId,
  } = contact;

  const waDigits = phone?.replace(/\D/g, '') || '';

  return (
    <article className="student-contact-row">
      <div className="scr-main">
        <div className="scr-head">
          <h3 className="scr-name">{studentName}</h3>
          <span className={`scr-source ${source}`}>
            {source === 'private' ? <FaLock /> : <FaGlobe />}
            {source === 'private' ? 'طلب خاص' : 'طلب عام'}
          </span>
        </div>
        <p className="scr-title">{title}</p>
        {subjectLabel && (
          <span className="scr-subject">
            <FaBook /> {subjectLabel}
          </span>
        )}
      </div>

      <div className="scr-phone-block">
        <span className="scr-phone-label">رقم الطالب</span>
        <span className="scr-phone" dir="ltr">{phone}</span>
      </div>

      <div className="scr-actions">
        <a href={`tel:${phone}`} className="scr-btn scr-btn-call">
          <FaPhone />
          <span>اتصال</span>
        </a>
        {waDigits && (
          <a
            href={`https://wa.me/${waDigits}`}
            target="_blank"
            rel="noreferrer"
            className="scr-btn scr-btn-wa"
          >
            <FaWhatsapp />
            <span>واتساب</span>
          </a>
        )}
        {onViewLead && leadId && (
          <button
            type="button"
            className="scr-btn scr-btn-link"
            onClick={() => onViewLead(leadId, source === 'public')}
          >
            <FaExternalLinkAlt />
            <span>الطلب</span>
          </button>
        )}
      </div>
    </article>
  );
}
