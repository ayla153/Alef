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
  FaRegFileAlt,
} from 'react-icons/fa';
import PrivateRequestCard from './PrivateRequestCard';
import {
  leadStatusAr,
  formatCurrency,
  formatDate,
} from '../utils/translations';
import { OUTCOME_META } from '../utils/offerHub';
import '../styles/MyOffers.css';

function PhoneBlock({ label, phone, hint, actions = true }) {
  const waDigits = phone?.replace(/\D/g, '') || '';
  return (
    <div className="ohub-phone-block">
      <span className="ohub-phone-block-label">{label}</span>
      <span className="ohub-phone-block-number" dir="ltr">{phone}</span>
      {hint && <span className="ohub-phone-block-hint">{hint}</span>}
      {actions && phone && (
        <div className="ohub-phone-block-actions">
          <a href={`tel:${phone}`} className="ohub-action-btn ohub-action-call">
            <FaPhone /> اتصال
          </a>
          {waDigits && (
            <a
              href={`https://wa.me/${waDigits}`}
              target="_blank"
              rel="noreferrer"
              className="ohub-action-btn ohub-action-wa"
            >
              <FaWhatsapp /> واتساب
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default function OfferHubDetailPanel({ item, tutorPhone }) {
  if (!item) {
    return (
      <div className="ohub-detail-empty">
        <p>اختر عرضاً أو جهة اتصال من القائمة لعرض التفاصيل.</p>
      </div>
    );
  }

  const outcome = OUTCOME_META[item.outcome] || {
    label: item.outcome,
    cls: 'closed',
  };
  const isShared = item.outcome === 'contact_shared' && item.studentPhone;
  const offer = item.offer;
  const revealedAt = offer?.contact_revealed_at || item.privateLead?.closed_at;

  return (
    <div className="ohub-detail-wrap">
      <header className="ohub-detail-header">
        <div className="ohub-detail-tags">
          <span className={`ohub-source ${item.source}`}>
            {item.source === 'private' ? <FaLock /> : <FaGlobe />}
            {item.source === 'private' ? 'طلب خاص' : 'طلب عام'}
          </span>
          <span className={`ohub-outcome ${outcome.cls}`}>{outcome.label}</span>
        </div>
        <h2 className="ohub-detail-title">{item.title}</h2>
        {item.subjectLabel && (
          <p className="ohub-detail-subject"><FaBook /> {item.subjectLabel}</p>
        )}
      </header>

      {isShared ? (
        <section className="ohub-exchange-banner">
          <div className="ohub-exchange-head">
            <FaCheckCircle />
            <div>
              <strong>تم تبادل الأرقام</strong>
              <p>
                {item.source === 'private'
                  ? 'وافقت على التواصل — الطالب يملك رقمك وأنت تملكين رقمه.'
                  : 'الطالب اختارك من العروض — يمكنكما التواصل مباشرة خارج المنصة.'}
              </p>
            </div>
          </div>
          <div className="ohub-exchange-grid">
            <PhoneBlock
              label={`رقم ${item.studentName}`}
              phone={item.studentPhone}
            />
            <div className="ohub-exchange-arrow" aria-hidden>
              <FaExchangeAlt />
            </div>
            <PhoneBlock
              label="رقمك"
              phone={tutorPhone}
              hint="شاركته مع الطالب"
              actions={false}
            />
          </div>
          {revealedAt && (
            <p className="ohub-exchange-date">
              <FaClock /> تبادل الأرقام: {formatDate(revealedAt)}
            </p>
          )}
        </section>
      ) : offer?.outcome === 'pending' ? (
        <section className="ohub-pending-banner">
          <strong>بانتظار قرار الطالب</strong>
          <p>الأرقام مخفية حتى يختارك الطالب من قائمة العروض.</p>
        </section>
      ) : null}

      {offer && (
        <section className="ohub-offer-body">
          <div className="ohub-meta-grid">
            <span><FaMoneyBillWave /> {formatCurrency(offer.proposed_fee)} (عرضك)</span>
            <span><FaClock /> {formatDate(offer.offer_created_at)}</span>
            <span>
              <FaRegFileAlt /> {leadStatusAr[offer.lead_status] || offer.lead_status}
            </span>
          </div>
          {offer.first_session_note && (
            <div className="ohub-text-block">
              <strong>الحصة الأولى</strong>
              <p>{offer.first_session_note}</p>
            </div>
          )}
          {offer.message && (
            <div className="ohub-text-block">
              <strong>رسالتك للطالب</strong>
              <p>{offer.message}</p>
            </div>
          )}
        </section>
      )}

      {item.source === 'private' && item.privateLead && (
        <div className="ohub-private-card-wrap">
          <PrivateRequestCard request={item.privateLead} />
        </div>
      )}
    </div>
  );
}
