import type { MathProblem } from './types';

export type DuelEvent =
  | { type: 'match:start';     opponent: string }
  | { type: 'mining:question'; questionId: string; problem: MathProblem }
  | { type: 'attack:launched'; attackId: string; problem: MathProblem; senderId: string }
  | { type: 'attack:answered'; attackId: string; correct: boolean }
  | { type: 'hp:update';       playerId: string; newHp: number }
  | { type: 'coins:update';    playerId: string; newCoins: number }
  | { type: 'match:over';      winnerId: string }
  | { type: 'player:forfeit';  playerId: string }

const VALID_TYPES = new Set([
  'match:start',
  'mining:question',
  'attack:launched',
  'attack:answered',
  'hp:update',
  'coins:update',
  'match:over',
  'player:forfeit',
]);

export function isDuelEvent(value: unknown): value is DuelEvent {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return typeof obj.type === 'string' && VALID_TYPES.has(obj.type);
}
