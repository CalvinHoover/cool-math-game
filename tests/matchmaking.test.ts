import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetSession = vi.hoisted(() => vi.fn());
const repository = vi.hoisted(() => ({
  findWaitingMatches: vi.fn(),
  createWaitingMatch: vi.fn(),
  joinMatch: vi.fn(),
  abandonMatch: vi.fn(),
}));
const mockCreateClient = vi.hoisted(() => vi.fn());

vi.mock('@/features/auth/session', () => ({ getSession: mockGetSession }));
vi.mock('@/features/duel/duelRepository', () => ({ DuelRepository: repository }));
vi.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateClient,
}));

import { joinMatchmakingQueue, leaveMatchmakingQueue } from '@/features/duel/matchmaking';

const sessionUser = { id: 'user-1', username: 'alice', email: 'alice@example.com' };

const waitingMatch = {
  id: 'match-1',
  player1Id: 'user-2',
  player2Id: 'user-2',
  player1: { username: 'bob' },
  player2: null,
  status: 'waiting',
  winnerId: null,
  player1Score: null,
  player2Score: null,
  startedAt: new Date(),
  endedAt: null,
};

function makeSupabaseChannelMock() {
  const sendFn = vi.fn().mockResolvedValue(undefined);
  const removeChannelFn = vi.fn().mockResolvedValue(undefined);
  const subscribeFn = vi.fn().mockImplementation((cb: (s: string) => void) => {
    cb('SUBSCRIBED');
    return {};
  });
  const channelObj = { subscribe: subscribeFn, send: sendFn };
  mockCreateClient.mockReturnValue({
    channel: vi.fn().mockReturnValue(channelObj),
    removeChannel: removeChannelFn,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetSession.mockResolvedValue(sessionUser);
  makeSupabaseChannelMock();
});

describe('joinMatchmakingQueue', () => {
  it('returns unauthorized when no session', async () => {
    mockGetSession.mockResolvedValue(null);
    const result = await joinMatchmakingQueue();
    expect(result).toEqual({ ok: false, error: 'unauthorized' });
  });

  it('creates a waiting match and returns status "waiting" when no opponents are available', async () => {
    repository.findWaitingMatches.mockResolvedValue([]);
    repository.createWaitingMatch.mockResolvedValue({ id: 'match-new', player1Id: 'user-1' });

    const result = await joinMatchmakingQueue();

    expect(repository.findWaitingMatches).toHaveBeenCalledWith('user-1');
    expect(repository.createWaitingMatch).toHaveBeenCalledWith('user-1');
    expect(result).toEqual({ ok: true, status: 'waiting', matchId: 'match-new' });
  });

  it('joins an existing match and returns status "matched" when an opponent is waiting', async () => {
    repository.findWaitingMatches.mockResolvedValue([waitingMatch]);
    repository.joinMatch.mockResolvedValue({ ...waitingMatch, player2Id: 'user-1', status: 'active' });

    const result = await joinMatchmakingQueue();

    expect(repository.joinMatch).toHaveBeenCalledWith('match-1', 'user-1');
    expect(result).toMatchObject({ ok: true, status: 'matched', matchId: 'match-1', opponentUsername: 'bob' });
  });

  it('does not join the requester\'s own waiting match', async () => {
    const ownMatch = { ...waitingMatch, player1Id: 'user-1', player1: { username: 'alice' } };
    repository.findWaitingMatches.mockResolvedValue([ownMatch]);
    repository.createWaitingMatch.mockResolvedValue({ id: 'match-new', player1Id: 'user-1' });

    const result = await joinMatchmakingQueue();

    expect(repository.joinMatch).not.toHaveBeenCalled();
    expect(result).toMatchObject({ ok: true, status: 'waiting' });
  });
});

describe('leaveMatchmakingQueue', () => {
  it('returns unauthorized when no session', async () => {
    mockGetSession.mockResolvedValue(null);
    const result = await leaveMatchmakingQueue('match-1');
    expect(result).toEqual({ ok: false, error: 'unauthorized' });
  });

  it('calls abandonMatch with the given matchId and returns ok', async () => {
    repository.abandonMatch.mockResolvedValue(undefined);
    const result = await leaveMatchmakingQueue('match-1');
    expect(repository.abandonMatch).toHaveBeenCalledWith('match-1');
    expect(result).toEqual({ ok: true });
  });

  it('returns error when matchId is empty', async () => {
    const result = await leaveMatchmakingQueue('');
    expect(result).toEqual({ ok: false, error: 'invalid-input' });
  });
});
