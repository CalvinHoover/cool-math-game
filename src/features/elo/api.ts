import type { LeaderboardEntry } from './types';

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await fetch('/api/elo/leaderboard');
  if (!res.ok) throw new Error('Failed to fetch leaderboard');
  return res.json();
}

export async function joinQueue(): Promise<{ matched: boolean; matchId?: string }> {
  const res = await fetch('/api/elo/queue/join', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to join queue');
  return res.json();
}

export async function leaveQueue(): Promise<void> {
  await fetch('/api/elo/queue/leave', { method: 'POST' });
}
