import { NextResponse } from 'next/server';
import { getSession } from '@/features/auth/session';
import { prisma } from '@/lib/prisma';
import { getGlobalLevel } from '@/features/xp/leveling';

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const requests = await prisma.friendship.findMany({
    where: { receiverId: user.id, status: 'pending' },
    include: {
      sender: { select: { id: true, username: true, topics: { select: { xp: true } } } },
      receiver: { select: { id: true, username: true, topics: { select: { xp: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const result = requests.map((r) => ({
    id: r.id,
    fromUser: {
      id: r.sender.id,
      username: r.sender.username,
      level: getGlobalLevel(r.sender.topics).level,
    },
    toUser: {
      id: r.receiver.id,
      username: r.receiver.username,
      level: getGlobalLevel(r.receiver.topics).level,
    },
    status: r.status as 'pending',
    createdAt: r.createdAt.toISOString(),
  }));

  return NextResponse.json(result);
}
