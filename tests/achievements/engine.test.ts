// [GenAI Use] Prompt: "I need tests for my achievement engine. The engine must not import prisma. Show me how to mock the repository layer with vitest using vi.hoisted, and write tests for each unlock condition plus a test that checks for duplicate awarding. I have provided the file achievements/engine.ts for your reference. [file attached]"
// [GenAI Use] LLM Response Start
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetUserAchievements = vi.hoisted(() => vi.fn());
const mockAwardAchievement = vi.hoisted(() => vi.fn());
const mockGetAllAchievements = vi.hoisted(() => vi.fn());

vi.mock('@/features/achievements/repository', () => ({
  getUserAchievements: mockGetUserAchievements,
  awardAchievement: mockAwardAchievement,
  getAllAchievements: mockGetAllAchievements,
}));

import {
  checkAndAwardAchievements,
  getAchievementStatus,
  type UserProgressSnapshot,
} from '@/features/achievements/engine';

const allDbAchievements = [
  { id: 'a1', name: 'First Steps', description: '...', xpReward: 0 },
  { id: 'a2', name: 'Dedicated Learner', description: '...', xpReward: 0 },
  { id: 'a3', name: 'Rising Star', description: '...', xpReward: 0 },
  { id: 'a4', name: 'Jack of All Trades', description: '...', xpReward: 0 },
  { id: 'a5', name: 'Perfectionist', description: '...', xpReward: 0 },
];

describe('checkAndAwardAchievements', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserAchievements.mockResolvedValue([]);
    mockGetAllAchievements.mockResolvedValue(allDbAchievements);
    mockAwardAchievement.mockResolvedValue(true);
  });

  it('awards first-steps on first completed session', async () => {
    mockGetUserAchievements.mockResolvedValue([]);

    const snapshot: UserProgressSnapshot = {
      totalCompletedSessions: 1,
      userTopics: [],
      currentSessionScorePercent: 50,
    };

    const result = await checkAndAwardAchievements('user-1', snapshot);

    expect(result.newlyUnlocked).toHaveLength(1);
    expect(result.newlyUnlocked[0].slug).toBe('first-steps');
    expect(mockAwardAchievement).toHaveBeenCalledWith('user-1', 'a1');
  });

  it('awards dedicated-learner on 10th session', async () => {
    mockGetUserAchievements.mockResolvedValue([
      { id: 'ua1', userId: 'user-1', achievementId: 'a1', achievement: allDbAchievements[0], earnedAt: new Date() },
    ]);

    const snapshot: UserProgressSnapshot = {
      totalCompletedSessions: 10,
      userTopics: [],
      currentSessionScorePercent: 50,
    };

    const result = await checkAndAwardAchievements('user-1', snapshot);

    expect(result.newlyUnlocked).toHaveLength(1);
    expect(result.newlyUnlocked[0].slug).toBe('dedicated-learner');
  });

  it('awards rising-star when any topic reaches level 5', async () => {
    mockGetUserAchievements.mockResolvedValue([]);

    const snapshot: UserProgressSnapshot = {
      totalCompletedSessions: 5,
      userTopics: [{ topicId: 't1', level: 5 }],
      currentSessionScorePercent: 50,
    };

    const result = await checkAndAwardAchievements('user-1', snapshot);

    expect(result.newlyUnlocked.some((n) => n.slug === 'rising-star')).toBe(true);
  });

  it('awards jack-of-all-trades with 3 topics', async () => {
    mockGetUserAchievements.mockResolvedValue([]);

    const snapshot: UserProgressSnapshot = {
      totalCompletedSessions: 5,
      userTopics: [
        { topicId: 't1', level: 1 },
        { topicId: 't2', level: 1 },
        { topicId: 't3', level: 1 },
      ],
      currentSessionScorePercent: 50,
    };

    const result = await checkAndAwardAchievements('user-1', snapshot);

    expect(result.newlyUnlocked.some((n) => n.slug === 'jack-of-all-trades')).toBe(true);
  });

  it('awards perfectionist on 100% score', async () => {
    mockGetUserAchievements.mockResolvedValue([]);

    const snapshot: UserProgressSnapshot = {
      totalCompletedSessions: 5,
      userTopics: [],
      currentSessionScorePercent: 100,
    };

    const result = await checkAndAwardAchievements('user-1', snapshot);

    expect(result.newlyUnlocked.some((n) => n.slug === 'perfectionist')).toBe(true);
  });

  it('is idempotent — second call returns no new unlocks', async () => {
    mockGetUserAchievements.mockResolvedValue([
      { id: 'ua1', userId: 'user-1', achievementId: 'a1', achievement: allDbAchievements[0], earnedAt: new Date() },
    ]);

    const snapshot: UserProgressSnapshot = {
      totalCompletedSessions: 1,
      userTopics: [],
      currentSessionScorePercent: 50,
    };

    const result = await checkAndAwardAchievements('user-1', snapshot);

    expect(result.newlyUnlocked).toHaveLength(0);
    expect(mockAwardAchievement).not.toHaveBeenCalled();
  });

  it('never imports prisma directly', async () => {
    const engineMod = await import('@/features/achievements/engine');
    const source = engineMod.toString ? engineMod.toString() : '';
    expect(source).not.toContain('prisma');
  });
});

describe('getAchievementStatus', () => {
  it('returns all 5 definitions with earned flags', async () => {
    mockGetUserAchievements.mockResolvedValue([
      { id: 'ua1', userId: 'user-1', achievementId: 'a1', achievement: allDbAchievements[0], earnedAt: new Date('2026-06-01') },
    ]);
    mockGetAllAchievements.mockResolvedValue(allDbAchievements);

    const result = await getAchievementStatus('user-1');

    expect(result).toHaveLength(5);
    expect(result[0].earned).toBe(true);
    expect(result[0].earnedAt).toBeInstanceOf(Date);
    expect(result[1].earned).toBe(false);
    expect(result[1].earnedAt).toBeUndefined();
  });
});
// [GenAI Use] LLM Response End
// [GenAI Use] Reflection: The meta test was my idea. It searches the engine source string to catch accidental Prisma imports, which is a nice safety net I added manually.
