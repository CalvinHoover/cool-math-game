import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/features/auth/session";

export async function POST(req: NextRequest) {
  const { email, code, newPassword } = await req.json();

  if (!email || !code || !newPassword) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  let user;
  try {
    user = await prisma.user.findUnique({ where: { email } });
  } catch {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  // use generic error message as to be secure
  if (!user) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
  }

  // find the most recent valid code for this user
  const record = await prisma.verificationCode.findFirst({
    where: {
      userId: user.id,
      type: "password_reset",
      used: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  // verify the code matches what we stored (as the hasj)
  if (!record || !(await bcrypt.compare(code, record.code))) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
  }

  // mrk code as used so it can never be replayed
  await prisma.verificationCode.update({
    where: { id: record.id },
    data: { used: true },
  });

  // update pw
  const newHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: newHash },
  });

//log in
  await setSessionCookie({ id: user.id, username: user.username, email: user.email });

  return NextResponse.json({ ok: true });
}
