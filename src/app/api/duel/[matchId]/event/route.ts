// src/app/api/duel/[matchId]/event/route.ts
// POST /api/duel/[matchId]/event
// Body: { type: string, payload: object }
// Writes a game event that the opponent will pick up on their next poll.

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/features/auth/session';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { matchId } = await params;
  const { type, payload } = await req.json();

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return NextResponse.json({ error: 'Match not found' }, { status: 404 });

  if (match.player1Id !== user.id && match.player2Id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const event = await prisma.duelEvent.create({
    data: { matchId, senderId: user.id, type, payload },
  });

  // If this is a game_over event, close the match
  if (type === 'game_over') {
    await prisma.match.update({
      where: { id: matchId },
      data: {
        status:   'finished',
        winnerId: (payload as { winnerId?: string }).winnerId ?? null,
        endedAt:  new Date(),
      },
    });
  }

  return NextResponse.json(event);
}
