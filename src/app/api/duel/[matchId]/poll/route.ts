// src/app/api/duel/[matchId]/poll/route.ts
// GET /api/duel/[matchId]/poll?since=<ISO timestamp>
// Returns all events newer than `since` that were NOT sent by the requesting user.
// The client updates its `since` value to the createdAt of the last received event.

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/features/auth/session';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { matchId } = await params;
  const since = req.nextUrl.searchParams.get('since');

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return NextResponse.json({ error: 'Match not found' }, { status: 404 });

  if (match.player1Id !== user.id && match.player2Id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const events = await prisma.duelEvent.findMany({
    where: {
      matchId,
      senderId:  { not: user.id },          // never echo back own events
      createdAt: since ? { gt: new Date(since) } : undefined,
    },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(events);
}
