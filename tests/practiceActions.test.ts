// [GenAI Use] Prompt: "My practice actions import prisma, auth session, three repositories, and the achievement engine. I need to test them without a real database or JWT secret. Show me how to mock everything with vitest vi.hoisted so the tests stay isolated. The practice action file practice/actions.ts is attached."
// [GenAI Use] LLM Response Start
import { beforeEach, describe, expect, it, vi } from 'vitest';

// mock auth and repositories to keep action tests isolated from io
const mockGetSession = vi.hoisted(() => vi.fn());
const mockPrismaUserTopicUpsert = vi.hoisted(() => vi.fn());
const mockPrismaUserTopicUpdate = vi.hoisted(() => vi.fn());
const repository = vi.hoisted(() => ({
  findActiveSession: vi.fn(),
  createSessionWithQuestions: vi.fn(),
  findSessionQuestionForUser: vi.fn(),
  updateSessionQuestion: vi.fn(),
  completeSession: vi.fn(),
  findSessionWithQuestions: vi.fn(),
}));
const questionRepo = vi.hoisted(() => ({
  findQuestions: vi.fn(),
  findAllTopics: vi.fn(),
}));
const mockAchievementRepo = vi.hoisted(() => ({
  getUserAchievements: vi.fn(),
  getAllAchievements: vi.fn(),
  awardAchievement: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    practiceSession: {
      count: vi.fn(),
    },
    userTopic: {
      findMany: vi.fn(),
      upsert: mockPrismaUserTopicUpsert,
      update: mockPrismaUserTopicUpdate,
    },
  },
}));
vi.mock('@/features/auth/session', () => ({
  getSession: mockGetSession,
}));

vi.mock('@/features/practice/repository', () => ({
  PracticeDBAccess: repository,
}));

vi.mock('@/features/questions/repository', () => ({
  QuestionDBAccess: questionRepo,
}));

vi.mock('@/features/achievements/repository', () => ({
  getUserAchievements: mockAchievementRepo.getUserAchievements,
  getAllAchievements: mockAchievementRepo.getAllAchievements,
  awardAchievement: mockAchievementRepo.awardAchievement,
}));
// [GenAI Use] LLM Response End
// [GenAI Use] Reflection: The mock ordering matters a lot. vitest evaluates hoisted mocks before imports, so the shape of each mock must exactly match the real exports. I had to debug this a few times.

import {
  bootstrapPracticeSession,
  completePracticeSession,
  verifyAnswer,
  getTopics,
} from '@/features/practice/actions';
import { prisma } from '@/lib/prisma';

const sessionUser = {
  id: 'user-1',
  username: 'test-user',
  email: 'test@example.com',
};

const questionRecord = {
  id: 'q1',
  topicId: 'topic-1',
  text: 'Question',
  answer: 'Paris',
  hint: 'hint text',
  explanation: 'explanation text',
  difficulty: 2,
};

const sessionQuestion = {
  id: 'sq1',
  sessionId: 'session-1',
  questionId: 'q1',
  userAnswer: null,
  correct: false,
  attempts: 0,
  question: questionRecord,
};

const sessionRecord = {
  id: 'session-1',
  userId: sessionUser.id,
  startedAt: new Date(),
  endedAt: null,
  completed: false,
  timeLimit: null,
  questions: [{ ...sessionQuestion, attempts: 1, correct: true }],
};

beforeEach(() => {
  vi.clearAllMocks();
  mockGetSession.mockResolvedValue(sessionUser);
  mockAchievementRepo.getUserAchievements.mockResolvedValue([]);
  mockAchievementRepo.getAllAchievements.mockResolvedValue([]);
  mockAchievementRepo.awardAchievement.mockResolvedValue(true);
  (prisma.practiceSession.count as ReturnType<typeof vi.fn>).mockResolvedValue(1);
  (prisma.userTopic.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
});

describe('bootstrapPracticeSession', () => {
  it('returns unauthorized when no session', async () => {
    mockGetSession.mockResolvedValue(null);
    const result = await bootstrapPracticeSession({ topicId: 'topic-1' });
    expect(result).toEqual({ ok: false, error: 'unauthorized' });
  });

  it('rejects empty topic', async () => {
    const result = await bootstrapPracticeSession({ topicId: '' });
    expect(result).toEqual({ ok: false, error: 'invalid-topic' });
  });

  it('returns no-questions when topic is empty', async () => {
    repository.findActiveSession.mockResolvedValue(null);
    questionRepo.findQuestions.mockResolvedValue([]);
    const result = await bootstrapPracticeSession({ topicId: 'topic-1' });
    expect(result).toEqual({ ok: false, error: 'no-questions' });
  });

  it('creates a new session when none exists', async () => {
    repository.findActiveSession.mockResolvedValue(null);
    questionRepo.findQuestions.mockResolvedValue([questionRecord]);
    repository.createSessionWithQuestions.mockResolvedValue(sessionRecord);

    const result = await bootstrapPracticeSession({ topicId: 'topic-1', count: 5 });

    expect(questionRepo.findQuestions).toHaveBeenCalledWith({
      topicId: 'topic-1',
      count: 5,
    });
    expect(repository.createSessionWithQuestions).toHaveBeenCalledWith(
      sessionUser.id,
      ['q1'],
      undefined
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.sessionId).toBe('session-1');
      expect(result.questions[0].points).toBe(2);
    }
  });

  it('resumes an active session', async () => {
    repository.findActiveSession.mockResolvedValue(sessionRecord);

    const result = await bootstrapPracticeSession({ topicId: 'topic-1' });

    expect(questionRepo.findQuestions).not.toHaveBeenCalled();
    expect(result.ok).toBe(true);
  });
});

describe('verifyAnswer', () => {
  it('returns unauthorized when no session', async () => {
    mockGetSession.mockResolvedValue(null);
    const result = await verifyAnswer({
      sessionId: 'session-1',
      questionId: 'q1',
      userAnswer: 'Paris',
    });
    expect(result).toEqual({ ok: false, error: 'unauthorized' });
  });

  it('returns invalid-input when data is missing', async () => {
    const result = await verifyAnswer({
      sessionId: 'session-1',
      questionId: '',
      userAnswer: 'Paris',
    });
    expect(result).toEqual({ ok: false, error: 'invalid-input' });
  });

  it('returns not-found when no question is found', async () => {
    repository.findSessionQuestionForUser.mockResolvedValue(null);
    const result = await verifyAnswer({
      sessionId: 'session-1',
      questionId: 'q1',
      userAnswer: 'Paris',
    });
    expect(result).toEqual({ ok: false, error: 'not-found' });
  });

  it('returns already-correct when question is already correct', async () => {
    repository.findSessionQuestionForUser.mockResolvedValue({
      ...sessionQuestion,
      correct: true,
    });
    const result = await verifyAnswer({
      sessionId: 'session-1',
      questionId: 'q1',
      userAnswer: 'Paris',
    });
    expect(result).toEqual({ ok: false, error: 'already-correct' });
  });

  it('returns max-attempts when attempts are exhausted', async () => {
    repository.findSessionQuestionForUser.mockResolvedValue({
      ...sessionQuestion,
      attempts: 2,
    });
    const result = await verifyAnswer({
      sessionId: 'session-1',
      questionId: 'q1',
      userAnswer: 'Paris',
    });
    expect(result).toEqual({ ok: false, error: 'max-attempts' });
  });

  it('marks correct answers and updates attempts', async () => {
    repository.findSessionQuestionForUser.mockResolvedValue({
      ...sessionQuestion,
      attempts: 0,
      correct: false,
    });

    const result = await verifyAnswer({
      sessionId: 'session-1',
      questionId: 'q1',
      userAnswer: 'Paris',
    });

    expect(repository.updateSessionQuestion).toHaveBeenCalledWith('sq1', {
      attempts: 1,
      userAnswer: 'Paris',
      correct: true,
    });
    expect(result).toEqual({
      ok: true,
      correct: true,
      attempts: 1,
      explanation: 'explanation text',
    });
  });

  it('returns hint after first incorrect attempt', async () => {
    repository.findSessionQuestionForUser.mockResolvedValue({
      ...sessionQuestion,
      attempts: 0,
      correct: false,
    });

    const result = await verifyAnswer({
      sessionId: 'session-1',
      questionId: 'q1',
      userAnswer: 'London',
    });

    expect(repository.updateSessionQuestion).toHaveBeenCalledWith('sq1', {
      attempts: 1,
      userAnswer: 'London',
      correct: false,
    });
    expect(result).toEqual({
      ok: true,
      correct: false,
      attempts: 1,
      explanation: 'hint text',
    });
  });

  it('returns answer after second incorrect attempt', async () => {
    repository.findSessionQuestionForUser.mockResolvedValue({
      ...sessionQuestion,
      attempts: 1,
      correct: false,
    });

    const result = await verifyAnswer({
      sessionId: 'session-1',
      questionId: 'q1',
      userAnswer: 'London',
    });

    expect(repository.updateSessionQuestion).toHaveBeenCalledWith('sq1', {
      attempts: 2,
      userAnswer: 'London',
      correct: false,
    });
    expect(result).toEqual({
      ok: true,
      correct: false,
      attempts: 2,
      answer: 'Paris',
      explanation: 'explanation text',
    });
  });
});

describe('completePracticeSession', () => {
  it('returns unauthorized when no session', async () => {
    mockGetSession.mockResolvedValue(null);
    const result = await completePracticeSession({ sessionId: 'session-1' });
    expect(result).toEqual({ ok: false, error: 'unauthorized' });
  });

  it('returns invalid-input when session id is missing', async () => {
    const result = await completePracticeSession({ sessionId: '' });
    expect(result).toEqual({ ok: false, error: 'invalid-input' });
  });

  it('returns not-found when no session is updated', async () => {
    repository.completeSession.mockResolvedValue({ count: 0 });
    const result = await completePracticeSession({ sessionId: 'session-1' });
    expect(result).toEqual({ ok: false, error: 'not-found' });
  });

  it('returns ok with xp when session is completed', async () => {
    repository.completeSession.mockResolvedValue({ count: 1 });
    repository.findSessionWithQuestions.mockResolvedValue(sessionRecord);
    mockPrismaUserTopicUpsert.mockResolvedValue({ id: 'ut1', userId: sessionUser.id, topicId: 'topic-1', xp: 2, level: 1 });

    const result = await completePracticeSession({ sessionId: 'session-1' });

    expect(result).toEqual({ ok: true, xpEarned: 2, totalXp: 2 });
    expect(repository.findSessionWithQuestions).toHaveBeenCalledWith('session-1', sessionUser.id);
    expect(mockPrismaUserTopicUpsert).toHaveBeenCalled();
  });

  it('returns newLevel when threshold is crossed', async () => {
    repository.completeSession.mockResolvedValue({ count: 1 });
    repository.findSessionWithQuestions.mockResolvedValue(sessionRecord);
    // user had level 2, now has 205 XP → level 3
    mockPrismaUserTopicUpsert.mockResolvedValue({ id: 'ut1', userId: sessionUser.id, topicId: 'topic-1', xp: 205, level: 2 });
    mockPrismaUserTopicUpdate.mockResolvedValue({});

    const result = await completePracticeSession({ sessionId: 'session-1' });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.xpEarned).toBe(2);
      expect(result.totalXp).toBe(205);
      expect(result.newLevel).toBe(3);
    }
  });

  it('does not return newLevel when no level-up occurs', async () => {
    repository.completeSession.mockResolvedValue({ count: 1 });
    repository.findSessionWithQuestions.mockResolvedValue(sessionRecord);
    // user had level 2, now has 150 XP → still level 2
    mockPrismaUserTopicUpsert.mockResolvedValue({ id: 'ut1', userId: sessionUser.id, topicId: 'topic-1', xp: 150, level: 2 });

    const result = await completePracticeSession({ sessionId: 'session-1' });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.xpEarned).toBe(2);
      expect(result.totalXp).toBe(150);
      expect(result.newLevel).toBeUndefined();
    }
  });

  it('returns newLevel for first-time topic level-up', async () => {
    repository.completeSession.mockResolvedValue({ count: 1 });
    repository.findSessionWithQuestions.mockResolvedValue(sessionRecord);
    // fresh topic, 100 XP → level 2
    mockPrismaUserTopicUpsert.mockResolvedValue({ id: 'ut2', userId: sessionUser.id, topicId: 'topic-1', xp: 100, level: 1 });
    mockPrismaUserTopicUpdate.mockResolvedValue({});

    const result = await completePracticeSession({ sessionId: 'session-1' });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.totalXp).toBe(100);
      expect(result.newLevel).toBe(2);
    }
  });

  it('returns newAchievements when achievement conditions are newly met', async () => {
    repository.completeSession.mockResolvedValue({ count: 1 });
    repository.findSessionWithQuestions.mockResolvedValue(sessionRecord);
    mockPrismaUserTopicUpsert.mockResolvedValue({ id: 'ut1', userId: sessionUser.id, topicId: 'topic-1', xp: 2, level: 1 });
    mockAchievementRepo.getUserAchievements.mockResolvedValue([]);
    mockAchievementRepo.getAllAchievements.mockResolvedValue([
      { id: 'a1', name: 'First Steps', description: '...', xpReward: 0 },
    ]);
    mockAchievementRepo.awardAchievement.mockResolvedValue(true);

    const result = await completePracticeSession({ sessionId: 'session-1' });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.newAchievements).toBeDefined();
      expect(result.newAchievements!.length).toBeGreaterThan(0);
      expect(result.newAchievements![0].slug).toBe('first-steps');
    }
  });
});

describe('getTopics', () => {
  it('returns unauthorized when no session', async () => {
    mockGetSession.mockResolvedValue(null);
    const result = await getTopics();
    expect(result).toEqual({ ok: false, error: 'unauthorized' });
  });

  it('returns topics when session exists', async () => {
    const topics = [
      { id: 't1', name: 'Algebra' },
      { id: 't2', name: 'Calculus' },
    ];
    questionRepo.findAllTopics = vi.fn().mockResolvedValue(topics);
    const result = await getTopics();
    expect(result).toEqual({ ok: true, topics });
  });
});
