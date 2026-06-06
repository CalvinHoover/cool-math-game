import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/features/auth/session";
import { calculateElo } from "@/features/elo/calc";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { matchId, winnerId } = await req.json();
  if (!matchId || !winnerId) {
    return NextResponse.json({ error: "matchId and winnerId are required" }, { status: 400 });
  }

  let match;
  try {
    match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { player1: true, player2: true },
    });
  } catch {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });
  if (match.status === "completed") return NextResponse.json({ error: "Match already resolved" }, { status: 409 });

  if (!match.player1 || !match.player2 || !match.player2Id) {
    return NextResponse.json({ error: "Match does not have a valid opponent configuration" }, { status: 400 });
  }

  const p1won = winnerId === match.player1Id;
  const p1 = calculateElo(match.player1.elo, match.player2.elo, p1won ? 1 : 0);
  const p2 = calculateElo(match.player2.elo, match.player1.elo, p1won ? 0 : 1);

  try {
    await prisma.$transaction([
      prisma.user.update({ where: { id: match.player1Id }, data: { elo: p1.newElo } }),
      prisma.user.update({ where: { id: match.player2Id }, data: { elo: p2.newElo } }),
      prisma.match.update({
        where: { id: matchId },
        data: { winnerId, status: "completed", endedAt: new Date() },
      }),
    ]);
  } catch {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  return NextResponse.json({
    player1: { newElo: p1.newElo, delta: p1.delta },
    player2: { newElo: p2.newElo, delta: p2.delta },
  });
}