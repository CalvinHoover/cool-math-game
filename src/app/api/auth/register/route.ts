import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/features/auth/session";

export async function POST(req: NextRequest) {
  const { username, email, password } = await req.json();

  if (!username || !email || !password) {
    return NextResponse.json({ error: "Please complete all horses" }, { status: 400 });
  }//next responses have to have errors and statuses

  let existing;
  try {
    existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
  } catch {
    return NextResponse.json({ error: "Database unavailable. Try again shortly." }, { status: 503 });
  }

  if (existing) {
    return NextResponse.json({ error: "Email or username already taken" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 12);

  let user;
  try {
    user = await prisma.user.create({
      data: { username, email, password: hashed },
    });
  } catch {
    return NextResponse.json({ error: "Database unavailable. Try again shortly." }, { status: 503 });
  }

  await setSessionCookie({ id: user.id, username: user.username, email: user.email });

  return NextResponse.json({ username: user.username, email: user.email }, { status: 201 });
}
