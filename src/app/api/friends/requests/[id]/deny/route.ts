import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/features/auth/session';
import { prisma } from '@/lib/prisma';

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
    data: { status: 'denied' },
  });

  return NextResponse.json({
    id: updated.id,
    status: updated.status,
    createdAt: updated.createdAt.toISOString(),
  });
}
