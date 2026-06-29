import {
  FaPhone,
  FaWhatsapp,
  FaLock,
  FaGlobe,
  FaBook,
  FaMoneyBillWave,
  FaRegFileAlt,
} from 'react-icons/fa';
import PrivateRequestCard from './PrivateRequestCard';
import {
  tuitionTypeAr,
  formatCurrency,
  leadStatusAr,
} from '../utils/translations';
import '../styles/StudentContacts.css';

function PublicOfferDetail({ offer, subjectLabel }) {
  return (
    <article className="contact-detail-panel public">
      <header className="cdp-header">
        <span className="cdp-source public"><FaGlobe /> طلب عام</span>
        <h2>{offer.lead_title}</h2>
      </header>
      <div className="cdp-meta-grid">
        {subjectLabel && (
          <span><FaBook /> {subjectLabel}</span>
        )}
        <span><FaMoneyBillWave /> {formatCurrency(offer.proposed_fee)} (عرضك)</span>
        <span>
          <FaRegFileAlt /> {leadStatusAr[offer.lead_status] || offer.lead_status}
        </span>
      </div>
      {offer.message && (
        <div className="cdp-block">
          <strong>رسالتك للطالب</strong>
          <p>{offer.message}</p>
        </div>
      )}
      {offer.first_session_note && (
        <div className="cdp-block">
          <strong>الحصة الأولى</strong>
          <p>{offer.first_session_note}</p>
        </div>
      )}
    </article>
  );
}

export default function ContactLeadDetailPanel({ contact, privateLead, publicOffer }) {
  if (!contact) {
    return (
      <div className="contact-detail-empty">
        <p>اختر طالباً من القائمة لعرض تفاصيل الطلب ورقمه.</p>
      </div>
    );
  }

  const { phone, studentName, subjectLabel, source } = contact;
  const waDigits = phone?.replace(/\D/g, '') || '';

  return (
    <div className="contact-detail-wrap">
      <div className="cdp-phone-hero">
        <div>
          <span className="cdp-phone-label">رقم {studentName}</span>
          <span className="cdp-phone-number" dir="ltr">{phone}</span>
        </div>
        <div className="cdp-phone-actions">
          <a href={`tel:${phone}`} className="cdp-btn cdp-btn-call">
            <FaPhone /> اتصال
          </a>
          {waDigits && (
            <a
              href={`https://wa.me/${waDigits}`}
              target="_blank"
              rel="noreferrer"
              className="cdp-btn cdp-btn-wa"
            >
              <FaWhatsapp /> واتساب
            </a>
          )}
        </div>
      </div>

      {source === 'private' && privateLead ? (
        <PrivateRequestCard request={privateLead} />
      ) : source === 'public' && publicOffer ? (
        <PublicOfferDetail offer={publicOffer} subjectLabel={subjectLabel} />
      ) : (
        <div className="contact-detail-panel">
          <span className={`cdp-source ${source}`}>
            {source === 'private' ? <FaLock /> : <FaGlobe />}
            {source === 'private' ? 'طلب خاص' : 'طلب عام'}
          </span>
          <h2>{contact.title}</h2>
          {subjectLabel && (
            <p className="cdp-subject-line"><FaBook /> {subjectLabel}</p>
          )}
        </div>
      )}
    </div>
  );
}
