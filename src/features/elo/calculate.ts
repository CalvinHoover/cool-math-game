// src/features/elo/calculate.ts
// Standard ELO rating calculation.

const K = 32; // K-factor — controls how much a single match moves ratings

/**
 * Returns updated ELO ratings after a match.
 * @param winnerElo  Current ELO of the winning player
 * @param loserElo   Current ELO of the losing player
 */
export function calculateElo(
  winnerElo: number,
  loserElo: number
): { newWinnerElo: number; newLoserElo: number } {
  const expectedWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
  const expectedLoser  = 1 - expectedWinner;

  return {
    newWinnerElo: Math.round(winnerElo + K * (1 - expectedWinner)),
    newLoserElo:  Math.round(loserElo  + K * (0 - expectedLoser)),
  };
}
