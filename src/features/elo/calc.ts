import type { EloResult } from './types';

const K = 32;

function expectedScore(playerElo: number, opponentElo: number): number {
  return 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
}

export function calculateElo(
  playerElo: number,
  opponentElo: number,
  result: 0 | 0.5 | 1
): EloResult {
  const expected = expectedScore(playerElo, opponentElo);
  const delta = Math.round(K * (result - expected));
  return { newElo: playerElo + delta, delta };
}
