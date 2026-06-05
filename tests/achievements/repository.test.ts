import { describe, expect, it, vi } from 'vitest';

const mockCreate = vi.hoisted(() => vi.fn());
const mockFindMany = vi.hoisted(() => vi.fn());

vi.mock('@/lib/prisma', () => ({
  prisma: {
    userAchievement: {
      create: mockCreate,
      findMany: mockFindMany,
    },
    achievement: {
      findMany: vi.fn(),
    },
  },
}));

import {
  awardAchievement,
  getUserAchievements,
} from '@/features/achievements/repository';

describe('achievement repository', () => {
  it('awardAchievement creates a UserAchievement row', async () => {
    mockCreate.mockResolvedValue({ id: 'ua1' });

    const result = await awardAchievement('user-1', 'ach-1');

    expect(result).toBe(true);
    expect(mockCreate).toHaveBeenCalledWith({
      data: { userId: 'user-1', achievementId: 'ach-1' },
    });
  });

  it('awardAchievement returns false on duplicate', async () => {
    mockCreate.mockRejectedValue(new Error('duplicate'));

    const result = await awardAchievement('user-1', 'ach-1');

    expect(result).toBe(false);
  });

  it('getUserAchievements returns joined data', async () => {
    const rows = [
      {
        id: 'ua1',
        userId: 'user-1',
        achievementId: 'ach-1',
        earnedAt: new Date('2026-06-01'),
        achievement: { id: 'ach-1', name: 'First Steps', description: '...', xpReward: 0 },
      },
    ];
    mockFindMany.mockResolvedValue(rows);

    const result = await getUserAchievements('user-1');

    expect(result).toHaveLength(1);
    expect(result[0].achievement.name).toBe('First Steps');
  });
});
