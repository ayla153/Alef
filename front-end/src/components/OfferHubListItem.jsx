import { FaGlobe, FaLock } from 'react-icons/fa';
import { OUTCOME_META } from '../utils/offerHub';
import '../styles/MyOffers.css';

export default function OfferHubListItem({ item, selected, onClick }) {
  const outcome = OUTCOME_META[item.outcome] || {
    label: item.outcome,
    cls: 'closed',
  };

  return (
    <button
      type="button"
      className={`ohub-list-item ${selected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="ohub-list-head">
        <span className={`ohub-source ${item.source}`}>
          {item.source === 'private' ? <FaLock /> : <FaGlobe />}
          {item.source === 'private' ? 'خاص' : 'عام'}
        </span>
        <span className={`ohub-outcome ${outcome.cls}`}>{outcome.label}</span>
      </div>
      <span className="ohub-list-title">{item.title}</span>
      {item.subjectLabel && (
        <span className="ohub-list-subject">{item.subjectLabel}</span>
      )}
      {item.studentPhone && (
        <span className="ohub-list-phone" dir="ltr">{item.studentPhone}</span>
      )}
    </button>
  );
}
