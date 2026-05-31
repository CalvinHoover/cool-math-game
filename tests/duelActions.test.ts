import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetSession = vi.hoisted(() => vi.fn());
const repository = vi.hoisted(() => ({
  fetchQuestionByDifficulty: vi.fn(),
  completeMatch: vi.fn(),
}));

vi.mock('@/features/auth/session', () => ({ getSession: mockGetSession }));
vi.mock('@/features/duel/duelRepository', () => ({ DuelRepository: repository }));

import { fetchMiningQuestion, fetchAttackQuestion, recordMatchResult } from '@/features/duel/duelActions';

const sessionUser = { id: 'user-1', username: 'alice', email: 'alice@example.com' };

const questionRecord = {
  id: 'q1',
  topicId: 'topic-1',
  text: '2 + 2',
  answer: '4',
  hint: null,
  difficulty: 1,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockGetSession.mockResolvedValue(sessionUser);
});

describe('fetchMiningQuestion', () => {
  it('returns unauthorized when no session', async () => {
    mockGetSession.mockResolvedValue(null);
    const result = await fetchMiningQuestion('topic-1');
    expect(result).toEqual({ ok: false, error: 'unauthorized' });
  });

  it('returns invalid-topic when topicId is empty', async () => {
    const result = await fetchMiningQuestion('');
    expect(result).toEqual({ ok: false, error: 'invalid-topic' });
  });

  it('returns no-question when DuelRepository returns null', async () => {
    repository.fetchQuestionByDifficulty.mockResolvedValue(null);
    const result = await fetchMiningQuestion('topic-1');
    expect(result).toEqual({ ok: false, error: 'no-question' });
  });

  it('returns ok with MathProblem when question found', async () => {
    repository.fetchQuestionByDifficulty.mockResolvedValue(questionRecord);
    const result = await fetchMiningQuestion('topic-1');
    expect(repository.fetchQuestionByDifficulty).toHaveBeenCalledWith('topic-1', 1);
    expect(result).toEqual({
      ok: true,
      questionId: 'q1',
      problem: { body: '2 + 2', correctAnswer: '4' },
    });
  });
});

describe('fetchAttackQuestion', () => {
  it('returns unauthorized when no session', async () => {
    mockGetSession.mockResolvedValue(null);
    const result = await fetchAttackQuestion('topic-1');
    expect(result).toEqual({ ok: false, error: 'unauthorized' });
  });

  it('returns invalid-topic when topicId is empty', async () => {
    const result = await fetchAttackQuestion('');
    expect(result).toEqual({ ok: false, error: 'invalid-topic' });
  });

  it('returns no-question when DuelRepository returns null', async () => {
    repository.fetchQuestionByDifficulty.mockResolvedValue(null);
    const result = await fetchAttackQuestion('topic-1');
    expect(result).toEqual({ ok: false, error: 'no-question' });
  });

  it('returns ok with MathProblem and calls with difficulty 2', async () => {
    repository.fetchQuestionByDifficulty.mockResolvedValue({ ...questionRecord, difficulty: 2 });
    const result = await fetchAttackQuestion('topic-1');
    expect(repository.fetchQuestionByDifficulty).toHaveBeenCalledWith('topic-1', 2);
    expect(result).toMatchObject({ ok: true, questionId: 'q1' });
  });
});

describe('recordMatchResult', () => {
  it('returns unauthorized when no session', async () => {
    mockGetSession.mockResolvedValue(null);
    const result = await recordMatchResult('match-1', 'user-1');
    expect(result).toEqual({ ok: false, error: 'unauthorized' });
  });

  it('returns error when matchId is empty', async () => {
    const result = await recordMatchResult('', 'user-1');
    expect(result).toEqual({ ok: false, error: 'invalid-input' });
  });

  it('returns error when winnerId is empty', async () => {
    const result = await recordMatchResult('match-1', '');
    expect(result).toEqual({ ok: false, error: 'invalid-input' });
  });

  it('calls DuelRepository.completeMatch with matchId and winnerId and returns ok', async () => {
    repository.completeMatch.mockResolvedValue(undefined);
    const result = await recordMatchResult('match-1', 'user-1');
    expect(repository.completeMatch).toHaveBeenCalledWith('match-1', 'user-1');
    expect(result).toEqual({ ok: true });
  });
});
