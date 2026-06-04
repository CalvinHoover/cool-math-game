import { describe, expect, it } from 'vitest';
import { calculateElo } from '@/features/elo/calculate';

describe('calculateElo', () => {
  it('winner gains ELO and loser loses ELO', () => {
    const { newWinnerElo, newLoserElo } = calculateElo(1000, 1000);
    expect(newWinnerElo).toBeGreaterThan(1000);
    expect(newLoserElo).toBeLessThan(1000);
  });

  it('total ELO is conserved after a match', () => {
    const { newWinnerElo, newLoserElo } = calculateElo(1000, 1000);
    expect(newWinnerElo + newLoserElo).toBe(2000);
  });

  it('equal ratings — each side moves by K/2 (16 points)', () => {
    const { newWinnerElo, newLoserElo } = calculateElo(1000, 1000);
    expect(newWinnerElo).toBe(1016);
    expect(newLoserElo).toBe(984);
  });

  it('higher-rated player beating lower-rated gains fewer points', () => {
    const { newWinnerElo: favoriteWins } = calculateElo(1200, 1000);
    const { newWinnerElo: equalWins    } = calculateElo(1000, 1000);
    expect(favoriteWins - 1200).toBeLessThan(equalWins - 1000);
  });

  it('lower-rated player beating higher-rated gains more points', () => {
    const { newWinnerElo: upsetWins } = calculateElo(1000, 1200);
    const { newWinnerElo: equalWins } = calculateElo(1000, 1000);
    expect(upsetWins - 1000).toBeGreaterThan(equalWins - 1000);
  });

  it('ratings never go negative', () => {
    const { newLoserElo } = calculateElo(1000, 100);
    expect(newLoserElo).toBeGreaterThan(0);
  });
});
