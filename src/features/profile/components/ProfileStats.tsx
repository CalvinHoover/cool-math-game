import type { ProfileStats as ProfileStatsType } from "../types.ts"

type ProfileStatsProps = {
    stats: ProfileStatsType;
  };

  export default function ProfileStats({ stats }: ProfileStatsProps) {
    return (
      <section className="border p-4">
        <h2 className="mb-4 text-xl font-semibold">Profile Stats</h2>
  
        <div className="grid grid-cols-3 gap-4">
          <Stat label="Level" value={stats.level} />
          <Stat label="XP" value={stats.xp} />
          <Stat label="Games Completed" value={stats.gamesCompleted} />
        </div>
  
        <div className="mt-6">
          <h3 className="mb-3 text-lg font-semibold">Recent Wins</h3>
  
          {stats.recentWins.length === 0 ? (
            <p className="text-sm text-gray-500">No recent wins yet.</p>
          ) : (
            <div className="space-y-3">
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
      <div className="rounded-md bg-gray-100 p-3">
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-lg font-bold">{value}</p>
      </div>
    );
  }

type RecentWinCardProps = {
    win: ProfileStatsType["recentWins"][number];
};

function RecentWinCard({ win }: RecentWinCardProps) {
    return (
    <div className="rounded-md border p-3">
      <p className="font-semibold">{win.topic}</p>
      <p className="text-sm text-gray-600">Level {win.gameLevel}</p>
      <p className="mt-1 text-sm">{win.description}</p>
    </div>
    )
}