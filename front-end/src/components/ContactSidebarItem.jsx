import { FaPhone, FaWhatsapp, FaBook, FaGraduationCap } from 'react-icons/fa';
import '../styles/StudentContacts.css';

export default function ContactSidebarItem({ contact, compact = false, selected = false, onClick }) {
  const { studentName, phone, subjectTitle, levelTitle } = contact;
  const waDigits = phone?.replace(/\D/g, '') || '';

  if (compact) {
    return (
      <div className={`csb-item ${selected ? 'selected' : ''}`}>
        <button type="button" className="csb-item-main" onClick={onClick}>
          <span className="csb-name">{studentName}</span>
          {subjectTitle && (
            <span className="csb-subject">
              <FaBook /> {subjectTitle}
            </span>
          )}
          {levelTitle && (
            <span className="csb-level">
              <FaGraduationCap /> {levelTitle}
            </span>
          )}
          <span className="csb-phone" dir="ltr">{phone}</span>
        </button>
        <div className="csb-quick-actions">
          <a href={`tel:${phone}`} className="csb-icon-btn csb-call" title="اتصال" aria-label="اتصال">
            <FaPhone />
          </a>
          {waDigits && (
            <a
              href={`https://wa.me/${waDigits}`}
              target="_blank"
              rel="noreferrer"
              className="csb-icon-btn csb-wa"
              title="واتساب"
              aria-label="واتساب"
            >
              <FaWhatsapp />
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      className={`csb-list-item ${selected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <span className="csb-name">{studentName}</span>
      {subjectTitle && (
        <span className="csb-subject">
          <FaBook /> {subjectTitle}
        </span>
      )}
      {levelTitle && (
        <span className="csb-level">
          <FaGraduationCap /> {levelTitle}
        </span>
      )}
      <span className="csb-phone" dir="ltr">{phone}</span>
    </button>
  );
}
