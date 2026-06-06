import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import type { SessionUser } from "./types";

const SECRET = process.env.JWT_SECRET!;
const COOKIE = "auth_token";
const PENDING_COOKIE = "pending_2fa";

export function signToken(user: SessionUser): string {
  return jwt.sign(user, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): SessionUser | null {
  try {
    const payload = jwt.verify(token, SECRET) as Record<string, unknown>;
    if (payload.scope === "pending_2fa") return null;
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function setSessionCookie(user: SessionUser): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE, signToken(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE);
}

// Pending 2FA

export async function setPendingCookie(userId: string): Promise<void> {
  const token = jwt.sign({ userId, scope: "pending_2fa" }, SECRET, {
    expiresIn: "5m",
  });
  const cookieStore = await cookies();
  cookieStore.set(PENDING_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 5,
  });
}

export async function getPendingUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(PENDING_COOKIE)?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, SECRET) as {
      userId: string;
      scope: string;
    };
    if (payload.scope !== "pending_2fa") return null;
    return payload.userId;
  } catch {
    return null;
  }
}

export async function clearPendingCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(PENDING_COOKIE);
}
