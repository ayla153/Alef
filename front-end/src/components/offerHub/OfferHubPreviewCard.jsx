import {
  FaGlobe,
  FaLock,
  FaClock,
  FaMoneyBillWave,
  FaPaperPlane,
  FaArrowLeft,
  FaPhone,
} from 'react-icons/fa';
import { OUTCOME_META } from '../../utils/offerHub';
import { formatCurrency, formatDate } from '../../utils/translations';

function messagePreview(text, max = 90) {
  if (!text) return null;
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max)}…`;
}

export default function OfferHubPreviewCard({ item, selected, onOpenDetails }) {
  const outcome = OUTCOME_META[item.outcome] || { label: item.outcome, cls: 'closed' };
  const response = item.tutorResponse;
  const preview = messagePreview(response?.message);
  const isPrivate = item.source === 'private';

  return (
    <article
      className={`ohub-preview ${item.source} ${outcome.cls} ${selected ? 'selected' : ''}`}
      onClick={() => onOpenDetails(item)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenDetails(item);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="ohub-preview-watermark" aria-hidden>
        {isPrivate ? <FaLock /> : <FaGlobe />}
      </div>

      <header className="ohub-preview-head">
        <span className={`ohub-preview-type ${item.source}`}>
          {isPrivate ? <><FaLock /> خاص</> : <><FaGlobe /> عام</>}
        </span>
        <span className={`ohub-outcome ${outcome.cls}`}>{outcome.short || outcome.label}</span>
      </header>

      <h3 className="ohub-preview-title">{item.title}</h3>

      <p className="ohub-preview-meta">
        {isPrivate ? item.studentName : 'طلب في السوق العام'}
        {item.subjectLabel && ` · ${item.subjectLabel}`}
      </p>

      <div className="ohub-preview-chips">
        <span><FaClock /> {formatDate(item.sortAt)}</span>
        {response?.proposedFee != null && (
          <span><FaMoneyBillWave /> {formatCurrency(response.proposedFee)}</span>
        )}
        {item.studentPhone && (
          <span className="ohub-preview-phone"><FaPhone /> {item.studentPhone}</span>
        )}
      </div>

      {preview && (
        <blockquote className="ohub-preview-quote">
          <FaPaperPlane /> {preview}
        </blockquote>
      )}

      <div className="ohub-preview-actions">
        <button
          type="button"
          className="ohub-btn-details"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails(item);
          }}
        >
          عرض التفاصيل <FaArrowLeft />
        </button>
      </div>
    </article>
  );
}
