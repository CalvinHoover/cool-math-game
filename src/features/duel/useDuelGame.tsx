// src/features/duel/useDuelGame.tsx
// React hook containing the core game state and mutation functions.
// Pure local state — no networking. useDuelSync wraps this for multiplayer.

import { useState, useCallback } from 'react';
import { PlayerState, QuestionWithSource, ActiveAttack } from './types';
import { canAffordAttack, checkAnswer, fetchQuestion, opponentOf } from './gameEngine';
import { INITIAL_HP, INITIAL_COINS, ATTACK_DAMAGE, INCOME_QUESTION_REWARDS, QUESTION_PRICES } from './constants';

export interface GameState {
  player:          PlayerState;
  opponent:        PlayerState;
  incomingAttacks: ActiveAttack[];
  activeQuestion:  QuestionWithSource | null;
}

export const useDuelGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    player:          { hp: INITIAL_HP, coins: INITIAL_COINS },
    opponent:        { hp: INITIAL_HP, coins: 10000 },
    incomingAttacks: [],
    activeQuestion:  null,
  });

  // ── Core state mutators (also exported for useDuelSync) ────────────────────

  const spawnAttack = useCallback((newAttack: ActiveAttack) => {
    setGameState(prev => ({
      ...prev,
      incomingAttacks: [...prev.incomingAttacks, newAttack],
    }));
  }, []);

  const deleteAttack = useCallback((attackID: number) => {
    setGameState(prev => {
      const remaining = prev.incomingAttacks.filter(a => a.id !== attackID);
      const newActive =
        prev.activeQuestion?.type === 'attack' && prev.activeQuestion.id === attackID
          ? null
          : prev.activeQuestion;
      return { ...prev, incomingAttacks: remaining, activeQuestion: newActive };
    });
  }, []);

  const setActiveQuestion = useCallback((question: QuestionWithSource | null) => {
    setGameState(prev => ({ ...prev, activeQuestion: question }));
  }, []);

  const addHP = useCallback((amountToAdd: number, target: 'player' | 'opponent') => {
    setGameState(prev => ({
      ...prev,
      [target]: { ...prev[target], hp: Math.max(0, prev[target].hp + amountToAdd) },
    }));
  }, []);

  const addCoins = useCallback((amountToAdd: number, target: 'player' | 'opponent') => {
    setGameState(prev => ({
      ...prev,
      [target]: { ...prev[target], coins: prev[target].coins + amountToAdd },
    }));
  }, []);

  // ── Attack logic ───────────────────────────────────────────────────────────

  const resolveAttackHit = useCallback((attack: ActiveAttack) => {
    addHP(-ATTACK_DAMAGE, opponentOf(attack.owner));
    deleteAttack(attack.id);
  }, [addHP, deleteAttack]);

  const resolveAttackResponse = useCallback((attack: ActiveAttack, answer: string) => {
    if (checkAnswer(attack.question, answer)) {
      deleteAttack(attack.id);
    } else {
      resolveAttackHit(attack);
    }
  }, [deleteAttack, resolveAttackHit]);

  // ── Income question logic ──────────────────────────────────────────────────

  const resolveIncomeQuestionResponse = useCallback((
    questionToResolve: QuestionWithSource,
    answerInputted: string
  ) => {
    if (checkAnswer(questionToResolve.question, answerInputted)) {
      addCoins(INCOME_QUESTION_REWARDS[questionToResolve.question.difficulty], 'player');
      setActiveQuestion(null);
      questionToResolve.onCorrect?.();
    } else {
      setActiveQuestion(null);
      questionToResolve.onIncorrect?.();
    }
  }, [addCoins, setActiveQuestion]);

  // ── Unified question resolution ────────────────────────────────────────────

  const resolveQuestionResponse = useCallback((
    questionToResolve: QuestionWithSource,
    answerInputted: string
  ) => {
    if (questionToResolve.type === 'attack') {
      const target = gameState.incomingAttacks.find(a => a.id === questionToResolve.id);
      if (target) {
        resolveAttackResponse(target, answerInputted);
      } else {
        console.error('resolveQuestionResponse: no matching attack found');
      }
    } else {
      resolveIncomeQuestionResponse(questionToResolve, answerInputted);
    }
  }, [gameState.incomingAttacks, resolveAttackResponse, resolveIncomeQuestionResponse]);

  // ── Attack purchase ────────────────────────────────────────────────────────
  // Returns the spawned attack so useDuelSync can broadcast it to the opponent.

  const resolveAttackPurchase = useCallback(async (
    buyer: 'player' | 'opponent',
    clickHeight: number,
    selectedDifficulty: number,
    selectedTopic: string
  ): Promise<ActiveAttack | null> => {
    if (!canAffordAttack(gameState[buyer].coins, selectedDifficulty)) {
      alert('Not enough coins for that attack!');
      return null;
    }

    addCoins(-QUESTION_PRICES[selectedDifficulty], buyer);

    const question = await fetchQuestion(selectedDifficulty, selectedTopic);

    const attack: ActiveAttack = {
      id: Date.now(),
      question,
      positionY: clickHeight,
      owner: buyer,
    };

    spawnAttack(attack);
    return attack;
  }, [gameState.player.coins, gameState.opponent.coins, spawnAttack, addCoins]);

  return {
    gameState,
    setActiveQuestion,
    resolveQuestionResponse,
    resolveAttackPurchase,
    resolveAttackHit,
    // Exposed for useDuelSync
    spawnAttack,
    deleteAttack,
    addHP,
  };
};
