import { NextResponse } from 'next/server';
import { getSession } from '@/features/auth/session';
import { prisma } from '@/lib/prisma';
import { getGlobalLevel } from '@/features/xp/leveling';

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const friendships = await prisma.friendship.findMany({
    where: {
      status: 'accepted',
      OR: [{ senderId: user.id }, { receiverId: user.id }],
    },
    include: {
      sender:   { select: { id: true, username: true, topics: { select: { xp: true } } } },
      receiver: { select: { id: true, username: true, topics: { select: { xp: true } } } },
    },
  });

  const friends = friendships.map((f) => {
    const other = f.senderId === user.id ? f.receiver : f.sender;
    return {
      profile: {
        id: other.id,
        username: other.username,
        level: getGlobalLevel(other.topics).level,
      },
      status: { isFriend: true, incomingRequest: false, outgoingRequest: false },
    };
  });

  return NextResponse.json(friends);
}
