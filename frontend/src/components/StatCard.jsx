export default function StatCard({ title, value, accent, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-card__icon" style={{ background: accent }}>
        {icon}
      </div>
      <div>
        <p>{title}</p>
        <h3>{value}</h3>
      </div>
    </div>
  );
}
