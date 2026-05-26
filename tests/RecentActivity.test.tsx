import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import RecentActivity from '@/app/dashboard/RecentActivity';
import type { ActivityItem } from '@/features/dashboard/actions';

describe('RecentActivity', () => {
  it('shows empty state when no items', () => {
    render(<RecentActivity items={[]} />);
    expect(screen.getByText('No activity yet. Start a practice session!')).toBeInTheDocument();
  });

  it('renders activity items with topic names', () => {
    const items: ActivityItem[] = [
      { id: '1', topic: 'Algebra', completedAt: '2026-05-01T10:00:00.000Z', scorePercent: 90 },
      { id: '2', topic: 'Calculus', completedAt: '2026-05-02T14:30:00.000Z', scorePercent: 60 },
    ];
    render(<RecentActivity items={items} />);
    expect(screen.getByText('Algebra')).toBeInTheDocument();
    expect(screen.getByText('Calculus')).toBeInTheDocument();
  });

  it('shows green badge for high scores', () => {
    const items: ActivityItem[] = [
      { id: '1', topic: 'Algebra', completedAt: '2026-05-01T10:00:00.000Z', scorePercent: 90 },
    ];
    render(<RecentActivity items={items} />);
    const badge = screen.getByText('90%');
    expect(badge).toHaveClass('bg-green-100');
  });

  it('shows yellow badge for medium scores', () => {
    const items: ActivityItem[] = [
      { id: '1', topic: 'Algebra', completedAt: '2026-05-01T10:00:00.000Z', scorePercent: 60 },
    ];
    render(<RecentActivity items={items} />);
    const badge = screen.getByText('60%');
    expect(badge).toHaveClass('bg-yellow-100');
  });

  it('shows red badge for low scores', () => {
    const items: ActivityItem[] = [
      { id: '1', topic: 'Algebra', completedAt: '2026-05-01T10:00:00.000Z', scorePercent: 30 },
    ];
    render(<RecentActivity items={items} />);
    const badge = screen.getByText('30%');
    expect(badge).toHaveClass('bg-red-100');
  });

  it('formats dates', () => {
    const items: ActivityItem[] = [
      { id: '1', topic: 'Algebra', completedAt: '2026-05-01T10:00:00.000Z', scorePercent: 90 },
    ];
    render(<RecentActivity items={items} />);
    const formatted = new Date('2026-05-01T10:00:00.000Z').toLocaleDateString();
    expect(screen.getByText(formatted)).toBeInTheDocument();
  });
});
