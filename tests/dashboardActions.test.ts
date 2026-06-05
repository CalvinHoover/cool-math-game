import { describe, expect, it, vi } from 'vitest';
import { getDashboardStats, getRecentActivity } from '../src/features/dashboard/actions';

vi.mock('../src/lib/prisma', () => ({
  prisma: {
    userTopic: { findMany: vi.fn() },
    practiceSession: { count: vi.fn(), findMany: vi.fn() },
  },
}));

vi.mock('../src/features/auth/session', () => ({
  getSession: vi.fn(),
}));

vi.mock('../src/features/xp/leveling', () => ({
  getGlobalLevel: vi.fn(() => ({ level: 2, currentLevelXp: 50, nextLevelXp: 200 })),
}));

import { prisma } from '../src/lib/prisma';
import { getSession } from '../src/features/auth/session';

describe('dashboard actions', () => {
  it('getDashboardStats returns stats', async () => {
    (getSession as any).mockResolvedValue({ id: 1 });
    (prisma.userTopic.findMany as any).mockResolvedValue([
      { xp: 100, level: 1 },
      { xp: 50, level: 2 },
    ]);
    (prisma.practiceSession.count as any).mockResolvedValue(10);

    const stats = await getDashboardStats();
    expect(stats.ok).toBe(true);
    if (stats.ok) {
      expect(stats.totalXp).toBe(150);
      expect(stats.globalLevel).toBe(2);
      expect(stats.topicsStarted).toBe(2);
      expect(stats.practiceSessionsCompleted).toBe(10);
    }
  });

  it('getRecentActivity returns activity items', async () => {
    (getSession as any).mockResolvedValue({ id: 1 });
    (prisma.practiceSession.findMany as any).mockResolvedValue([
      {
        id: '1',
        startedAt: new Date('2026-05-30'),
        endedAt: new Date('2026-05-30'),
        questions: [
          { correct: true, attempts: 1, question: { difficulty: 2, topic: { name: 'Algebra' } } },
        ],
      },
    ]);

    const result = await getRecentActivity();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.items).toHaveLength(1);
      expect(result.items[0].topic).toBe('Algebra');
      expect(result.items[0].scorePercent).toBe(100);
    }
  });
});
