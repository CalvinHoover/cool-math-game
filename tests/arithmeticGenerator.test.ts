import { describe, expect, it } from 'vitest';
import { generateArithmeticQuestion } from '@/lib/arithmeticGenerator';

// Helper: run the generator many times and collect results so we can assert
// properties that hold across all possible random outputs.
function generateMany(difficulty: number, count = 200) {
  return Array.from({ length: count }, () => generateArithmeticQuestion(difficulty));
}

describe('generateArithmeticQuestion — easy (difficulty 0)', () => {
  it('produces the correct answer for every generated question', () => {
    for (const q of generateMany(0)) {
      expect(Number(q.answer)).toBe(eval(q.text.replace('What is ', '').replace('?', '').replace('×', '*').replace('÷', '/')));
    }
  });

  it('never produces a negative answer', () => {
    for (const q of generateMany(0)) {
      expect(Number(q.answer)).toBeGreaterThanOrEqual(0);
    }
  });

  it('sets difficulty to 0 and topic to arithmetic', () => {
    for (const q of generateMany(0, 10)) {
      expect(q.difficulty).toBe(0);
      expect(q.topic).toBe('arithmetic');
    }
  });
});

describe('generateArithmeticQuestion — medium (difficulty 1)', () => {
  it('produces the correct answer for every generated question', () => {
    for (const q of generateMany(1)) {
      const expr = q.text
        .replace('What is ', '')
        .replace('?', '')
        .replace('×', '*')
        .replace('÷', '/');
      expect(Number(q.answer)).toBe(eval(expr));
    }
  });

  it('sets difficulty to 1 and topic to arithmetic', () => {
    for (const q of generateMany(1, 10)) {
      expect(q.difficulty).toBe(1);
      expect(q.topic).toBe('arithmetic');
    }
  });
});

describe('generateArithmeticQuestion — hard (difficulty 2)', () => {
  it('produces the correct answer for every generated question', () => {
    for (const q of generateMany(2)) {
      const expr = q.text
        .replace('What is ', '')
        .replace('?', '')
        .replace('×', '*')
        .replace('÷', '/');
      expect(Number(q.answer)).toBe(eval(expr));
    }
  });

  it('division questions always produce whole number answers', () => {
    const divisionQuestions = generateMany(2, 500).filter(q => q.text.includes('÷'));
    for (const q of divisionQuestions) {
      expect(Number(q.answer) % 1).toBe(0);
    }
  });

  it('sets difficulty to 2 and topic to arithmetic', () => {
    for (const q of generateMany(2, 10)) {
      expect(q.difficulty).toBe(2);
      expect(q.topic).toBe('arithmetic');
    }
  });
});

describe('generateArithmeticQuestion — unknown difficulty', () => {
  it('falls back to easy questions', () => {
    const q = generateArithmeticQuestion(99);
    expect(q.difficulty).toBe(0);
  });
});
