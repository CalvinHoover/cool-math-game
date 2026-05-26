import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardStats from '@/app/dashboard/DashboardStats';

describe('DashboardStats', () => {
  const defaultProps = {
    totalXp: 250,
    globalLevel: 3,
    currentLevelXp: 50,
    nextLevelXp: 100,
    practiceSessionsCompleted: 12,
    topicsStarted: 5,
  };

  it('renders total XP', () => {
    render(<DashboardStats {...defaultProps} />);
    expect(screen.getByText('250')).toBeInTheDocument();
  });

  it('renders level badge', () => {
    render(<DashboardStats {...defaultProps} />);
    expect(screen.getByText('Lvl 3')).toBeInTheDocument();
  });

  it('renders ProgressBar for XP progress', () => {
    render(<DashboardStats {...defaultProps} />);
    expect(screen.getByText('Next level')).toBeInTheDocument();
    expect(screen.getByText('50 / 100')).toBeInTheDocument();
  });

  it('renders topics started count', () => {
    render(<DashboardStats {...defaultProps} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders practice sessions count', () => {
    render(<DashboardStats {...defaultProps} />);
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('renders streak placeholder', () => {
    render(<DashboardStats {...defaultProps} />);
    expect(screen.getByText('--')).toBeInTheDocument();
    expect(screen.getByText('Coming soon')).toBeInTheDocument();
  });
});
