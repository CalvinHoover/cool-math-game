import { describe, expect, it } from 'vitest';
import { generateCountingQuestion } from '@/lib/countingGenerator';

function generateMany(difficulty: number, count = 200) {
  return Array.from({ length: count }, () => generateCountingQuestion(difficulty));
}

function factorial(n: number): number {
  return n <= 1 ? 1 : n * factorial(n - 1);
}

function extractFirstNumber(text: string): number {
  return Number((text.match(/\d+/) ?? ['0'])[0]);
}

describe('generateCountingQuestion — easy (difficulty 0)', () => {
  it('answer equals n!', () => {
    for (const q of generateMany(0)) {
      const n = extractFirstNumber(q.text);
      expect(Number(q.answer)).toBe(factorial(n));
    }
  });

  it('answer is a positive integer', () => {
    for (const q of generateMany(0)) {
      expect(Number.isInteger(Number(q.answer))).toBe(true);
      expect(Number(q.answer)).toBeGreaterThan(0);
    }
  });

  it('sets difficulty to 0 and topic to counting', () => {
    for (const q of generateMany(0, 10)) {
      expect(q.difficulty).toBe(0);
      expect(q.topic).toBe('counting');
    }
  });
});

describe('generateCountingQuestion — medium (difficulty 1)', () => {
  it('answer equals (n-1)!', () => {
    for (const q of generateMany(1)) {
      const n = extractFirstNumber(q.text);
      expect(Number(q.answer)).toBe(factorial(n - 1));
    }
  });

  it('sets difficulty to 1 and topic to counting', () => {
    for (const q of generateMany(1, 10)) {
      expect(q.difficulty).toBe(1);
      expect(q.topic).toBe('counting');
    }
  });
});

describe('generateCountingQuestion — hard (difficulty 2)', () => {
  it('answer equals (n-1)! * 2', () => {
    for (const q of generateMany(2)) {
      const n = extractFirstNumber(q.text);
      expect(Number(q.answer)).toBe(factorial(n - 1) * 2);
    }
  });

  it('answer is always even', () => {
    for (const q of generateMany(2)) {
      expect(Number(q.answer) % 2).toBe(0);
    }
  });

  it('sets difficulty to 2 and topic to counting', () => {
    for (const q of generateMany(2, 10)) {
      expect(q.difficulty).toBe(2);
      expect(q.topic).toBe('counting');
    }
  });
});

describe('generateCountingQuestion — unknown difficulty', () => {
  it('falls back to easy', () => {
    const q = generateCountingQuestion(99);
    expect(q.difficulty).toBe(0);
  });
});
