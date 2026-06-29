import {
  FaPhone,
  FaWhatsapp,
  FaGlobe,
  FaLock,
  FaBook,
  FaMoneyBillWave,
  FaClock,
  FaCheckCircle,
  FaExchangeAlt,
  FaPaperPlane,
  FaChalkboard,
} from 'react-icons/fa';
import { formatCurrency, formatDate, leadStatusAr } from '../../utils/translations';
import { OUTCOME_META } from '../../utils/offerHub';

function PhoneChip({ label, phone, actions = true }) {
  const waDigits = phone?.replace(/\D/g, '') || '';
  return (
    <div className="ohub-phone-chip">
      <span className="ohub-phone-chip-label">{label}</span>
      <span className="ohub-phone-chip-number" dir="ltr">{phone || '—'}</span>
      {actions && phone && (
        <div className="ohub-phone-chip-actions">
          <a href={`tel:${phone}`} className="ohub-chip-btn call" title="اتصال">
            <FaPhone />
          </a>
          {waDigits && (
            <a
              href={`https://wa.me/${waDigits}`}
              target="_blank"
              rel="noreferrer"
              className="ohub-chip-btn wa"
              title="واتساب"
            >
              <FaWhatsapp />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default function OfferHubInboxCard({ item, tutorPhone, focused = false }) {
  const outcome = OUTCOME_META[item.outcome] || {
    label: item.outcome,
    cls: 'closed',
    short: item.outcome,
  };
  const isShared = item.outcome === 'contact_shared' && item.studentPhone;
  const response = item.tutorResponse;
  const leadStatus = item.offer?.lead_status || item.privateLead?.lead_status;

  return (
    <article
      id={`ohub-${item.key}`}
      className={`ohub-inbox-card ${outcome.cls} ${focused ? 'focused' : ''}`}
    >
      <header className="ohub-inbox-head">
        <div className="ohub-inbox-tags">
          <span className={`ohub-source ${item.source}`}>
            {item.source === 'private' ? <FaLock /> : <FaGlobe />}
            {item.source === 'private' ? 'طلب خاص' : 'طلب عام'}
          </span>
          <span className={`ohub-outcome ${outcome.cls}`}>{outcome.label}</span>
        </div>
        <time className="ohub-inbox-date">
          <FaClock /> {formatDate(item.sortAt)}
        </time>
      </header>

      <div className="ohub-inbox-main">
        <div className="ohub-inbox-copy">
          <h3 className="ohub-inbox-title">{item.title}</h3>
          <p className="ohub-inbox-student">
            {item.source === 'private' ? item.studentName : 'طلب عام'}
            {item.subjectLabel && (
              <span className="ohub-inbox-subject">
                <FaBook /> {item.subjectLabel}
              </span>
            )}
          </p>
          {leadStatus && item.outcome !== 'contact_shared' && (
            <p className="ohub-inbox-lead-status">
              حالة الطلب: {leadStatusAr[leadStatus] || leadStatus}
            </p>
          )}
        </div>

        {response?.proposedFee != null && (
          <div className="ohub-inbox-fee">
            <FaMoneyBillWave />
            <span>{formatCurrency(response.proposedFee)}</span>
          </div>
        )}
      </div>

      {response?.message && (
        <div className="ohub-inbox-message">
          <div className="ohub-inbox-message-label">
            <FaPaperPlane /> رسالتك للطالب
          </div>
          <p>{response.message}</p>
          {response.firstSessionNote && response.firstSessionNote !== 'Flexible' && (
            <p className="ohub-inbox-session-note">
              <FaChalkboard /> الحصة الأولى: {response.firstSessionNote}
            </p>
          )}
        </div>
      )}

      {isShared ? (
        <section className="ohub-inbox-exchange">
          <div className="ohub-inbox-exchange-label">
            <FaCheckCircle /> تم تبادل الأرقام — يمكنكما التواصل مباشرة
          </div>
          <div className="ohub-inbox-phones">
            <PhoneChip label={`رقم ${item.studentName}`} phone={item.studentPhone} />
            <span className="ohub-inbox-phones-arrow" aria-hidden><FaExchangeAlt /></span>
            <PhoneChip label="رقمك (شاركته)" phone={tutorPhone} actions={false} />
          </div>
        </section>
      ) : item.outcome === 'pending' ? (
        <p className="ohub-inbox-hint pending">
          الأرقام مخفية حتى يختارك الطالب من قائمة العروض.
        </p>
      ) : null}
    </article>
  );
}
