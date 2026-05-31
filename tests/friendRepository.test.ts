import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  friendship: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
  user: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
}));

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));

import { FriendRepository } from '@/features/friends/friendRepository';

const userA = 'user-a';
const userB = 'user-b';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('FriendRepository.createRequest — bidirectional edge case', () => {
  it('returns "self" when sender equals receiver', async () => {
    const result = await FriendRepository.createRequest(userA, userA);
    expect(result).toEqual({ status: 'self' });
    expect(prismaMock.friendship.findFirst).not.toHaveBeenCalled();
  });

  it('returns "already-friends" when an accepted row exists', async () => {
    prismaMock.friendship.findFirst.mockResolvedValue({
      id: 'f1', senderId: userB, receiverId: userA, status: 'accepted',
    });
    const result = await FriendRepository.createRequest(userA, userB);
    expect(result).toEqual({ status: 'already-friends' });
  });

  it('auto-accepts when the receiver already sent a pending request', async () => {
    prismaMock.friendship.findFirst.mockResolvedValue({
      id: 'f1', senderId: userB, receiverId: userA, status: 'pending',
    });
    prismaMock.friendship.update.mockResolvedValue({
      id: 'f1', senderId: userB, receiverId: userA, status: 'accepted',
    });

    const result = await FriendRepository.createRequest(userA, userB);

    expect(prismaMock.friendship.update).toHaveBeenCalledWith({
      where: { id: 'f1' },
      data: { status: 'accepted' },
    });
    expect(result).toMatchObject({ status: 'auto-accepted', otherUserId: userB });
  });

  it('returns "already-requested" when the sender already has a pending row', async () => {
    prismaMock.friendship.findFirst.mockResolvedValue({
      id: 'f1', senderId: userA, receiverId: userB, status: 'pending',
    });
    const result = await FriendRepository.createRequest(userA, userB);
    expect(result).toEqual({ status: 'already-requested' });
    expect(prismaMock.friendship.create).not.toHaveBeenCalled();
  });

  it('creates a new pending request when no relationship exists', async () => {
    prismaMock.friendship.findFirst.mockResolvedValue(null);
    prismaMock.friendship.create.mockResolvedValue({
      id: 'f-new', senderId: userA, receiverId: userB, status: 'pending',
    });

    const result = await FriendRepository.createRequest(userA, userB);

    expect(prismaMock.friendship.create).toHaveBeenCalledWith({
      data: { senderId: userA, receiverId: userB, status: 'pending' },
    });
    expect(result).toMatchObject({ status: 'created' });
  });
});

describe('FriendRepository.getStatus', () => {
  it('reports no relationship', async () => {
    prismaMock.friendship.findFirst.mockResolvedValue(null);
    const status = await FriendRepository.getStatus(userA, userB);
    expect(status).toEqual({ isFriend: false, incomingRequest: false, outgoingRequest: false });
  });

  it('reports isFriend when accepted', async () => {
    prismaMock.friendship.findFirst.mockResolvedValue({
      id: 'f1', senderId: userA, receiverId: userB, status: 'accepted',
    });
    const status = await FriendRepository.getStatus(userA, userB);
    expect(status).toEqual({ isFriend: true, incomingRequest: false, outgoingRequest: false });
  });

  it('reports outgoingRequest when viewer is the pending sender', async () => {
    prismaMock.friendship.findFirst.mockResolvedValue({
      id: 'f1', senderId: userA, receiverId: userB, status: 'pending',
    });
    const status = await FriendRepository.getStatus(userA, userB);
    expect(status).toEqual({ isFriend: false, incomingRequest: false, outgoingRequest: true });
  });

  it('reports incomingRequest when viewer is the pending receiver', async () => {
    prismaMock.friendship.findFirst.mockResolvedValue({
      id: 'f1', senderId: userB, receiverId: userA, status: 'pending',
    });
    const status = await FriendRepository.getStatus(userA, userB);
    expect(status).toEqual({ isFriend: false, incomingRequest: true, outgoingRequest: false });
  });
});

describe('FriendRepository accept/deny authorization', () => {
  it('acceptRequest returns null when acting user is not the receiver', async () => {
    prismaMock.friendship.findUnique.mockResolvedValue({
      id: 'f1', senderId: userA, receiverId: userB, status: 'pending',
    });
    const result = await FriendRepository.acceptRequest('f1', userA);
    expect(result).toBeNull();
    expect(prismaMock.friendship.update).not.toHaveBeenCalled();
  });

  it('acceptRequest updates when acting user is the receiver', async () => {
    prismaMock.friendship.findUnique.mockResolvedValue({
      id: 'f1', senderId: userA, receiverId: userB, status: 'pending',
    });
    prismaMock.friendship.update.mockResolvedValue({
      id: 'f1', senderId: userA, receiverId: userB, status: 'accepted',
    });
    const result = await FriendRepository.acceptRequest('f1', userB);
    expect(result).toMatchObject({ status: 'accepted' });
  });

  it('denyRequest deletes when acting user is the receiver', async () => {
    prismaMock.friendship.findUnique.mockResolvedValue({
      id: 'f1', senderId: userA, receiverId: userB, status: 'pending',
    });
    prismaMock.friendship.delete.mockResolvedValue({});
    const result = await FriendRepository.denyRequest('f1', userB);
    expect(prismaMock.friendship.delete).toHaveBeenCalledWith({ where: { id: 'f1' } });
    expect(result).not.toBeNull();
  });

  it('denyRequest returns null when not the receiver', async () => {
    prismaMock.friendship.findUnique.mockResolvedValue({
      id: 'f1', senderId: userA, receiverId: userB, status: 'pending',
    });
    const result = await FriendRepository.denyRequest('f1', userA);
    expect(result).toBeNull();
    expect(prismaMock.friendship.delete).not.toHaveBeenCalled();
  });
});

describe('FriendRepository.removeFriendship', () => {
  it('returns true when a row was deleted', async () => {
    prismaMock.friendship.deleteMany.mockResolvedValue({ count: 1 });
    expect(await FriendRepository.removeFriendship(userA, userB)).toBe(true);
  });

  it('returns false when nothing was deleted', async () => {
    prismaMock.friendship.deleteMany.mockResolvedValue({ count: 0 });
    expect(await FriendRepository.removeFriendship(userA, userB)).toBe(false);
  });
});

describe('FriendRepository.listFriends', () => {
  it('maps the OTHER party to a Friend with placeholder level from storyLine', async () => {
    prismaMock.friendship.findMany.mockResolvedValue([
      {
        senderId: userA,
        receiverId: userB,
        sender: { id: userA, username: 'alice', storyLine: 3 },
        receiver: { id: userB, username: 'bob', storyLine: 7 },
      },
    ]);
    const friends = await FriendRepository.listFriends(userA);
    expect(friends).toEqual([
      {
        profile: { id: userB, username: 'bob', level: 7 },
        status: { isFriend: true, incomingRequest: false, outgoingRequest: false },
      },
    ]);
  });
});

describe('FriendRepository.searchUsers', () => {
  it('returns empty array for blank query without hitting the DB', async () => {
    const users = await FriendRepository.searchUsers('   ', userA);
    expect(users).toEqual([]);
    expect(prismaMock.user.findMany).not.toHaveBeenCalled();
  });

  it('excludes self and maps to PublicProfile', async () => {
    prismaMock.user.findMany.mockResolvedValue([
      { id: userB, username: 'bob', storyLine: 2 },
    ]);
    const users = await FriendRepository.searchUsers('bo', userA);
    expect(prismaMock.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ id: { not: userA } }) })
    );
    expect(users).toEqual([{ id: userB, username: 'bob', level: 2 }]);
  });
});
