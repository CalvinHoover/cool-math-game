// Helper functions for duels

import { allSampleQuestions, DIFFICULTY_COLORS, DIFFICULTY_LABELS, TOPIC_COLORS } from './constants';
import { Question } from './types';

// Checks if the player's answer matches the correct answer for the given question, returning true or false
export const checkAnswer = (question: Question, playerAnswer: string): boolean => {
  return question.answer === playerAnswer;
};

// Returns the opponent of the given actor ('player' or 'opponent')
export const opponentOf = (actor: 'player' | 'opponent'): 'player' | 'opponent' => {
  return actor === 'player' ? 'opponent' : 'player';
};

// Returns a random question matching the given difficulty and/or topic, or any random question if no parameters are provided
export const generateQuestion = (difficulty?: number, topic?: string): Question => {
  let viableQuestions = allSampleQuestions;

  if (difficulty !== undefined) {
    viableQuestions = viableQuestions.filter(q => q.difficulty === difficulty);
  }

  if (topic !== undefined) {
    viableQuestions = viableQuestions.filter(q => q.topic === topic);
  }

  return viableQuestions[Math.floor(Math.random() * viableQuestions.length)];
};

// Converts a difficulty number to a string label for display purposes
export const getDifficultyLabel = (difficulty: number): string => {
  return DIFFICULTY_LABELS[difficulty] || 'Unknown';
};

export const getDifficultyColor = (difficulty: number): string => {
  return DIFFICULTY_COLORS[difficulty] || '#FFFFFF';
};

export const getTopicColor = (topic: string): string => {
  return TOPIC_COLORS[topic] || '#FFFFFF';
}


