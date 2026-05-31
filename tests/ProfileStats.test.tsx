import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ProfileStats from '../src/features/profile/components/ProfileStats';

describe('ProfileStats', () => {
  it('renders level, XP and sessions', () => {
    render(
      <ProfileStats
        totalXp={250}
        globalLevel={3}
        currentLevelXp={50}
        nextLevelXp={100}
        practiceSessionsCompleted={12}
      />
    );

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('250')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Global')).toBeInTheDocument();
  });

  it('renders progress bar', () => {
    render(
      <ProfileStats
        totalXp={250}
        globalLevel={3}
        currentLevelXp={50}
        nextLevelXp={100}
        practiceSessionsCompleted={12}
      />
    );

    expect(screen.getByText('Next level progress')).toBeInTheDocument();
  });
});
