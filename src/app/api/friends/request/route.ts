import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/features/auth/session';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { username } = await req.json();

  const target = await prisma.user.findUnique({ where: { username } });
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if (target.id === user.id) return NextResponse.json({ error: 'Cannot add yourself' }, { status: 400 });

  const friendship = await prisma.friendship.create({
    data: { senderId: user.id, receiverId: target.id },
  });

  return NextResponse.json(friendship, { status: 201 });
}