// React hook bridging gameEngine.tsx and the UI

import { useState, useCallback } from 'react';
import { GameState, MathProblem, ActiveAttack} from './types';
import { checkAnswer } from './gameEngine';

export const useDuelGame = () => {
  const [gameState, setGameState] = useState<GameState>({player: { hp: 100, coins: 1000 },
    opponent: { hp: 100, coins: 1000 },
    incomingAttacks: [],
    activeQuestion: null });

  // Adds newAttack to the array of active
  const spawnAttack = useCallback((newAttack: ActiveAttack) => {
    setGameState((prevState) => ({
      ...prevState,
      incomingAttacks: [
        ...prevState.incomingAttacks,
        newAttack                   
      ]
    }));
  }, []);

  // Sets the active question to the passed parameter
  const setActiveQuestion = useCallback((question: ActiveAttack | null) => {
    setGameState((prevState) => ({ ...prevState, activeQuestion: question }));
  }, []);

  return { gameState, spawnAttack, setActiveQuestion };
};