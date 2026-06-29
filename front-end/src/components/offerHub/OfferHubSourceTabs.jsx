import { FaGlobe, FaInbox, FaLock } from 'react-icons/fa';

const ICONS = {
  all: FaInbox,
  private: FaLock,
  public: FaGlobe,
};

export default function OfferHubSourceTabs({ stats, activeSource, onChange }) {
  const tabs = [
    { value: '', label: 'الكل', count: stats.total, cls: 'all', icon: 'all' },
    { value: 'private', label: 'طلبات خاصة', count: stats.private, cls: 'private', icon: 'private' },
    { value: 'public', label: 'عروض عامة', count: stats.public, cls: 'public', icon: 'public' },
  ];

  return (
    <div className="ohub-source-tabs">
      {tabs.map((tab) => {
        const Icon = ICONS[tab.icon];
        return (
          <button
            key={tab.value || 'all'}
            type="button"
            className={`ohub-source-tab ${tab.cls} ${activeSource === tab.value ? 'active' : ''}`}
            onClick={() => onChange(tab.value)}
          >
            <span className="ohub-source-tab-icon"><Icon /></span>
            <span className="ohub-source-tab-text">
              <strong>{tab.label}</strong>
              <small>{tab.count} عنصر</small>
            </span>
          </button>
        );
      })}
    </div>
  );
}
