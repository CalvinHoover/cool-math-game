// Functions implementing game logic for Duels

import { MathQuestion } from './types';

// Checks if the player's answer matches the correct answer for the given question, returning true or false
export const checkAnswer = (question: MathQuestion, playerAnswer: string): boolean => {
  return question.correctAnswer === playerAnswer;
};

// Returns the opponent of the given actor ('player' or 'opponent')
export const opponentOf = (actor: 'player' | 'opponent'): 'player' | 'opponent' => {
  return actor === 'player' ? 'opponent' : 'player';
};