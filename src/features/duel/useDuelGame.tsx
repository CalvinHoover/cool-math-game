// React hook bridging gameEngine.tsx and the UI

import { useState, useCallback } from 'react';
import { GameState, MathProblem } from './types';
import { checkAnswer } from './gameEngine';

export const useDuelGame = () => {
  const [gameState, setGameState] = useState<GameState>({player: { hp: 100, coins: 0 },
    opponent: { hp: 100, coins: 0 },
    incomingAttacks: [] });

  return { gameState };
};