import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TopicProgress from '../src/features/profile/components/TopicProgress';

describe('TopicProgress', () => {
  it('shows empty state', () => {
    render(<TopicProgress topics={[]} />);
    expect(screen.getByText(/No topics started yet/)).toBeInTheDocument();
  });

  it('renders topic cards with progress', () => {
    render(
      <TopicProgress
        topics={[
          { topicName: 'Algebra', xp: 120, level: 2, currentLevelXp: 20, nextLevelXp: 100 },
          { topicName: 'Geometry', xp: 80, level: 1, currentLevelXp: 80, nextLevelXp: 100 },
        ]}
      />
    );

    expect(screen.getByText('Algebra')).toBeInTheDocument();
    expect(screen.getByText('Geometry')).toBeInTheDocument();
    expect(screen.getByText('Lvl 2')).toBeInTheDocument();
    expect(screen.getByText('120 XP')).toBeInTheDocument();
  });
});
