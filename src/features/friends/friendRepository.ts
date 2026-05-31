import { prisma } from '@/lib/prisma';
import type { Friendship, User } from '@prisma/client';
import type { PublicProfile } from '../profile/types';
import type { Friend, FriendRequest, FriendStatus } from './types';

// No DB-backed user-wide level exists (User has elo/storyLine only),
// so we map storyLine -> level as a simple placeholder for PublicProfile.
function toPublicProfile(user: Pick<User, 'id' | 'username' | 'storyLine'>): PublicProfile {
  return {
    id: user.id,
    username: user.username,
    level: user.storyLine,
  };
}

const PUBLIC_USER_SELECT = { id: true, username: true, storyLine: true } as const;

export type CreateRequestResult =
  | { status: 'created'; friendship: Friendship }
  | { status: 'auto-accepted'; friendship: Friendship; otherUserId: string }
  | { status: 'already-friends' }
  | { status: 'already-requested' }
  | { status: 'self' };

export const FriendRepository = {
  // Accepted friendships in either direction; maps the OTHER party to a Friend.
  async listFriends(userId: string): Promise<Friend[]> {
    const rows = await prisma.friendship.findMany({
      where: {
        status: 'accepted',
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: { select: PUBLIC_USER_SELECT },
        receiver: { select: PUBLIC_USER_SELECT },
      },
    });

    return rows.map((row) => {
      const other = row.senderId === userId ? row.receiver : row.sender;
      return {
        profile: toPublicProfile(other),
        status: { isFriend: true, incomingRequest: false, outgoingRequest: false },
      };
    });
  },

  // Pending requests addressed TO this user.
  async listIncomingRequests(userId: string): Promise<FriendRequest[]> {
    const rows = await prisma.friendship.findMany({
      where: { status: 'pending', receiverId: userId },
      include: {
        sender: { select: PUBLIC_USER_SELECT },
        receiver: { select: PUBLIC_USER_SELECT },
      },
      orderBy: { createdAt: 'desc' },
    });

    return rows.map((row) => ({
      id: row.id,
      fromUser: toPublicProfile(row.sender),
      toUser: toPublicProfile(row.receiver),
      status: 'pending' as const,
      createdAt: row.createdAt.toISOString(),
    }));
  },

  // Finds a relationship between two users in EITHER direction.
  async findRelationship(a: string, b: string): Promise<Friendship | null> {
    return prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: a, receiverId: b },
          { senderId: b, receiverId: a },
        ],
      },
    });
  },

  // Handles the bidirectional edge case (see plan):
  // if B already requested A, A requesting B auto-accepts that request.
  async createRequest(senderId: string, receiverId: string): Promise<CreateRequestResult> {
    if (senderId === receiverId) return { status: 'self' };

    const existing = await this.findRelationship(senderId, receiverId);

    if (existing) {
      if (existing.status === 'accepted') return { status: 'already-friends' };

      // pending row exists
      if (existing.senderId === receiverId) {
        // B already requested A -> treat as acceptance
        const friendship = await prisma.friendship.update({
          where: { id: existing.id },
          data: { status: 'accepted' },
        });
        return { status: 'auto-accepted', friendship, otherUserId: receiverId };
      }
      // A already requested B
      return { status: 'already-requested' };
    }

    const friendship = await prisma.friendship.create({
      data: { senderId, receiverId, status: 'pending' },
    });
    return { status: 'created', friendship };
  },

  // Accepts a pending request; only the receiver may accept.
  async acceptRequest(requestId: string, actingUserId: string): Promise<Friendship | null> {
    const request = await prisma.friendship.findUnique({ where: { id: requestId } });
    if (!request || request.receiverId !== actingUserId || request.status !== 'pending') {
      return null;
    }
    return prisma.friendship.update({
      where: { id: requestId },
      data: { status: 'accepted' },
    });
  },

  // Denies (deletes) a pending request; only the receiver may deny.
  async denyRequest(requestId: string, actingUserId: string): Promise<Friendship | null> {
    const request = await prisma.friendship.findUnique({ where: { id: requestId } });
    if (!request || request.receiverId !== actingUserId || request.status !== 'pending') {
      return null;
    }
    await prisma.friendship.delete({ where: { id: requestId } });
    return request;
  },

  // Removes an accepted friendship in either direction.
  async removeFriendship(userId: string, otherUserId: string): Promise<boolean> {
    const result = await prisma.friendship.deleteMany({
      where: {
        status: 'accepted',
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
    });
    return result.count > 0;
  },

  // Derives the friend status of `targetId` relative to `viewerId`.
  async getStatus(viewerId: string, targetId: string): Promise<FriendStatus> {
    const relationship = await this.findRelationship(viewerId, targetId);
    if (!relationship) {
      return { isFriend: false, incomingRequest: false, outgoingRequest: false };
    }
    if (relationship.status === 'accepted') {
      return { isFriend: true, incomingRequest: false, outgoingRequest: false };
    }
    return {
      isFriend: false,
      incomingRequest: relationship.receiverId === viewerId,
      outgoingRequest: relationship.senderId === viewerId,
    };
  },

  // Serializes a friendship row (by id) into a FriendRequest response shape.
  async getRequest(requestId: string): Promise<FriendRequest | null> {
    const row = await prisma.friendship.findUnique({
      where: { id: requestId },
      include: {
        sender: { select: PUBLIC_USER_SELECT },
        receiver: { select: PUBLIC_USER_SELECT },
      },
    });
    if (!row) return null;
    return {
      id: row.id,
      fromUser: toPublicProfile(row.sender),
      toUser: toPublicProfile(row.receiver),
      status: row.status === 'accepted' ? 'accepted' : 'pending',
      createdAt: row.createdAt.toISOString(),
    };
  },

  // Public profile of a single user (used for broadcast payloads).
  async getPublicProfile(userId: string): Promise<PublicProfile | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: PUBLIC_USER_SELECT,
    });
    return user ? toPublicProfile(user) : null;
  },

  // Username search, excluding self.
  async searchUsers(query: string, viewerId: string, limit = 20): Promise<PublicProfile[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];
    const users = await prisma.user.findMany({
      where: {
        username: { contains: trimmed, mode: 'insensitive' },
        id: { not: viewerId },
      },
      select: PUBLIC_USER_SELECT,
      take: limit,
    });
    return users.map(toPublicProfile);
  },
};
