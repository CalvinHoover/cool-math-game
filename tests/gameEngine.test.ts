import { describe, expect, it } from 'vitest';
import { checkAnswer, opponentOf, canAffordAttack } from '@/features/duel/gameEngine';
import type { Question } from '@/features/duel/types';

const question = (answer: string): Question => ({
  text:       'What is 2 + 2?',
  answer,
  difficulty: 0,
  topic:      'arithmetic',
});

describe('checkAnswer', () => {
  it('returns true when the answer matches exactly', () => {
    expect(checkAnswer(question('4'), '4')).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(checkAnswer(question('Paris'), 'paris')).toBe(true);
    expect(checkAnswer(question('paris'), 'PARIS')).toBe(true);
  });

  it('ignores leading and trailing whitespace', () => {
    expect(checkAnswer(question('4'), '  4  ')).toBe(true);
    expect(checkAnswer(question('  4  '), '4')).toBe(true);
  });

  it('returns false when the answer is wrong', () => {
    expect(checkAnswer(question('4'), '5')).toBe(false);
  });

  it('returns false for empty input', () => {
    expect(checkAnswer(question('4'), '')).toBe(false);
  });
});

describe('opponentOf', () => {
  it('returns opponent for player', () => {
    expect(opponentOf('player')).toBe('opponent');
  });

  it('returns player for opponent', () => {
    expect(opponentOf('opponent')).toBe('player');
  });
});

describe('canAffordAttack', () => {
  it('returns true when balance exceeds price', () => {
    expect(canAffordAttack(20, 0)).toBe(true); // easy costs 5
  });

  it('returns true when balance equals price exactly', () => {
    expect(canAffordAttack(5, 0)).toBe(true);  // easy costs 5
    expect(canAffordAttack(10, 1)).toBe(true); // medium costs 10
    expect(canAffordAttack(15, 2)).toBe(true); // hard costs 15
  });

  it('returns false when balance is below price', () => {
    expect(canAffordAttack(4,  0)).toBe(false);
    expect(canAffordAttack(9,  1)).toBe(false);
    expect(canAffordAttack(14, 2)).toBe(false);
  });

  it('returns false when balance is zero', () => {
    expect(canAffordAttack(0, 0)).toBe(false);
  });
});
