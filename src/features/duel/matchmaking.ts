'use server';

import { createClient } from '@supabase/supabase-js';
import { getSession } from '@/features/auth/session';
import { DuelRepository } from './duelRepository';
import type { DuelEvent } from './messages';

export type MatchmakingResult =
  | { ok: true; status: 'matched'; matchId: string; opponentUsername: string }
  | { ok: true; status: 'waiting'; matchId: string }
  | { ok: false; error: string };

function makeMatch(waitingMatches: { id: string; player1Id: string; player1: { username: string } }[], requesterId: string) {
  return waitingMatches.find((m) => m.player1Id !== requesterId) ?? null;
}

async function serverBroadcast(channelName: string, event: DuelEvent): Promise<void> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const channel = supabase.channel(channelName);
  await new Promise<void>((resolve) => {
    channel.subscribe((status: string) => {
      if (status === 'SUBSCRIBED') {
        channel
          .send({ type: 'broadcast', event: 'duel', payload: event })
          .then(() => supabase.removeChannel(channel))
          .then(() => resolve())
          .catch(() => resolve());
      }
    });
  });
}

export async function joinMatchmakingQueue(): Promise<MatchmakingResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'unauthorized' };

  const waitingMatches = await DuelRepository.findWaitingMatches(session.id);
  const found = makeMatch(waitingMatches, session.id);

  if (found) {
    await DuelRepository.joinMatch(found.id, session.id);
    const opponentUsername = found.player1.username;

    await serverBroadcast(`match:${found.id}`, {
      type: 'match:start',
      opponent: session.username,
    });

    return {
      ok: true,
      status: 'matched',
      matchId: found.id,
      opponentUsername,
    };
  }

  const newMatch = await DuelRepository.createWaitingMatch(session.id);
  return { ok: true, status: 'waiting', matchId: newMatch.id };
}

export async function leaveMatchmakingQueue(
  matchId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'unauthorized' };

  const trimmed = matchId?.trim();
  if (!trimmed) return { ok: false, error: 'invalid-input' };

  await DuelRepository.abandonMatch(trimmed);
  return { ok: true };
}
