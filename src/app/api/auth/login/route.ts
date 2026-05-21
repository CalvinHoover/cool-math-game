import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { AuthDBAccess } from "@/features/auth/repository";
import { setSessionCookie } from "@/features/auth/session";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  let user;
  try {
    user = await AuthDBAccess.findUserByEmail(email);
  } catch {
    return NextResponse.json({ error: "Database unavailable. Try again shortly." }, { status: 503 });
  }

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  await setSessionCookie({ id: user.id, username: user.username, email: user.email });

  return NextResponse.json({ username: user.username, email: user.email });
}
