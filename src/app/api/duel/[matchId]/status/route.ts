// src/app/api/duel/[matchId]/status/route.ts
// GET /api/duel/[matchId]/status
// Returns the current match status. Player1 polls this while waiting for an opponent.
// Returns { status: string, opponentName?: string | null }

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/features/auth/session';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { matchId } = await params;

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return NextResponse.json({ error: 'Match not found' }, { status: 404 });

  // Only participants may query this
  if (match.player1Id !== user.id && match.player2Id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // If the match is active, figure out who the opponent is and grab their name
  let opponentName = null;
  if (match.status === 'active') {
    const opponentId = user.id === match.player1Id ? match.player2Id : match.player1Id;
    if (opponentId) {
      const opponent = await prisma.user.findUnique({ where: { id: opponentId } });
      opponentName = opponent?.username;
    }
  }

  return NextResponse.json({
    status:    match.status,
    opponentName
  });
}