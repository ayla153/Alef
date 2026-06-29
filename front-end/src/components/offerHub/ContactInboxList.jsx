import { FaGlobe, FaLock } from 'react-icons/fa';
import ContactInboxCard from './ContactInboxCard';

const SECTION_META = {
  private: {
    title: 'تواصل خاص',
    hint: null,
    icon: FaLock,
    cls: 'private',
  },
  public: {
    title: 'تواصل عام',
    hint: null,
    icon: FaGlobe,
    cls: 'public',
  },
};

export default function ContactInboxList({
  source,
  items,
  tutorPhone,
  focusLeadId,
}) {
  if (!items.length) return null;

  const meta = SECTION_META[source];
  const Icon = meta.icon;

  return (
    <section className={`inbox-section inbox-section-${meta.cls}`}>
      <header className="inbox-section-head">
        <div className="inbox-section-head-main">
          <span className="inbox-section-icon" aria-hidden><Icon /></span>
          <div>
            <h3 className="inbox-section-title">{meta.title}</h3>
            {meta.hint && <p className="inbox-section-hint">{meta.hint}</p>}
          </div>
        </div>
        <span className="inbox-section-count">{items.length}</span>
      </header>

      <div className="inbox-row-list">
        {items.map((item) => (
          <ContactInboxCard
            key={item.key}
            item={item}
            tutorPhone={tutorPhone}
            highlighted={focusLeadId != null && item.leadId === focusLeadId}
          />
        ))}
      </div>
    </section>
  );
}
