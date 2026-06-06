import { useCallback, useEffect, useRef, useState } from 'react';
import { ActiveAttack, QuestionWithSource } from './types';
import { checkAnswer } from './gameEngine';
import { ATTACK_DAMAGE } from './constants';
import { useDuelGame } from './useDuelGame';

interface RemoteEvent {
  id:        string;
  type:      string;
  payload:   Record<string, unknown>;
  createdAt: string;
}

export const useDuelSync = (matchId?: string) => {
  const game         = useDuelGame();
  const isMultiplayer = !!matchId;

  const gameRef = useRef(game);
  useEffect(() => { gameRef.current = game; });

  const lastEventTimeRef = useRef(new Date().toISOString());

  const [remoteWinner, setRemoteWinner] = useState<'player' | 'opponent' | null>(null);
  const remoteWinnerRef = useRef<string | null>(null);

  const postEvent = useCallback(async (type: string, payload: object) => {
    if (!matchId) return;
    try {
      await fetch(`/api/duel/${matchId}/event`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ type, payload }),
      });
    } catch (err) {
      console.error('postEvent failed:', err);
    }
  }, [matchId]);

  useEffect(() => {
    if (!matchId) return;

    const interval = setInterval(async () => {
      if (remoteWinnerRef.current) return;

      try {
        const res = await fetch(
          `/api/duel/${matchId}/poll?since=${encodeURIComponent(lastEventTimeRef.current)}`
        );
        if (!res.ok) return;

        const events: RemoteEvent[] = await res.json();

        for (const event of events) {
          switch (event.type) {

            case 'attack_spawned': {
              const { attackId, question, positionY } = event.payload as {
                attackId: number; question: ActiveAttack['question']; positionY: number;
              };
              gameRef.current.spawnAttack({ id: attackId, question, positionY, owner: 'opponent' });
              break;
            }

            case 'attack_blocked': {
              const { attackId } = event.payload as { attackId: number };
              gameRef.current.deleteAttack(attackId);
              break;
            }

            case 'attack_hit': {
              const { attackId } = event.payload as { attackId: number };
              gameRef.current.deleteAttack(attackId);
              gameRef.current.addHP(-ATTACK_DAMAGE, 'opponent');
              break;
            }

            case 'game_over': {
              remoteWinnerRef.current = 'player';
              setRemoteWinner('player');
              break;
            }
          }
        }

        if (events.length > 0) {
          lastEventTimeRef.current = events[events.length - 1].createdAt;
        }
      } catch (err) {
        console.error('Poll failed:', err);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [matchId]);

  const resolveAttackPurchase = useCallback(async (
    buyer: 'player' | 'opponent',
    clickHeight: number,
    selectedDifficulty: number,
    selectedTopic: string
  ) => {
    const attack = await gameRef.current.resolveAttackPurchase(
      buyer, clickHeight, selectedDifficulty, selectedTopic
    );
    if (attack && isMultiplayer) {
      await postEvent('attack_spawned', {
        attackId:  attack.id,
        question:  attack.question,
        positionY: attack.positionY,
      });
    }
  }, [isMultiplayer, postEvent]);

  const resolveQuestionResponse = useCallback((
    questionToResolve: QuestionWithSource,
    answerInputted: string
  ) => {
    gameRef.current.resolveQuestionResponse(questionToResolve, answerInputted);

    if (isMultiplayer && questionToResolve.type === 'attack') {
      const correct = checkAnswer(questionToResolve.question, answerInputted);
      postEvent(
        correct ? 'attack_blocked' : 'attack_hit',
        { attackId: questionToResolve.id }
      );
    }
  }, [isMultiplayer, postEvent]);

  const resolveAttackHit = useCallback((attack: ActiveAttack) => {
    gameRef.current.resolveAttackHit(attack);
    if (isMultiplayer && attack.owner === 'opponent') {
      postEvent('attack_hit', { attackId: attack.id });
    }
  }, [isMultiplayer, postEvent]);

  return {
    gameState:             game.gameState,
    setActiveQuestion:     game.setActiveQuestion,
    resolveQuestionResponse,
    resolveAttackPurchase,
    resolveAttackHit,
    deleteAttack:          game.deleteAttack,
    remoteWinner,
    postEvent,
    isMultiplayer,
  };
};
