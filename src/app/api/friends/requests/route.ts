import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/features/auth/session';
import { FriendRepository } from '@/features/friends/friendRepository';
import { notifyUser } from '@/features/notifications/server';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const requests = await FriendRepository.listIncomingRequests(session.id);
    return NextResponse.json({ requests });
  } catch {
    return NextResponse.json({ error: 'Database unavailable. Try again shortly.' }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { userId } = await req.json();
  if (!userId || typeof userId !== 'string') {
    return NextResponse.json({ error: 'invalid-input' }, { status: 400 });
  }

  try {
    const result = await FriendRepository.createRequest(session.id, userId);

    switch (result.status) {
      case 'self':
        return NextResponse.json({ error: 'cannot-friend-self' }, { status: 400 });
      case 'already-friends':
        return NextResponse.json({ error: 'already-friends' }, { status: 409 });
      case 'already-requested':
        return NextResponse.json({ error: 'already-requested' }, { status: 409 });
      case 'created': {
        const actor = await FriendRepository.getPublicProfile(session.id);
        if (actor) {
          await notifyUser(userId, { type: 'friend_request_received', fromUser: actor });
        }
        const request = await FriendRepository.getRequest(result.friendship.id);
        return NextResponse.json({ request });
      }
      case 'auto-accepted': {
        // The other user (result.otherUserId) had a pending request to us;
        // requesting them back accepts it, so notify THEM of acceptance.
        const actor = await FriendRepository.getPublicProfile(session.id);
        if (actor) {
          await notifyUser(result.otherUserId, { type: 'friend_request_accepted', byUser: actor });
        }
        const request = await FriendRepository.getRequest(result.friendship.id);
        return NextResponse.json({ request });
      }
    }
  } catch {
    return NextResponse.json({ error: 'Database unavailable. Try again shortly.' }, { status: 503 });
  }
}
