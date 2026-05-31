import { redirect } from 'next/navigation';
import { getSession } from '@/features/auth/session';
import { DuelRepository } from '@/features/duel/duelRepository';
import DuelBoard from '@/features/duel/DuelBoard';

type DuelMatchPageProps = {
  params: Promise<{ matchId: string }>;
};

export type DuelPageData =
  | { ok: true; matchId: string; username: string; opponentUsername: string }
  | { ok: false; redirect: string };

export async function loadDuelPageData(matchId: string): Promise<DuelPageData> {
  const session = await getSession();
  if (!session) return { ok: false, redirect: '/login' };

  const match = await DuelRepository.findMatch(matchId);
  if (!match) return { ok: false, redirect: '/dashboard' };

  const isPlayer1 = match.player1Id === session.id;
  const isPlayer2 = match.player2Id === session.id;

  if (!isPlayer1 && !isPlayer2) return { ok: false, redirect: '/dashboard' };

  const opponentUsername = isPlayer1
    ? (match.player2?.username ?? '')
    : match.player1.username;

  return {
    ok: true,
    matchId,
    username: session.username,
    opponentUsername,
  };
}

export default async function DuelMatchPage({ params }: DuelMatchPageProps) {
  const { matchId } = await params;
  const data = await loadDuelPageData(matchId);

  if (!data.ok) {
    redirect(data.redirect);
  }

  return <DuelBoard />;
}
