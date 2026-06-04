// src/app/api/profile/[username]/matches/route.ts
// GET /api/profile/[username]/matches
// Returns the last 20 finished matches for the given user, formatted as PastMatch[].

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { PastMatch } from '@/features/profile/types';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const matches = await prisma.match.findMany({
    where: {
      OR: [{ player1Id: user.id }, { player2Id: user.id }],
      status: 'finished',
    },
    include: {
      player1: { select: { username: true } },
      player2: { select: { username: true } },
      winner:  { select: { username: true } },
    },
    orderBy: { endedAt: 'desc' },
    take: 20,
  });

  const formatted: PastMatch[] = matches.map((match, index) => {
    const opponentUsername =
      match.player1Id === user.id
        ? (match.player2?.username ?? 'Unknown')
        : match.player1.username;

    return {
      id:          index + 1,
      level:       1,
      topic:       'Math Duel',
      opponent:    opponentUsername,
      result:      match.winnerId === user.id ? 'Won' : 'Lost',
      completedOn: match.endedAt
        ? new Date(match.endedAt).toLocaleDateString()
        : '—',
    };
  });

  return NextResponse.json(formatted);
}
