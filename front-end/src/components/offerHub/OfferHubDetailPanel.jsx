import { useNavigate } from 'react-router-dom';
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
  FaTimes,
  FaExternalLinkAlt,
} from 'react-icons/fa';
import { leadStatusAr, formatCurrency, formatDate } from '../../utils/translations';
import { OUTCOME_META } from '../../utils/offerHub';

function PhoneChip({ label, phone, actions = true }) {
  const waDigits = phone?.replace(/\D/g, '') || '';
  return (
    <div className="ohub-phone-chip">
      <span className="ohub-phone-chip-label">{label}</span>
      <span className="ohub-phone-chip-number" dir="ltr">{phone || '—'}</span>
      {actions && phone && (
        <div className="ohub-phone-chip-actions">
          <a href={`tel:${phone}`} className="ohub-chip-btn call"><FaPhone /></a>
          {waDigits && (
            <a href={`https://wa.me/${waDigits}`} target="_blank" rel="noreferrer" className="ohub-chip-btn wa">
              <FaWhatsapp />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default function OfferHubDetailPanel({ item, tutorPhone, onClose }) {
  const navigate = useNavigate();

  if (!item) {
    return (
      <div className="ohub-detail-panel ohub-detail-empty">
        <div className="ohub-detail-empty-inner">
          <span className="ohub-detail-empty-icon">📬</span>
          <strong>اختر عنصراً لعرض التفاصيل</strong>
          <p>اضغط «عرض التفاصيل» على أي بطاقة — أو حدّدها من الشبكة.</p>
        </div>
      </div>
    );
  }

  const outcome = OUTCOME_META[item.outcome] || { label: item.outcome, cls: 'closed' };
  const isShared = item.outcome === 'contact_shared' && item.studentPhone;
  const response = item.tutorResponse;
  const leadStatus = item.offer?.lead_status || item.privateLead?.lead_status;
  const isPrivate = item.source === 'private';

  return (
    <div className={`ohub-detail-panel ${item.source}`}>
      <header className="ohub-detail-panel-head">
        <div>
          <span className={`ohub-preview-type ${item.source}`}>
            {isPrivate ? <><FaLock /> طلب خاص</> : <><FaGlobe /> عرض عام</>}
          </span>
          <h2>{item.title}</h2>
          {item.subjectLabel && (
            <p className="ohub-detail-subject"><FaBook /> {item.subjectLabel}</p>
          )}
        </div>
        <button type="button" className="ohub-detail-close" onClick={onClose} aria-label="إغلاق">
          <FaTimes />
        </button>
      </header>

      <div className="ohub-detail-tags">
        <span className={`ohub-outcome ${outcome.cls}`}>{outcome.label}</span>
        <span className="ohub-detail-date"><FaClock /> {formatDate(item.sortAt)}</span>
      </div>

      {isShared && (
        <section className="ohub-detail-exchange">
          <p className="ohub-detail-exchange-title">
            <FaCheckCircle /> تم تبادل الأرقام
          </p>
          <div className="ohub-detail-phones">
            <PhoneChip label={`رقم ${item.studentName}`} phone={item.studentPhone} />
            <FaExchangeAlt className="ohub-detail-phones-arrow" />
            <PhoneChip label="رقمك" phone={tutorPhone} actions={false} />
          </div>
        </section>
      )}

      {item.outcome === 'pending' && (
        <p className="ohub-detail-hint pending">بانتظار قرار الطالب — الأرقام مخفية.</p>
      )}

      {response?.message && (
        <section className="ohub-detail-block">
          <h4><FaPaperPlane /> رسالتك للطالب</h4>
          <p>{response.message}</p>
          {response.firstSessionNote && response.firstSessionNote !== 'Flexible' && (
            <p className="ohub-detail-note">
              <FaChalkboard /> الحصة الأولى: {response.firstSessionNote}
            </p>
          )}
        </section>
      )}

      {response?.proposedFee != null && (
        <p className="ohub-detail-fee">
          <FaMoneyBillWave /> {formatCurrency(response.proposedFee)}
        </p>
      )}

      {leadStatus && item.outcome !== 'contact_shared' && (
        <p className="ohub-detail-status">
          حالة الطلب: {leadStatusAr[leadStatus] || leadStatus}
        </p>
      )}

      {isPrivate && item.privateLead?.description && (
        <section className="ohub-detail-block muted">
          <h4>وصف الطلب</h4>
          <p>{item.privateLead.description}</p>
        </section>
      )}

      <div className="ohub-detail-footer">
        {isPrivate && (
          <button
            type="button"
            className="ohub-detail-link-btn"
            onClick={() => navigate(`/dashboard/private-requests/${item.leadId}`)}
          >
            <FaExternalLinkAlt /> فتح في الطلبات الخاصة
          </button>
        )}
        {!isPrivate && (
          <button
            type="button"
            className="ohub-detail-link-btn"
            onClick={() => navigate(`/dashboard/requests/${item.leadId}`)}
          >
            <FaExternalLinkAlt /> فتح الطلب العام
          </button>
        )}
      </div>
    </div>
  );
}
