import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/features/auth/session';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (!q) return NextResponse.json([]);

  const users = await prisma.user.findMany({
    where: {
      username: { contains: q, mode: 'insensitive' },
      id: { not: user.id },
    },
    select: { id: true, username: true },
    take: 10,
  });

  return NextResponse.json(users);
}