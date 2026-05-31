import { NextResponse } from 'next/server';
import { getSession } from '@/features/auth/session';
import { FriendRepository } from '@/features/friends/friendRepository';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { userId } = await params;

  try {
    const removed = await FriendRepository.removeFriendship(session.id, userId);
    if (!removed) {
      return NextResponse.json({ error: 'not-friends' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Database unavailable. Try again shortly.' }, { status: 503 });
  }
}
