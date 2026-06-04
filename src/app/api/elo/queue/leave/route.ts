import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/features/auth/session";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await prisma.matchQueue.deleteMany({ where: { userId: session.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}
