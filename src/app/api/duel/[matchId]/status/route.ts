// src/app/api/duel/[matchId]/status/route.ts
// GET /api/duel/[matchId]/status
// Returns the current match status. Player1 polls this while waiting for an opponent.

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

  return NextResponse.json({
    status:    match.status,
    player1Id: match.player1Id,
    player2Id: match.player2Id,
  });
}
