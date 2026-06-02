import { redirect } from 'next/navigation';
import { getSession } from '@/features/auth/session';
import { prisma } from '@/lib/prisma';
import DuelClient from './DuelClient';

export default async function DuelPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  let elo = 1000;
  try {
    const user = await prisma.user.findUnique({ where: { id: session.id }, select: { elo: true } });
    if (user) elo = user.elo;
  } catch {
    // DB unavailable — default ELO, game still works
  }

  return <DuelClient playerElo={elo} />;
}
