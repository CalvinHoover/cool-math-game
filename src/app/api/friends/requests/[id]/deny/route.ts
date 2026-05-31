import { NextResponse } from 'next/server';
import { getSession } from '@/features/auth/session';
import { FriendRepository } from '@/features/friends/friendRepository';

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
    const denied = await FriendRepository.denyRequest(id, session.id);
    if (!denied) {
      return NextResponse.json({ error: 'not-found' }, { status: 404 });
    }
    // Row is deleted; return a denied-shaped response from the captured row.
    return NextResponse.json({
      request: {
        id: denied.id,
        status: 'denied',
        createdAt: denied.createdAt.toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Database unavailable. Try again shortly.' }, { status: 503 });
  }
}
