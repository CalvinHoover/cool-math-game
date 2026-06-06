import { useEffect, useRef } from 'react';
import { GameState } from './useDuelGame';
import { allTopics } from './constants';

interface BotBehavior {
  minAttackMs: number;
  maxAttackMs: number;
  attackDifficulties: number[];
  deflectChance: number;
  deflectCheckMs: number;
}

function getBotBehavior(elo: number): BotBehavior {
  if (elo >= 1900) return { minAttackMs: 2000, maxAttackMs: 4000,   attackDifficulties: [2,2,1], deflectChance: 0.80, deflectCheckMs: 1500 };
  if (elo >= 1700) return { minAttackMs: 3000, maxAttackMs: 6000,   attackDifficulties: [2,1,1], deflectChance: 0.65, deflectCheckMs: 2000 };
  if (elo >= 1500) return { minAttackMs: 4000, maxAttackMs: 7000,   attackDifficulties: [1,1,0], deflectChance: 0.50, deflectCheckMs: 2500 };
  if (elo >= 1300) return { minAttackMs: 5000, maxAttackMs: 8000,   attackDifficulties: [1,0,0], deflectChance: 0.35, deflectCheckMs: 3000 };
  if (elo >= 1100) return { minAttackMs: 6000, maxAttackMs: 10000,  attackDifficulties: [0,0,1], deflectChance: 0.20, deflectCheckMs: 3500 };
  return             { minAttackMs: 8000, maxAttackMs: 12000, attackDifficulties: [0,0,0], deflectChance: 0.10, deflectCheckMs: 4000 };
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface UseBotOpponentArgs {
  enabled: boolean;
  botElo: number;
  gameState: GameState;
  resolveAttackPurchase: (buyer: 'player' | 'opponent', clickHeight: number, selectedDifficulty: number, selectedTopic: string) => void;
  deflectAttack: (attackId: number) => void;
}

export function useBotOpponent({ enabled, botElo, gameState, resolveAttackPurchase, deflectAttack }: UseBotOpponentArgs) {
  const behavior = getBotBehavior(botElo);
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  // Bot spawns attacks on a randomized interval
  useEffect(() => {
    if (!enabled) return;

    function scheduleNextAttack() {
      const delay = randomBetween(behavior.minAttackMs, behavior.maxAttackMs);
      return setTimeout(() => {
        const state = gameStateRef.current;
        if (state.player.hp <= 0 || state.opponent.hp <= 0) return;

        const difficulty = pickRandom(behavior.attackDifficulties);
        const topic = pickRandom(allTopics);
        const y = randomBetween(60, 420);
        resolveAttackPurchase('opponent', y, difficulty, topic);

        timeoutRef.current = scheduleNextAttack();
      }, delay);
    }

    const timeoutRef = { current: scheduleNextAttack() };
    return () => clearTimeout(timeoutRef.current);
  }, [botElo, enabled]);

  // Bot periodically tries to deflect player attacks
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      const state = gameStateRef.current;
      if (state.player.hp <= 0 || state.opponent.hp <= 0) return;

      const playerAttacks = state.incomingAttacks.filter(a => a.owner === 'player');
      playerAttacks.forEach(attack => {
        if (Math.random() < behavior.deflectChance) {
          deflectAttack(attack.id);
        }
      });
    }, behavior.deflectCheckMs);

    return () => clearInterval(interval);
  }, [botElo, enabled]);
}
