// src/app/api/duel/matchmake/route.ts
// POST /api/duel/matchmake
// Finds an open waiting match and joins it, or creates a new one.
// Returns { matchId, role: 'player1' | 'player2' }

import { NextResponse } from 'next/server';
import { getSession } from '@/features/auth/session';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Look for a match that is still waiting and was created by someone else
  const waiting = await prisma.match.findFirst({
    where: {
      status:    'waiting',
      player2Id: null,
      player1Id: { not: user.id },
    },
  });

  if (waiting) {
    // Join the existing match as player2 and activate it
    await prisma.match.update({
      where: { id: waiting.id },
      data:  { player2Id: user.id, status: 'active' },
    });
    return NextResponse.json({ matchId: waiting.id, role: 'player2' });
  }

  // No open match — create one and wait for an opponent
  const match = await prisma.match.create({
    data: { player1Id: user.id, status: 'waiting' },
  });

  return NextResponse.json({ matchId: match.id, role: 'player1' });
}
