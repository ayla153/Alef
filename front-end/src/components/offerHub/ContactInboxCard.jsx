import { useNavigate } from 'react-router-dom';
import { FaPhone, FaWhatsapp, FaExternalLinkAlt } from 'react-icons/fa';
import { formatCurrency, formatDate } from '../../utils/translations';

function PhoneChip({ label, phone, actions = true }) {
  const waDigits = phone?.replace(/\D/g, '') || '';
  return (
    <div className="inbox-phone-chip">
      <span className="inbox-phone-chip-label">{label}</span>
      <span className="inbox-phone-chip-number" dir="ltr">{phone || '—'}</span>
      {actions && phone && (
        <div className="inbox-phone-chip-actions">
          <a href={`tel:${phone}`} className="inbox-chip-btn call" aria-label="اتصال">
            <FaPhone />
          </a>
          {waDigits && (
            <a
              href={`https://wa.me/${waDigits}`}
              target="_blank"
              rel="noreferrer"
              className="inbox-chip-btn wa"
              aria-label="واتساب"
            >
              <FaWhatsapp />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function formatFirstSession(note) {
  if (!note) return null;
  if (note === 'Flexible') return 'مرنة — حسب الاتفاق مع الطالب';
  return note;
}

export default function ContactInboxCard({ item, tutorPhone, highlighted }) {
  const navigate = useNavigate();
  const isPrivate = item.source === 'private';
  const response = item.tutorResponse;
  const firstSession = formatFirstSession(response?.firstSessionNote);
  const hasOfferDetails = Boolean(
    response?.message || firstSession || response?.proposedFee != null
  );

  const openLead = () => {
    if (isPrivate) navigate(`/dashboard/private-requests/${item.leadId}`);
    else navigate(`/dashboard/requests/${item.leadId}`);
  };

  return (
    <article
      id={`contact-${item.leadId}`}
      className={`inbox-row-card ${item.source} ${highlighted ? 'highlighted' : ''}`}
    >
      <header className="inbox-card-intro">
        <p className="inbox-card-eyebrow">
          {isPrivate ? 'طلب خاص' : 'طلب عام'}
          <span className="inbox-card-dot">·</span>
          {formatDate(item.sortAt)}
        </p>
        <h3 className="inbox-row-title">{item.title}</h3>
        <p className="inbox-card-subline">
          {[isPrivate ? item.studentName : null, item.subjectLabel].filter(Boolean).join(' · ')}
        </p>
      </header>

      {item.description && (
        <section className="inbox-card-block">
          <h4 className="inbox-block-label">وصف الطلب</h4>
          <p className="inbox-block-text">{item.description}</p>
        </section>
      )}

      <section className="inbox-card-block inbox-card-block-phones">
        <h4 className="inbox-block-label">أرقام التواصل</h4>
        <div className="inbox-row-phones-row">
          <PhoneChip label={`${item.studentName}`} phone={item.studentPhone} />
          <span className="inbox-row-phones-arrow" aria-hidden>↔</span>
          <PhoneChip label="أنت" phone={tutorPhone} actions={false} />
        </div>
      </section>

      {hasOfferDetails && (
        <section className="inbox-card-block inbox-card-block-offer">
          <h4 className="inbox-block-label">عرضك للطالب</h4>
          <dl className="inbox-offer-dl">
            {response?.message && (
              <>
                <dt>رسالتك</dt>
                <dd>{response.message}</dd>
              </>
            )}
            {firstSession && (
              <>
                <dt>الحصة الأولى</dt>
                <dd>{firstSession}</dd>
              </>
            )}
            {response?.proposedFee != null && (
              <>
                <dt>الأجر المقترح</dt>
                <dd className="inbox-offer-fee">{formatCurrency(response.proposedFee)}</dd>
              </>
            )}
          </dl>
        </section>
      )}

      <footer className="inbox-card-actions">
        <button type="button" className="inbox-row-open-btn" onClick={openLead}>
          <FaExternalLinkAlt /> فتح الطلب
        </button>
      </footer>
    </article>
  );
}
