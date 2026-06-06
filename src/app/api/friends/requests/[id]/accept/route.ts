import { NextResponse } from 'next/server';
import { getSession } from '@/features/auth/session';
import { prisma } from '@/lib/prisma';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const friendship = await prisma.friendship.findUnique({ where: { id } });
  if (!friendship || friendship.receiverId !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const updated = await prisma.friendship.update({
    where: { id },
    data: { status: 'accepted' },
  });

  return NextResponse.json(updated);
}
