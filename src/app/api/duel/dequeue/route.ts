// src/app/api/duel/dequeue/route.ts
// POST /api/duel/dequeue
// Removes the current user from the matchmaking queue by deleting any of their 'waiting' matches.

import { NextResponse } from 'next/server';
import { getSession } from '@/features/auth/session';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Delete any match where the user is player1 and it's still waiting.
    // We use deleteMany to catch everything, just in case they refreshed the page
    // rapidly and somehow generated multiple ghost queue entries.
    await prisma.match.deleteMany({
      where: {
        player1Id: user.id,
        status:    'waiting',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error during dequeue:', error);
    return NextResponse.json({ error: 'Failed to dequeue' }, { status: 500 });
  }
}