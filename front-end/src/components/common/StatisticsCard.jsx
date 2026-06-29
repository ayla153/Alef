import '../../styles/StatisticsCard.css';

export default function StatisticsCard({ title, subtitle, icon, count, bgcolor, hcolor, onClick }) {
  const displayCount = count === null || count === undefined ? '—' : count;

  return (
    <div
      className={`requests-card${onClick ? ' clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        {subtitle && <p className="card-subtitle">{subtitle}</p>}
        <p className="card-count">{displayCount}</p>
      </div>
      <div className="card-icon-wrapper" style={{ background: bgcolor, '--hover-color': hcolor }}>
        {icon}
      </div>
    </div>
  );
}
