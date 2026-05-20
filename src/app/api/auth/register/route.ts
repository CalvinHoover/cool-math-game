import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { AuthDBAccess } from "@/features/auth/repository";
import { setSessionCookie } from "@/features/auth/session";

const MIN_PASSWORD_LENGTH = 6;

export async function POST(req: NextRequest) {
  const { username, email, password } = await req.json();

  if (!username || !email || !password) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
      { status: 400 }
    );
  }

  let existing;
  try {
    existing = AuthDBAccess.findUserByEmailOrUsername(email, username);
  } catch {
    return NextResponse.json({ error: "Database unavailable. Try again shortly." }, { status: 503 });
  }

  if (existing) {
    return NextResponse.json({ error: "Email or username already taken" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 12);

  let user;
  try {
    user = await AuthDBAccess.createUser({ username, email, password: hashed });
  } catch {
    return NextResponse.json({ error: "Database unavailable. Try again shortly." }, { status: 503 });
  }

  await setSessionCookie({ id: user.id, username: user.username, email: user.email });

  return NextResponse.json({ username: user.username, email: user.email }, { status: 201 });
}
