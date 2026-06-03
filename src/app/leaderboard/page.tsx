import { redirect } from 'next/navigation';
import { getSession } from '@/features/auth/session';
import { Leaderboard } from '@/features/elo/Leaderboard';

export default async function LeaderboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  return <Leaderboard />;
}
