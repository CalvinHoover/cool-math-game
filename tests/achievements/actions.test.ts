import { describe, expect, it, vi } from 'vitest';

const mockGetSession = vi.hoisted(() => vi.fn());
const mockGetAchievementStatus = vi.hoisted(() => vi.fn());

vi.mock('@/features/auth/session', () => ({
  getSession: mockGetSession,
}));

vi.mock('@/features/achievements/engine', () => ({
  getAchievementStatus: mockGetAchievementStatus,
}));

import { getMyAchievements } from '@/features/achievements/actions';

describe('getMyAchievements', () => {
  it('returns unauthorized when no session', async () => {
    mockGetSession.mockResolvedValue(null);

    const result = await getMyAchievements();

    expect(result).toEqual({ ok: false, error: 'unauthorized' });
  });

  it('returns achievements when authenticated', async () => {
    mockGetSession.mockResolvedValue({ id: 'user-1', username: 'test' });
    mockGetAchievementStatus.mockResolvedValue([
      { slug: 'first-steps', name: 'First Steps', description: '...', color: 'bg-green-500', iconName: 'footprints', earned: true },
      { slug: 'dedicated-learner', name: 'Dedicated Learner', description: '...', color: 'bg-blue-500', iconName: 'book-open', earned: false },
    ]);

    const result = await getMyAchievements();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.achievements).toHaveLength(2);
      expect(result.achievements[0].earned).toBe(true);
      expect(result.achievements[1].earned).toBe(false);
    }
  });
});
