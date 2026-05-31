import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetSession = vi.hoisted(() => vi.fn());
const repository = vi.hoisted(() => ({
  listFriends: vi.fn(),
  listIncomingRequests: vi.fn(),
  createRequest: vi.fn(),
  acceptRequest: vi.fn(),
  denyRequest: vi.fn(),
  removeFriendship: vi.fn(),
  getStatus: vi.fn(),
  getRequest: vi.fn(),
  getPublicProfile: vi.fn(),
  searchUsers: vi.fn(),
}));
const mockNotifyUser = vi.hoisted(() => vi.fn());

vi.mock('@/features/auth/session', () => ({ getSession: mockGetSession }));
vi.mock('@/features/friends/friendRepository', () => ({ FriendRepository: repository }));
vi.mock('@/features/notifications/server', () => ({ notifyUser: mockNotifyUser }));

import { GET as getFriends } from '@/app/api/friends/route';
import { GET as getRequests, POST as postRequest } from '@/app/api/friends/requests/route';
import { POST as acceptRoute } from '@/app/api/friends/requests/[id]/accept/route';
import { GET as statusRoute } from '@/app/api/friends/status/[userId]/route';

const sessionUser = { id: 'user-1', username: 'alice', email: 'alice@example.com' };
const actorProfile = { id: 'user-1', username: 'alice', level: 1 };

function jsonRequest(body: unknown): Request {
  return new Request('http://localhost/api/friends/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetSession.mockResolvedValue(sessionUser);
  repository.getPublicProfile.mockResolvedValue(actorProfile);
  repository.getRequest.mockResolvedValue({ id: 'r1', status: 'pending' });
});

describe('GET /api/friends', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await getFriends();
    expect(res.status).toBe(401);
  });

  it('returns the friends list', async () => {
    repository.listFriends.mockResolvedValue([{ profile: { id: 'x' } }]);
    const res = await getFriends();
    const body = await res.json();
    expect(repository.listFriends).toHaveBeenCalledWith('user-1');
    expect(body.friends).toHaveLength(1);
  });
});

describe('POST /api/friends/requests', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await postRequest(jsonRequest({ userId: 'user-2' }) as never);
    expect(res.status).toBe(401);
  });

  it('returns 400 for missing userId', async () => {
    const res = await postRequest(jsonRequest({}) as never);
    expect(res.status).toBe(400);
  });

  it('broadcasts friend_request_received when a new request is created', async () => {
    repository.createRequest.mockResolvedValue({ status: 'created', friendship: { id: 'r1' } });
    await postRequest(jsonRequest({ userId: 'user-2' }) as never);
    expect(mockNotifyUser).toHaveBeenCalledWith('user-2', {
      type: 'friend_request_received',
      fromUser: actorProfile,
    });
  });

  it('broadcasts friend_request_accepted to the other user on auto-accept', async () => {
    repository.createRequest.mockResolvedValue({
      status: 'auto-accepted',
      friendship: { id: 'r1' },
      otherUserId: 'user-2',
    });
    await postRequest(jsonRequest({ userId: 'user-2' }) as never);
    expect(mockNotifyUser).toHaveBeenCalledWith('user-2', {
      type: 'friend_request_accepted',
      byUser: actorProfile,
    });
  });

  it('returns 409 when already friends and does not broadcast', async () => {
    repository.createRequest.mockResolvedValue({ status: 'already-friends' });
    const res = await postRequest(jsonRequest({ userId: 'user-2' }) as never);
    expect(res.status).toBe(409);
    expect(mockNotifyUser).not.toHaveBeenCalled();
  });
});

describe('POST /api/friends/requests/[id]/accept', () => {
  it('notifies the original sender on accept', async () => {
    repository.acceptRequest.mockResolvedValue({ id: 'r1', senderId: 'user-2' });
    const res = await acceptRoute({} as Request, { params: Promise.resolve({ id: 'r1' }) });
    expect(repository.acceptRequest).toHaveBeenCalledWith('r1', 'user-1');
    expect(mockNotifyUser).toHaveBeenCalledWith('user-2', {
      type: 'friend_request_accepted',
      byUser: actorProfile,
    });
    expect(res.status).toBe(200);
  });

  it('returns 404 when the request cannot be accepted', async () => {
    repository.acceptRequest.mockResolvedValue(null);
    const res = await acceptRoute({} as Request, { params: Promise.resolve({ id: 'r1' }) });
    expect(res.status).toBe(404);
    expect(mockNotifyUser).not.toHaveBeenCalled();
  });
});

describe('GET /api/friends/status/[userId]', () => {
  it('returns the derived status', async () => {
    repository.getStatus.mockResolvedValue({ isFriend: true, incomingRequest: false, outgoingRequest: false });
    const res = await statusRoute({} as Request, { params: Promise.resolve({ userId: 'user-2' }) });
    const body = await res.json();
    expect(repository.getStatus).toHaveBeenCalledWith('user-1', 'user-2');
    expect(body.status.isFriend).toBe(true);
  });
});

describe('GET /api/friends/requests', () => {
  it('returns incoming requests', async () => {
    repository.listIncomingRequests.mockResolvedValue([{ id: 'r1' }]);
    const res = await getRequests();
    const body = await res.json();
    expect(body.requests).toHaveLength(1);
  });
});
