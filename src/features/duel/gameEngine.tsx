// Functions implementing game logic for Duels

import { MathProblem } from './types';

export const checkAnswer = (problem: MathProblem, playerAnswer: string): boolean => {
  return problem.correctAnswer === playerAnswer;
};