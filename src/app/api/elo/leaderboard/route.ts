import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLeague } from "@/features/elo/leagues";

export async function GET() {
  let users;
  try {
    users = await prisma.user.findMany({
      orderBy: { elo: "desc" },
      take: 50,
      select: { username: true, elo: true },
    });
  } catch {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const leaderboard = users.map((user, i) => ({
    rank: i + 1,
    username: user.username,
    elo: user.elo,
    league: getLeague(user.elo),
  }));

  return NextResponse.json(leaderboard);
}
