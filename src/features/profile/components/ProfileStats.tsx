import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';

type ProfileStatsProps = {
  totalXp: number;
  globalLevel: number;
  currentLevelXp: number;
  nextLevelXp: number;
  practiceSessionsCompleted: number;
};

export default function ProfileStats({
  totalXp,
  globalLevel,
  currentLevelXp,
  nextLevelXp,
  practiceSessionsCompleted,
}: ProfileStatsProps) {
  return (
    <section className="border p-4 dark:border-gray-700">
      <h2 className="mb-4 text-xl font-semibold dark:text-gray-100">Profile Stats</h2>

      <div className="grid grid-cols-3 gap-4 text-gray-900 dark:text-gray-100">
        <Stat label="Level" value={globalLevel} badge={<Badge variant="info">Global</Badge>} />
        <Stat label="Total XP" value={totalXp} />
        <Stat label="Sessions" value={practiceSessionsCompleted} />
      </div>

      <div className="mt-4">
        <ProgressBar
          value={currentLevelXp}
          max={nextLevelXp}
          label="Next level progress"
        />
      </div>
    </section>
  );
}

type StatProps = {
  label: string;
  value: string | number;
  badge?: React.ReactNode;
};

function Stat({ label, value, badge }: StatProps) {
  return (
    <div className="rounded-md bg-gray-100 p-3 dark:bg-gray-800">
      <div className="flex items-center gap-2">
        <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
        {badge}
      </div>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}