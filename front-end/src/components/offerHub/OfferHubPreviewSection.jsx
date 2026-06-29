import { FaGlobe, FaLock } from 'react-icons/fa';
import OfferHubPreviewCard from './OfferHubPreviewCard';

const SECTION_META = {
  private: {
    title: 'طلبات خاصة',
    hint: 'طلاب تواصلوا معك مباشرة — معاينة سريعة ثم التفاصيل الكاملة',
    icon: FaLock,
    cls: 'private',
  },
  public: {
    title: 'عروض على الطلبات العامة',
    hint: 'عروضك في السوق العام — تابع حالة كل عرض',
    icon: FaGlobe,
    cls: 'public',
  },
};

export default function OfferHubPreviewSection({
  source,
  items,
  activeKey,
  onOpenDetails,
}) {
  if (!items.length) return null;

  const meta = SECTION_META[source];
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
