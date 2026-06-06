import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/features/auth/session';
import { prisma } from '@/lib/prisma';
import { getGlobalLevel } from '@/features/xp/leveling';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const friendship = await prisma.friendship.findUnique({ where: { id } });
  if (!friendship) return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  if (friendship.receiverId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (friendship.status !== 'pending') return NextResponse.json({ error: 'Already responded' }, { status: 400 });

  const updated = await prisma.friendship.update({
    where: { id },
    data: { status: 'accepted' },
    include: {
      sender: { select: { id: true, username: true, topics: { select: { xp: true } } } },
    },
  });

  return NextResponse.json({
    profile: {
      id: updated.sender.id,
      username: updated.sender.username,
      level: getGlobalLevel(updated.sender.topics).level,
    },
    status: { isFriend: true, incomingRequest: false, outgoingRequest: false },
  });
}
