export default function OfferHubStats({ stats, activeFilter, onFilterClick }) {
  const tiles = [
    { value: '', label: 'الكل', count: stats.total, cls: 'all' },
    { value: 'pending', label: 'معلّقة', count: stats.pending, cls: 'pending' },
    { value: 'contact_shared', label: 'تم التواصل', count: stats.shared, cls: 'shared' },
    { value: 'rejected', label: 'مرفوضة', count: stats.rejected, cls: 'rejected' },
    { value: 'closed', label: 'منتهية', count: stats.closed, cls: 'closed' },
  ];

  return (
    <div className="ohub-stats">
      {tiles.map((tile) => (
        <button
          key={tile.value || 'all'}
          type="button"
          className={`ohub-stat-tile ${tile.cls} ${activeFilter === tile.value ? 'active' : ''}`}
          onClick={() => onFilterClick(tile.value)}
        >
          <span className="ohub-stat-count">{tile.count}</span>
          <span className="ohub-stat-label">{tile.label}</span>
        </button>
      ))}
    </div>
  );
}
