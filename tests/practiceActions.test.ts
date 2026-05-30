import { beforeEach, describe, expect, it, vi } from 'vitest';

// mock auth and repository to keep action tests isolated from io
const mockGetSession = vi.hoisted(() => vi.fn());
const repository = vi.hoisted(() => ({
  findActiveSession: vi.fn(),
  findQuestionsByTopic: vi.fn(),
  createSessionWithQuestions: vi.fn(),
  findSessionQuestionForUser: vi.fn(),
  updateSessionQuestion: vi.fn(),
  completeSession: vi.fn(),
}));

vi.mock('@/features/auth/session', () => ({
  getSession: mockGetSession,
}));

vi.mock('@/features/practice/repository', () => ({
  PracticeRepository: repository,
}));

import {
  bootstrapPracticeSession,
  completePracticeSession,
  verifyAnswer,
} from '@/features/practice/actions';

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
  hint: 'hint',
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
  questions: [sessionQuestion],
};

beforeEach(() => {
  vi.clearAllMocks();
  mockGetSession.mockResolvedValue(sessionUser);
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
    repository.findQuestionsByTopic.mockResolvedValue([]);
    const result = await bootstrapPracticeSession({ topicId: 'topic-1' });
    expect(result).toEqual({ ok: false, error: 'no-questions' });
  });

  it('creates a new session when none exists', async () => {
    repository.findActiveSession.mockResolvedValue(null);
    repository.findQuestionsByTopic.mockResolvedValue([questionRecord]);
    repository.createSessionWithQuestions.mockResolvedValue(sessionRecord);

    const result = await bootstrapPracticeSession({ topicId: 'topic-1', count: 5 });

    expect(repository.createSessionWithQuestions).toHaveBeenCalledWith(
      sessionUser.id,
      ['q1']
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

    expect(repository.findQuestionsByTopic).not.toHaveBeenCalled();
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
      explanation: 'hint',
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
      explanation: 'hint',
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

  it('returns ok when session is completed', async () => {
    repository.completeSession.mockResolvedValue({ count: 1 });
    const result = await completePracticeSession({ sessionId: 'session-1' });
    expect(result).toEqual({ ok: true });
  });
});
