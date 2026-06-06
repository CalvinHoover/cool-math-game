import { AchievementCard } from './AchievementCard';
import type { AchievementStatus } from '../engine';

interface AchievementGridProps {
  achievements: AchievementStatus[];
}

export function AchievementGrid({ achievements }: AchievementGridProps) {
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '16px',
      justifyContent: 'center',
      width: '100%',
      maxWidth: '800px',
    }}>
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
