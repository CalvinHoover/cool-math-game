// src/app/api/duel/[matchId]/event/route.ts
// POST /api/duel/[matchId]/event
// Writes a game event. When the event is game_over, closes the match and updates ELO.

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/features/auth/session';
import { prisma } from '@/lib/prisma';
import { calculateElo } from '@/features/elo/calculate';

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

  // ── Game over: close match and update ELO ──────────────────────────────────
  if (type === 'game_over' && match.status !== 'finished') {
    // The sender's HP hit zero — they lost. The other player wins.
    const loserId  = user.id;
    const winnerId = match.player1Id === loserId ? match.player2Id : match.player1Id;

    await prisma.match.update({
      where: { id: matchId },
      data: {
        status:   'finished',
        winnerId: winnerId ?? undefined,
        endedAt:  new Date(),
      },
    });

    // Update ELO for both players if we have a valid winner
    if (winnerId) {
      const [winner, loser] = await Promise.all([
        prisma.user.findUnique({ where: { id: winnerId } }),
        prisma.user.findUnique({ where: { id: loserId  } }),
      ]);

      if (winner && loser) {
        const { newWinnerElo, newLoserElo } = calculateElo(winner.elo, loser.elo);

        await Promise.all([
          prisma.user.update({ where: { id: winnerId }, data: { elo: newWinnerElo } }),
          prisma.user.update({ where: { id: loserId  }, data: { elo: newLoserElo  } }),
        ]);

        console.log(
          `ELO updated — ${winner.username}: ${winner.elo} → ${newWinnerElo} | ` +
          `${loser.username}: ${loser.elo} → ${newLoserElo}`
        );
      }
    }
  }

  return NextResponse.json(event);
}
