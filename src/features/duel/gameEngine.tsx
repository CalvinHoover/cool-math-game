// Functions implementing game logic for Duels

import { MathProblem } from './types';

// Checks if the player's answer matches the correct answer for the given problem, returning true or false
export const checkAnswer = (problem: MathProblem, playerAnswer: string): boolean => {
  return problem.correctAnswer === playerAnswer;
};

// Returns the opponent of the given actor ('player' or 'opponent')
export const opponentOf = (actor: 'player' | 'opponent'): 'player' | 'opponent' => {
  return actor === 'player' ? 'opponent' : 'player';
};