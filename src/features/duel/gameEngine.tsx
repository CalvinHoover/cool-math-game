// src/features/duel/gameEngine.tsx
// Helper functions for duels. No React-specific code.

import { allSampleQuestions, DIFFICULTY_COLORS, DIFFICULTY_LABELS, QUESTION_PRICES, TOPIC_COLORS } from './constants';
import { Question } from './types';

// ─── Answer checking ──────────────────────────────────────────────────────────

export const checkAnswer = (question: Question, playerAnswer: string): boolean => {
  return question.answer.trim().toLowerCase() === playerAnswer.trim().toLowerCase();
};

// ─── Opponent helper ──────────────────────────────────────────────────────────

export const opponentOf = (actor: 'player' | 'opponent'): 'player' | 'opponent' => {
  return actor === 'player' ? 'opponent' : 'player';
};

// ─── Arithmetic question generator ───────────────────────────────────────────
// Generates arithmetic questions programmatically — no database needed.
// Easy:   a + b  or  a - b         (no negatives, numbers 1–20)
// Medium: a × b  or  a + b × c     (BODMAS, numbers 2–15)
// Hard:   (a + b) × c  or  a × b + c × d  or  a ÷ b + c  (exact division)

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const generateArithmeticQuestion = (difficulty: number): Question => {
  switch (difficulty) {

    case 0: {
      const a  = randomInt(1, 20);
      const b  = randomInt(1, 20);
      const add = Math.random() < 0.5;
      const [x, y] = add ? [a, b] : [Math.max(a, b), Math.min(a, b)]; // keep result positive
      return {
        text:       `What is ${x} ${add ? '+' : '-'} ${y}?`,
        answer:     String(add ? x + y : x - y),
        difficulty: 0,
        topic:      'arithmetic',
      };
    }

    case 1: {
      if (Math.random() < 0.5) {
        // a × b
        const a = randomInt(2, 15);
        const b = randomInt(2, 15);
        return {
          text:       `What is ${a} × ${b}?`,
          answer:     String(a * b),
          difficulty: 1,
          topic:      'arithmetic',
        };
      } else {
        // a + b × c  (BODMAS — multiply before add)
        const a = randomInt(1, 10);
        const b = randomInt(2, 10);
        const c = randomInt(1, 10);
        return {
          text:       `What is ${a} + ${b} × ${c}?`,
          answer:     String(a + b * c),
          difficulty: 1,
          topic:      'arithmetic',
        };
      }
    }

    case 2: {
      const type = randomInt(0, 2);

      if (type === 0) {
        // (a + b) × c
        const a = randomInt(1, 15);
        const b = randomInt(1, 15);
        const c = randomInt(2, 10);
        return {
          text:       `What is (${a} + ${b}) × ${c}?`,
          answer:     String((a + b) * c),
          difficulty: 2,
          topic:      'arithmetic',
        };
      } else if (type === 1) {
        // a × b + c × d
        const a = randomInt(2, 12);
        const b = randomInt(2, 12);
        const c = randomInt(2, 12);
        const d = randomInt(2, 12);
        return {
          text:       `What is ${a} × ${b} + ${c} × ${d}?`,
          answer:     String(a * b + c * d),
          difficulty: 2,
          topic:      'arithmetic',
        };
      } else {
        // a ÷ b + c  (guarantee exact division)
        const b      = randomInt(2, 10);
        const result = randomInt(2, 10);
        const a      = b * result;
        const c      = randomInt(1, 20);
        return {
          text:       `What is ${a} ÷ ${b} + ${c}?`,
          answer:     String(a / b + c),
          difficulty: 2,
          topic:      'arithmetic',
        };
      }
    }

    default:
      return generateArithmeticQuestion(0);
  }
};

// ─── Question generation ──────────────────────────────────────────────────────

// Synchronous fallback — uses the hardcoded sample bank.
export const generateQuestion = (difficulty?: number, topic?: string): Question => {
  let viable = allSampleQuestions;
  if (difficulty !== undefined) viable = viable.filter(q => q.difficulty === difficulty);
  if (topic      !== undefined) viable = viable.filter(q => q.topic      === topic);
  if (viable.length === 0)      viable = allSampleQuestions;
  return viable[Math.floor(Math.random() * viable.length)];
};

// Async version — arithmetic is generated locally; everything else fetches from the DB.
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
