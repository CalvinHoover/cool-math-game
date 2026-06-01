import { AchievementCard } from './AchievementCard';
import type { AchievementStatus } from '../engine';

interface AchievementGridProps {
  achievements: AchievementStatus[];
}

export function AchievementGrid({ achievements }: AchievementGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {achievements.map((a) => (
        <AchievementCard
          key={a.slug}
          name={a.name}
          description={a.description}
          color={a.color}
          earned={a.earned}
          earnedAt={a.earnedAt}
        />
      ))}
    </div>
  );
}
