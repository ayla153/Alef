import { FaGlobe, FaLock } from 'react-icons/fa';
import OfferHubPreviewCard from './OfferHubPreviewCard';

const SECTION_META = {
  private: {
    title: 'طلبات خاصة — تم التواصل',
    hint: 'طلاب قبلوا التواصل وشاركوا أرقامهم معك',
    icon: FaLock,
    cls: 'private',
  },
  public: {
    title: 'عروض عامة — تم التواصل',
    hint: 'عروض قبلها الطالب وتم تبادل الأرقام',
    icon: FaGlobe,
    cls: 'public',
  },
};

const SENT_SECTION_META = {
  private: {
    title: 'ردود على طلبات خاصة',
    hint: 'رسائلك وعروضك على الطلبات المباشرة',
    icon: FaLock,
    cls: 'private',
  },
  public: {
    title: 'عروض على الطلبات العامة',
    hint: 'كل العروض التي قدمتها في السوق',
    icon: FaGlobe,
    cls: 'public',
  },
};

export default function OfferHubPreviewSection({
  source,
  items,
  activeKey,
  onOpenDetails,
  variant = 'contacts',
  emptyHidden = false,
}) {
  if (!items.length) return emptyHidden ? null : null;

  const meta = variant === 'sent' ? SENT_SECTION_META[source] : SECTION_META[source];
  const Icon = meta.icon;

  return (
    <section className={`ohub-section ohub-section-${meta.cls}`}>
      <header className="ohub-section-head">
        <div className="ohub-section-head-main">
          <span className="ohub-section-icon" aria-hidden>
            <Icon />
          </span>
          <div>
            <h3 className="ohub-section-title">{meta.title}</h3>
            <p className="ohub-section-hint">{meta.hint}</p>
          </div>
        </div>
        <span className="ohub-section-count">{items.length}</span>
      </header>

      <div className="ohub-preview-grid">
        {items.map((item) => (
          <OfferHubPreviewCard
            key={item.key}
            item={item}
            selected={activeKey === item.key}
            onOpenDetails={onOpenDetails}
          />
        ))}
      </div>
    </section>
  );
}
