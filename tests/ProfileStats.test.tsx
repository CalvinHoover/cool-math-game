import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ProfileStats from '../src/features/profile/components/ProfileStats';

describe('ProfileStats', () => {
  it('renders level, XP and games completed', () => {
    render(
      <ProfileStats
        stats={{
          level: 3,
          xp: 250,
          gamesCompleted: 12,
          recentWins: [],
        }}
      />
    );

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('250')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('renders recent wins section', () => {
    render(
      <ProfileStats
        stats={{
          level: 3,
          xp: 250,
          gamesCompleted: 12,
          recentWins: [],
        }}
      />
    );

    expect(screen.getByText('Recent Wins')).toBeInTheDocument();
    expect(screen.getByText('No recent wins yet.')).toBeInTheDocument();
  });
});
