import type { ProfileStats as ProfileStatsType } from "../types";

type ProfileStatsProps = {
  stats: ProfileStatsType;
};

export default function ProfileStats({ stats }: ProfileStatsProps) {
  return (
    <section className="profile-section">
      <h2>Profile Stats</h2>

      <div className="profile-stats-grid">
        <Stat label="Level" value={stats.level} />
        <Stat label="XP" value={stats.xp} />
        <Stat label="Games Completed" value={stats.gamesCompleted} />
      </div>

      <div className="profile-subsection">
        <h3>Recent Wins</h3>

        {stats.recentWins.length === 0 ? (
          <p>No recent wins yet.</p>
        ) : (
          <div className="profile-card-list">
            {stats.recentWins.map((win) => (
              <RecentWinCard key={win.gameId} win={win} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

type StatProps = {
  label: string;
  value: string | number;
};

function Stat({ label, value }: StatProps) {
  return (
    <div className="profile-card">
      <p className="profile-label">{label}</p>
      <p className="profile-value">{value}</p>
    </div>
  );
}

type RecentWinCardProps = {
  win: ProfileStatsType["recentWins"][number];
};

function RecentWinCard({ win }: RecentWinCardProps) {
  return (
    <div className="profile-card">
      <p className="profile-label">{win.topic}</p>
      <p className="profile-value">Level {win.gameLevel}</p>
      <p>{win.description}</p>
    </div>
  );
}