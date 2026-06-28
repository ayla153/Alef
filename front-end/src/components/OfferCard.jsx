import {
  FaPaperPlane,
  FaMoneyBillWave,
  FaBook,
  FaUserGraduate,
  FaPhone,
  FaExternalLinkAlt,
  FaClock,
  FaFileAlt,
} from 'react-icons/fa';
import { leadStatusAr, formatCurrency, formatDate } from '../utils/translations';
import '../styles/MyOffers.css';

const OUTCOME_AR = {
  pending: { label: 'بانتظار قرار الطالب', cls: 'pending' },
  rejected: { label: 'مرفوض', cls: 'rejected' },
  contact_shared: { label: 'تم مشاركة التواصل', cls: 'shared' },
  lead_closed_empty: { label: 'أُغلق بلا تطابق', cls: 'closed' },
  lead_closed_expired: { label: 'انتهت مدة الطلب', cls: 'closed' },
};

export default function OfferCard({ offer, onViewLead }) {
  const outcome = OUTCOME_AR[offer.outcome] || {
    label: offer.outcome,
    cls: 'closed',
  };

  return (
    <div className="offer-card">
      <div className="offer-card-top">
        <span className="offer-id">#{offer.post_requirements_id}</span>
        <span className={`offer-outcome ${outcome.cls}`}>{outcome.label}</span>
      </div>

      <h3 className="offer-lead-title">{offer.lead_title}</h3>

      <div className="offer-meta-row">
        {offer.subjectTitle && (
          <span><FaBook /> {offer.subjectTitle}</span>
        )}
        {offer.levelTitle && (
          <span><FaUserGraduate /> {offer.levelTitle}</span>
        )}
      </div>

      <div className="offer-details">
        <div className="offer-detail">
          <FaMoneyBillWave />
          <span className="label">أجرك المقترح:</span>
          <span className="value">{formatCurrency(offer.proposed_fee)}</span>
        </div>
        <div className="offer-detail">
          <FaClock />
          <span className="label">تاريخ العرض:</span>
          <span className="value">{formatDate(offer.offer_created_at)}</span>
        </div>
        <div className="offer-detail">
          <FaFileAlt />
          <span className="label">حالة الطلب:</span>
          <span className="value">{leadStatusAr[offer.lead_status] || offer.lead_status}</span>
        </div>
      </div>

      {offer.first_session_note && (
        <p className="offer-note"><strong>الحصة الأولى:</strong> {offer.first_session_note}</p>
      )}
      {offer.message && (
        <p className="offer-message"><strong>رسالتك:</strong> {offer.message}</p>
      )}

      {offer.student_phone_number && (
        <div className="offer-phone">
          <FaPhone />
          <span>رقم الطالب: {offer.student_phone_number}</span>
        </div>
      )}

      <button
        type="button"
        className="offer-view-lead-btn"
        onClick={() => onViewLead?.(offer.post_requirements_id)}
      >
        <FaExternalLinkAlt /> عرض الطلب
      </button>
    </div>
  );
}
