import { NextResponse } from 'next/server';
import { getSession } from '@/features/auth/session';
import { FriendRepository } from '@/features/friends/friendRepository';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const friends = await FriendRepository.listFriends(session.id);
    return NextResponse.json({ friends });
  } catch {
    return NextResponse.json({ error: 'Database unavailable. Try again shortly.' }, { status: 503 });
  }
}
