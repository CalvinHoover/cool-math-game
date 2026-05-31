import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/features/auth/session';
import { FriendRepository } from '@/features/friends/friendRepository';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const query = req.nextUrl.searchParams.get('q') ?? '';

  try {
    const users = await FriendRepository.searchUsers(query, session.id);
    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ error: 'Database unavailable. Try again shortly.' }, { status: 503 });
  }
}
