// Helper functions for the duel game

import { allSampleQuestions, DIFFICULTY_COLORS, DIFFICULTY_LABELS, QUESTION_PRICES, TOPIC_COLORS } from './constants';
import { Question } from './types';
import { generateArithmeticQuestion } from '@/lib/arithmeticGenerator';

export const checkAnswer = (question: Question, playerAnswer: string): boolean => {
  return question.answer.trim().toLowerCase() === playerAnswer.trim().toLowerCase();
};

// ─── Opponent helper ──────────────────────────────────────────────────────────

export const opponentOf = (actor: 'player' | 'opponent'): 'player' | 'opponent' => {
  return actor === 'player' ? 'opponent' : 'player';
};

export { generateArithmeticQuestion };

// ─── Question generation ──────────────────────────────────────────────────────
// Search hard-coded sample questions for a question
export const generateQuestion = (difficulty?: number, topic?: string): Question => {
  let viable = allSampleQuestions;
  if (difficulty !== undefined) viable = viable.filter(q => q.difficulty === difficulty);
  if (topic      !== undefined) viable = viable.filter(q => q.topic      === topic);
  if (viable.length === 0)      viable = allSampleQuestions;
  return viable[Math.floor(Math.random() * viable.length)];
};


// Search database for a question
export const fetchQuestion = async (difficulty?: number, topic?: string): Promise<Question> => {
  if (topic === 'arithmetic') {
    return generateArithmeticQuestion(difficulty ?? 0);
  }

  try {
    const params = new URLSearchParams();
    if (difficulty !== undefined) params.append('difficulty', difficulty.toString());
    if (topic      !== undefined) params.append('topic',      topic);

    const res = await fetch(`/api/questions?${params.toString()}`);
    if (!res.ok) throw new Error(`Questions API returned ${res.status}`);
    return await res.json() as Question;
  } catch (err) {
    console.warn('fetchQuestion: API unavailable, falling back to local questions.', err);
    return generateQuestion(difficulty, topic);
  }
};

// ─── Affordability ────────────────────────────────────────────────────────────

export const canAffordAttack = (playerBalance: number, difficultyRequested: number): boolean => {
  return playerBalance >= QUESTION_PRICES[difficultyRequested];
};

// ─── Display helpers ──────────────────────────────────────────────────────────

export const getDifficultyLabel = (difficulty: number): string =>
  DIFFICULTY_LABELS[difficulty] || 'Unknown';

export const getDifficultyColor = (difficulty: number): string =>
  DIFFICULTY_COLORS[difficulty] || '#FFFFFF';

export const getTopicColor = (topic: string): string =>
  TOPIC_COLORS[topic] || '#FFFFFF';
