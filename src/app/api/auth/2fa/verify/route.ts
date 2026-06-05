import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  getPendingUserId,
  clearPendingCookie,
  setSessionCookie,
} from "@/features/auth/session";

export async function POST(req: NextRequest) {
  const { code } = await req.json();
  if (!code) {
    return NextResponse.json({ error: "Code required" }, { status: 400 });
  }

  // the pending_2fa cookie proves the user already passed the check!!!
  const userId = await getPendingUserId();
  if (!userId) {
    return NextResponse.json(
      { error: "Session expired. Please log in again." },
      { status: 401 }
    );
  }

  const record = await prisma.verificationCode.findFirst({
    where: {
      userId,
      type: "two_factor",
      used: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record || !(await bcrypt.compare(code, record.code))) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
  }

  // mark used so the code can never be replayed
  await prisma.verificationCode.update({
    where: { id: record.id },
    data: { used: true },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, email: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // clear the pending cookie and set the real session
  await clearPendingCookie();
  await setSessionCookie({ id: user.id, username: user.username, email: user.email });

  return NextResponse.json({ ok: true });
}
