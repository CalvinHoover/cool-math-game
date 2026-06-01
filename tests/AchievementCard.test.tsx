import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AchievementCard } from '@/features/achievements/components/AchievementCard';

describe('AchievementCard', () => {
  it('renders unlocked state with bright styling', () => {
    render(
      <AchievementCard
        name="First Steps"
        description="Complete your first practice session"
        color="bg-green-500"
        earned={true}
        earnedAt={new Date('2026-06-01')}
      />
    );

    expect(screen.getByText('First Steps')).toBeInTheDocument();
    expect(screen.getByText('Unlocked')).toBeInTheDocument();
  });

  it('renders locked state with muted styling', () => {
    render(
      <AchievementCard
        name="Dedicated Learner"
        description="Complete 10 practice sessions"
        color="bg-blue-500"
        earned={false}
      />
    );

    expect(screen.getByText('Dedicated Learner')).toBeInTheDocument();
    expect(screen.getByText('Locked')).toBeInTheDocument();
  });
});
