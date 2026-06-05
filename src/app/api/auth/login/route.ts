import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setSessionCookie, setPendingCookie } from "@/features/auth/session";
import { sendVerificationCode } from "@/lib/email";

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  let user;
  try {
    user = await prisma.user.findUnique({ where: { email } });
  } catch {
    return NextResponse.json(
      { error: "Database unavailable. Try again shortly." },
      { status: 503 }
    );
  }

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  // ── Optional 2FA ────────────────────────────────────────────────────────
  if (user.twoFactorEnabled) {
    // Clear any old unused 2FA codes first
    await prisma.verificationCode.deleteMany({
      where: { userId: user.id, type: "two_factor", used: false },
    });

    const code = generateCode();
    const hash = await bcrypt.hash(code, 8);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.verificationCode.create({
      data: { userId: user.id, code: hash, type: "two_factor", expiresAt },
    });

    await sendVerificationCode(user.email, code, "two_factor");
    await setPendingCookie(user.id);

    return NextResponse.json({ requires2FA: true });
  }

  // ── Normal login (2FA off) ───────────────────────────────────────────────
  await setSessionCookie({ id: user.id, username: user.username, email: user.email });
  return NextResponse.json({ username: user.username, email: user.email });
}
