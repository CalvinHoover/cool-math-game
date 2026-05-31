import { NextResponse } from 'next/server';
import { getSession } from '@/features/auth/session';
import { FriendRepository } from '@/features/friends/friendRepository';
import { notifyUser } from '@/features/notifications/server';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const accepted = await FriendRepository.acceptRequest(id, session.id);
    if (!accepted) {
      return NextResponse.json({ error: 'not-found' }, { status: 404 });
    }

    // Notify the original sender that we accepted their request.
    const actor = await FriendRepository.getPublicProfile(session.id);
    if (actor) {
      await notifyUser(accepted.senderId, { type: 'friend_request_accepted', byUser: actor });
    }

    const request = await FriendRepository.getRequest(accepted.id);
    return NextResponse.json({ request });
  } catch {
    return NextResponse.json({ error: 'Database unavailable. Try again shortly.' }, { status: 503 });
  }
}
