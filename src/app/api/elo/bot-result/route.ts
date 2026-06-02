import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/features/auth/session";
import { calculateElo } from "@/features/elo/calc";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { botElo, playerWon } = await req.json();
  if (botElo === undefined || playerWon === undefined) {
    return NextResponse.json({ error: "botElo and playerWon are required" }, { status: 400 });
  }

  let player;
  try {
    player = await prisma.user.findUnique({ where: { id: session.id }, select: { elo: true } });
  } catch {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  if (!player) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const result = calculateElo(player.elo, botElo, playerWon ? 1 : 0);

  try {
    await prisma.user.update({ where: { id: session.id }, data: { elo: result.newElo } });
  } catch {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  return NextResponse.json({ newElo: result.newElo, delta: result.delta });
}
