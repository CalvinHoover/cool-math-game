import { NextResponse } from "next/server";
import { getSession } from "@/features/auth/session";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { twoFactorEnabled: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const updated = await prisma.user.update({
    where: { id: session.id },
    data: { twoFactorEnabled: !user.twoFactorEnabled },
    select: { twoFactorEnabled: true },
  });

  return NextResponse.json({ twoFactorEnabled: updated.twoFactorEnabled });
}
