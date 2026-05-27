import { describe, expect, it } from 'vitest';
import {
  deriveInitialState,
  getAttemptForQuestion,
  getEarnedPoints,
  getNextQuestionIndex,
  type PracticeQuestion,
} from '@/features/practice/practiceLogic';

// unit tests focus on pure scoring and progression rules
const question = (overrides: Partial<PracticeQuestion> = {}): PracticeQuestion => ({
  id: 'q1',
  text: 'Question',
  points: 4,
  attempts: 0,
  correct: false,
  ...overrides,
});

describe('getEarnedPoints', () => {
  it('returns 0 for incorrect answers', () => {
    expect(getEarnedPoints(question({ correct: false, attempts: 1 }))).toBe(0);
  });

  it('returns full points on first try', () => {
    expect(getEarnedPoints(question({ correct: true, attempts: 1, points: 5 }))).toBe(5);
  });

  it('returns half points on second try', () => {
    expect(getEarnedPoints(question({ correct: true, attempts: 2, points: 4 }))).toBe(2);
  });
});

describe('getNextQuestionIndex', () => {
  it('returns first unanswered question', () => {
    const questions = [
      question({ id: 'q1', correct: true, attempts: 1 }),
      question({ id: 'q2', correct: false, attempts: 2 }),
      question({ id: 'q3', correct: false, attempts: 1 }),
    ];
    expect(getNextQuestionIndex(questions, 0)).toBe(2);
  });

  it('returns length when all questions are completed', () => {
    const questions = [
      question({ id: 'q1', correct: true, attempts: 1 }),
      question({ id: 'q2', correct: false, attempts: 2 }),
    ];
    expect(getNextQuestionIndex(questions, 0)).toBe(questions.length);
  });
});

describe('getAttemptForQuestion', () => {
  it('returns 1 when there is no question', () => {
    expect(getAttemptForQuestion(undefined)).toBe(1);
  });

  it('increments attempts up to 2', () => {
    expect(getAttemptForQuestion(question({ attempts: 0 }))).toBe(1);
    expect(getAttemptForQuestion(question({ attempts: 1 }))).toBe(2);
    expect(getAttemptForQuestion(question({ attempts: 2 }))).toBe(2);
  });
});

describe('deriveInitialState', () => {
  it('computes score and resume position', () => {
    const questions = [
      question({ id: 'q1', points: 2, correct: true, attempts: 1 }),
      question({ id: 'q2', points: 4, correct: true, attempts: 2 }),
      question({ id: 'q3', points: 3, correct: false, attempts: 2 }),
      question({ id: 'q4', points: 5, correct: false, attempts: 0 }),
    ];
    expect(deriveInitialState(questions)).toEqual({
      score: 4,
      currentIndex: 3,
      attempt: 1,
    });
  });

  it('uses length when all questions are completed', () => {
    const questions = [
      question({ id: 'q1', correct: true, attempts: 1 }),
      question({ id: 'q2', correct: false, attempts: 2 }),
    ];
    const result = deriveInitialState(questions);
    expect(result.currentIndex).toBe(questions.length);
    expect(result.attempt).toBe(1);
  });
});
