import StatCard from "./StatCard";

function StatsRow({ stats }) {
  return (
    <section className="stats-row">
      {stats.map((stat, index) => (
        <StatCard key={index} stat={stat} />
      ))}
    </section>
  );
}

export default StatsRow;