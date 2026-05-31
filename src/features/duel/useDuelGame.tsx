// React hook bridging gameEngine.tsx and the UI

'use client';

import { startTransition, useCallback, useEffect, useState } from 'react';
import type { GameState, MathProblem } from './types';
import { checkAnswer } from './gameEngine';
import { useDuelChannel } from './useDuelChannel';
import { fetchAttackQuestion, recordMatchResult } from './duelActions';
import type { DuelTransport } from './transport';

const COIN_REWARD = 10;
const ATTACK_COST = 20;
const ATTACK_DAMAGE = 25;

export type DuelGameHook = {
  gameState: GameState;
  submitMiningAnswer: (answer: string, problem: MathProblem) => Promise<void>;
  launchAttack: (topicId: string) => Promise<void>;
  submitDefenseAnswer: (attackId: string, answer: string, problem: MathProblem) => Promise<void>;
};

export function useDuelGame(
  matchId: string,
  playerId: string,
  opponentId: string,
  transport?: DuelTransport
): DuelGameHook {
  const [gameState, setGameState] = useState<GameState>({
    player: { hp: 100, coins: 0 },
    opponent: { hp: 100, coins: 0 },
    incomingAttacks: [],
  });

  const { sendEvent, lastEvent } = useDuelChannel(matchId, transport);

  useEffect(() => {
    if (!lastEvent) return;

    startTransition(() => setGameState((prev) => {
      switch (lastEvent.type) {
        case 'hp:update':
          if (lastEvent.playerId === playerId) {
            return { ...prev, player: { ...prev.player, hp: lastEvent.newHp } };
          }
          return { ...prev, opponent: { ...prev.opponent, hp: lastEvent.newHp } };

        case 'coins:update':
          if (lastEvent.playerId === playerId) {
            return { ...prev, player: { ...prev.player, coins: lastEvent.newCoins } };
          }
          return { ...prev, opponent: { ...prev.opponent, coins: lastEvent.newCoins } };

        case 'attack:launched':
          if (lastEvent.senderId !== playerId) {
            return {
              ...prev,
              incomingAttacks: [
                ...prev.incomingAttacks,
                { id: parseInt(lastEvent.attackId, 10) || Date.now(), problem: lastEvent.problem, positionX: 0 },
              ],
            };
          }
          return prev;

        case 'attack:answered':
          return {
            ...prev,
            incomingAttacks: prev.incomingAttacks.filter(
              (a) => String(a.id) !== lastEvent.attackId
            ),
          };

        default:
          return prev;
      }
    }));
  }, [lastEvent, playerId]);

  const submitMiningAnswer = useCallback(
    async (answer: string, problem: MathProblem) => {
      if (!checkAnswer(problem, answer)) return;
      setGameState((prev) => {
        const newCoins = prev.player.coins + COIN_REWARD;
        sendEvent({ type: 'coins:update', playerId, newCoins });
        return { ...prev, player: { ...prev.player, coins: newCoins } };
      });
    },
    [playerId, sendEvent]
  );

  const launchAttack = useCallback(
    async (topicId: string) => {
      setGameState((prev) => {
        if (prev.player.coins < ATTACK_COST) return prev;
        const newCoins = prev.player.coins - ATTACK_COST;
        fetchAttackQuestion(topicId).then((result) => {
          if (!result.ok) return;
          const attackId = `${playerId}-${Date.now()}`;
          sendEvent({ type: 'coins:update', playerId, newCoins });
          sendEvent({
            type: 'attack:launched',
            attackId,
            problem: result.problem,
            senderId: playerId,
          });
        });
        return { ...prev, player: { ...prev.player, coins: newCoins } };
      });
    },
    [playerId, sendEvent]
  );

  const submitDefenseAnswer = useCallback(
    async (attackId: string, answer: string, problem: MathProblem) => {
      const correct = checkAnswer(problem, answer);
      await sendEvent({ type: 'attack:answered', attackId, correct });

      if (!correct) {
        setGameState((prev) => {
          const newHp = Math.max(0, prev.player.hp - ATTACK_DAMAGE);
          sendEvent({ type: 'hp:update', playerId, newHp });
          if (newHp === 0) {
            sendEvent({ type: 'match:over', winnerId: opponentId });
            recordMatchResult(matchId, opponentId);
          }
          return {
            ...prev,
            player: { ...prev.player, hp: newHp },
            incomingAttacks: prev.incomingAttacks.filter((a) => String(a.id) !== attackId),
          };
        });
      }
    },
    [matchId, opponentId, playerId, sendEvent]
  );

  return { gameState, submitMiningAnswer, launchAttack, submitDefenseAnswer };
}