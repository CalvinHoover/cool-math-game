import { NextResponse } from 'next/server';
import { getSession } from '@/features/auth/session';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const requests = await prisma.friendship.findMany({
    where: { receiverId: user.id, status: 'pending' },
    include: {
      sender: { select: { id: true, username: true } },
    },
  });

  const formatted = requests.map((r) => ({
    id: r.id,
    fromUser: { id: r.sender.id, username: r.sender.username, level: 0 },
    toUser:   { id: user.id, username: user.username, level: 0 },
    status:   r.status,
    createdAt: r.createdAt.toISOString(),
  }));

  return NextResponse.json(formatted);
}
