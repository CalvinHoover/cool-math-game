import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetSession = vi.hoisted(() => vi.fn());
const repository = vi.hoisted(() => ({
  findMatch: vi.fn(),
}));

vi.mock('@/features/auth/session', () => ({ getSession: mockGetSession }));
vi.mock('@/features/duel/duelRepository', () => ({ DuelRepository: repository }));

import { loadDuelPageData } from '@/app/duel/[matchId]/page';

const sessionUser = { id: 'user-1', username: 'alice', email: 'alice@example.com' };

const matchRecord = {
  id: 'match-1',
  player1Id: 'user-1',
  player2Id: 'user-2',
  player1: { username: 'alice' },
  player2: { username: 'bob' },
  status: 'active',
  winnerId: null,
  player1Score: null,
  player2Score: null,
  startedAt: new Date(),
  endedAt: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockGetSession.mockResolvedValue(sessionUser);
});

describe('loadDuelPageData', () => {
  it('returns redirect to /login when no session', async () => {
    mockGetSession.mockResolvedValue(null);
    const result = await loadDuelPageData('match-1');
    expect(result).toEqual({ ok: false, redirect: '/login' });
  });

  it('returns redirect to /dashboard when match not found', async () => {
    repository.findMatch.mockResolvedValue(null);
    const result = await loadDuelPageData('match-1');
    expect(result).toEqual({ ok: false, redirect: '/dashboard' });
  });

  it('returns redirect to /dashboard when user is not a participant', async () => {
    repository.findMatch.mockResolvedValue({
      ...matchRecord,
      player1Id: 'user-99',
      player2Id: 'user-88',
    });
    const result = await loadDuelPageData('match-1');
    expect(result).toEqual({ ok: false, redirect: '/dashboard' });
  });

  it('returns ok with correct opponentUsername when user is player1', async () => {
    repository.findMatch.mockResolvedValue(matchRecord);
    const result = await loadDuelPageData('match-1');
    expect(result).toEqual({
      ok: true,
      matchId: 'match-1',
      username: 'alice',
      opponentUsername: 'bob',
    });
  });

  it('returns ok with correct opponentUsername when user is player2', async () => {
    mockGetSession.mockResolvedValue({ id: 'user-2', username: 'bob', email: 'bob@example.com' });
    repository.findMatch.mockResolvedValue(matchRecord);
    const result = await loadDuelPageData('match-1');
    expect(result).toEqual({
      ok: true,
      matchId: 'match-1',
      username: 'bob',
      opponentUsername: 'alice',
    });
  });
});
