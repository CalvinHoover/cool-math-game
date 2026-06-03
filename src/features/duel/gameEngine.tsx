// src/features/duel/gameEngine.tsx
// Helper functions for duels.
// Pure utility — no React-specific code.

import { allSampleQuestions, DIFFICULTY_COLORS, DIFFICULTY_LABELS, QUESTION_PRICES, TOPIC_COLORS } from './constants';
import { Question } from './types';

// ─── Answer checking ──────────────────────────────────────────────────────────

// Returns true if the player's answer matches the correct answer for the question.
export const checkAnswer = (question: Question, playerAnswer: string): boolean => {
  return question.answer.trim().toLowerCase() === playerAnswer.trim().toLowerCase();
};

// ─── Opponent helper ──────────────────────────────────────────────────────────

// Returns the opponent of the given actor ('player' or 'opponent').
export const opponentOf = (actor: 'player' | 'opponent'): 'player' | 'opponent' => {
  return actor === 'player' ? 'opponent' : 'player';
};

// ─── Question generation ──────────────────────────────────────────────────────

// Synchronous fallback: picks a random question from the hardcoded sample bank.
// Used when the API is unavailable or during testing.
export const generateQuestion = (difficulty?: number, topic?: string): Question => {
  let viable = allSampleQuestions;
  if (difficulty !== undefined) viable = viable.filter(q => q.difficulty === difficulty);
  if (topic      !== undefined) viable = viable.filter(q => q.topic      === topic);
  if (viable.length === 0)      viable = allSampleQuestions; // graceful fallback
  return viable[Math.floor(Math.random() * viable.length)];
};

// Async version: fetches a random question from the database via the API.
// Falls back to generateQuestion() if the request fails.
export const fetchQuestion = async (difficulty?: number, topic?: string): Promise<Question> => {
  try {
    const params = new URLSearchParams();
    if (difficulty !== undefined) params.append('difficulty', difficulty.toString());
    if (topic      !== undefined) params.append('topic',      topic);

    const res = await fetch(`/api/questions?${params.toString()}`);
    if (!res.ok) throw new Error(`Questions API returned ${res.status}`);

    const data = await res.json();
    return data as Question;
  } catch (err) {
    console.warn('fetchQuestion: API unavailable, falling back to local questions.', err);
    return generateQuestion(difficulty, topic);
  }
};

// ─── Affordability ────────────────────────────────────────────────────────────

// Returns true if the player can afford an attack of the given difficulty.
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
