import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/features/auth/session";

const ELO_RANGE = 200;

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { id: true, elo: true },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const opponent = await prisma.matchQueue.findFirst({
      where: {
        userId: { not: user.id },
        elo: { gte: user.elo - ELO_RANGE, lte: user.elo + ELO_RANGE },
      },
      orderBy: { joinedAt: "asc" },
    });

    if (opponent) {
      const match = await prisma.$transaction(async (tx) => {
        const newMatch = await tx.match.create({
          data: { player1Id: opponent.userId, player2Id: user.id, status: "active" },
        });
        await tx.matchQueue.delete({ where: { id: opponent.id } });
        await tx.matchQueue.deleteMany({ where: { userId: user.id } });
        return newMatch;
      });
      return NextResponse.json({ matched: true, matchId: match.id });
    }

    await prisma.matchQueue.upsert({
      where: { userId: user.id },
      update: { elo: user.elo, joinedAt: new Date() },
      create: { userId: user.id, elo: user.elo },
    });

    return NextResponse.json({ matched: false });
  } catch {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}
