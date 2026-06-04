import { describe, expect, it } from 'vitest';
import { generateCalculusQuestion } from '@/lib/calculusGenerator';

function generateMany(difficulty: number, count = 200) {
  return Array.from({ length: count }, () => generateCalculusQuestion(difficulty));
}

describe('generateCalculusQuestion — easy (difficulty 0)', () => {
  it('answer is the correct power rule derivative of x^n', () => {
    for (const q of generateMany(0)) {
      const n = Number((q.text.match(/x\^(\d+)/) ?? [])[1]);
      const expectedCoeff = n;
      const expectedExp   = n - 1;

      if (expectedExp === 1) {
        expect(q.answer).toBe(`${expectedCoeff}x`);
      } else {
        expect(q.answer).toBe(`${expectedCoeff}x^${expectedExp}`);
      }
    }
  });

  it('sets difficulty to 0 and topic to calculus', () => {
    for (const q of generateMany(0, 10)) {
      expect(q.difficulty).toBe(0);
      expect(q.topic).toBe('calculus');
    }
  });
});

describe('generateCalculusQuestion — medium (difficulty 1)', () => {
  it('answer is the correct power rule derivative of a*x^n', () => {
    for (const q of generateMany(1)) {
      const match = q.text.match(/= (\d+)x\^(\d+)/);
      if (!match) continue; 
      const a = Number(match[1]);
      const n = Number(match[2]);
      const expectedCoeff = a * n;
      const expectedExp   = n - 1;

      if (expectedExp === 1) {
        expect(q.answer).toBe(`${expectedCoeff}x`);
      } else if (expectedExp === 0) {
        expect(q.answer).toBe(String(expectedCoeff));
      } else {
        expect(q.answer).toBe(`${expectedCoeff}x^${expectedExp}`);
      }
    }
  });

  it('sets difficulty to 1 and topic to calculus', () => {
    for (const q of generateMany(1, 10)) {
      expect(q.difficulty).toBe(1);
      expect(q.topic).toBe('calculus');
    }
  });
});

describe('generateCalculusQuestion — hard (difficulty 2)', () => {
  it('answer contains a + sign (sum of two derivative terms)', () => {
    for (const q of generateMany(2)) {
      expect(q.answer).toContain('+');
    }
  });

  it('sets difficulty to 2 and topic to calculus', () => {
    for (const q of generateMany(2, 10)) {
      expect(q.difficulty).toBe(2);
      expect(q.topic).toBe('calculus');
    }
  });
});

describe('generateCalculusQuestion — unknown difficulty', () => {
  it('falls back to easy', () => {
    const q = generateCalculusQuestion(99);
    expect(q.difficulty).toBe(0);
  });
});
