import { NextResponse } from "next/server";
import { getSession, clearSessionCookie } from "@/features/auth/session";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
