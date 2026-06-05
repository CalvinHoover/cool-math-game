import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendVerificationCode } from "@/lib/email";

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  // always return the same response so attackers can't tell if an email exists
  const ok = NextResponse.json({ ok: true });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return ok;

    // delete any existing unused reset codes
    await prisma.verificationCode.deleteMany({
      where: { userId: user.id, type: "password_reset", used: false },
    });

    const code = generateCode();
    const hash = await bcrypt.hash(code, 8);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.verificationCode.create({
      data: { userId: user.id, code: hash, type: "password_reset", expiresAt },
    });

    await sendVerificationCode(email, code, "password_reset");
  } catch (err) {
    console.error("forgot-password error:", err);
  }

  return ok;
}
