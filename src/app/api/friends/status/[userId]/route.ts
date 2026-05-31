import { NextResponse } from 'next/server';
import { getSession } from '@/features/auth/session';
import { FriendRepository } from '@/features/friends/friendRepository';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { userId } = await params;

  try {
    const status = await FriendRepository.getStatus(session.id, userId);
    return NextResponse.json({ status });
  } catch {
    return NextResponse.json({ error: 'Database unavailable. Try again shortly.' }, { status: 503 });
  }
}
