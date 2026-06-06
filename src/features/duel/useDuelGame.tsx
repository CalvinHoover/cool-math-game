// React hook for connecting the UI of the duel game to the gameplay logic.

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

  // Adds an ActiveAttack object to the game
  const spawnAttack = useCallback((newAttack: ActiveAttack) => {
    setGameState(prev => ({
      ...prev,
      incomingAttacks: [...prev.incomingAttacks, newAttack],
    }));
  }, []);

  // Delete the attack with the specified ID
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

  // Sets the active question (the one for which the question is displayed to the player)
  const setActiveQuestion = useCallback((question: QuestionWithSource | null) => {
    setGameState(prev => ({ ...prev, activeQuestion: question }));
  }, []);

  // Adds amountToAdd hp to the target. The param amountToAdd can be positive or negative.
  // Clamps HP loss to 0 so negative HP never occurs.
  const addHP = useCallback((amountToAdd: number, target: 'player' | 'opponent') => {
    setGameState(prev => ({
      ...prev,
      [target]: { ...prev[target], hp: Math.max(0, prev[target].hp + amountToAdd) },
    }));
  }, []);

  // Adds amountToAdd coins to the target. The param amountToAdd can be positive or negative.
  // Negative coins are allowed by this function.
  const addCoins = useCallback((amountToAdd: number, target: 'player' | 'opponent') => {
    setGameState(prev => ({
      ...prev,
      [target]: { ...prev[target], coins: prev[target].coins + amountToAdd },
    }));
  }, []);

  // Resolves an attack hitting the edge of the screen. The attack is deleted and damage is dealt to the target.
  const resolveAttackHit = useCallback((attack: ActiveAttack) => {
    addHP(-ATTACK_DAMAGE, opponentOf(attack.owner));
    deleteAttack(attack.id);
  }, [addHP, deleteAttack]);

  // Resolves the response to an attack question. On a correct answer the attack is deleted/
  // On an incorrect answer, the attack automatically hits.
  const resolveAttackResponse = useCallback((attack: ActiveAttack, answer: string) => {
    if (checkAnswer(attack.question, answer)) {
      deleteAttack(attack.id);
    } else {
      resolveAttackHit(attack);
    }
  }, [deleteAttack, resolveAttackHit]);

  // Resolves the response to an income question. On a correct answer, money is earned and a new question is generated.
  // On an incorrect answer, the question is "vetoed" and that space is locked for a period of time.
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

  // Resolves a question response according to its source (an attack or an income question).
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

  // Resolves the purchase of an attack. Checks if the buyer has enough money and sends an alert if not.
  // Otherwise, adds the attack to the board and removes the appropriate number of coins.
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
    spawnAttack,
    deleteAttack,
    addHP,
  };
};
