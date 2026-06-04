import { describe, expect, it } from 'vitest';
import { generateArithmeticQuestion } from '@/lib/arithmeticGenerator';

function generateMany(difficulty: number, count = 200) {
  return Array.from({ length: count }, () => generateArithmeticQuestion(difficulty));
}

// Parse "What is X?" → extract the numeric answer independently of eval
function extractNumbers(text: string): number[] {
  return (text.match(/\d+/g) ?? []).map(Number);
}

describe('generateArithmeticQuestion — easy (difficulty 0)', () => {
  it('answer is a non-negative integer', () => {
    for (const q of generateMany(0)) {
      const answer = Number(q.answer);
      expect(Number.isInteger(answer)).toBe(true);
      expect(answer).toBeGreaterThanOrEqual(0);
    }
  });

  it('answer equals the sum or difference of the two operands', () => {
    for (const q of generateMany(0)) {
      const [a, b] = extractNumbers(q.text);
      const answer = Number(q.answer);
      expect(answer === a + b || answer === a - b).toBe(true);
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
  it('answer is a positive integer', () => {
    for (const q of generateMany(1)) {
      const answer = Number(q.answer);
      expect(Number.isInteger(answer)).toBe(true);
      expect(answer).toBeGreaterThan(0);
    }
  });

  it('multiplication answer equals the product of the two operands', () => {
    const multQuestions = generateMany(1, 500).filter(q => !q.text.includes('+'));
    for (const q of multQuestions) {
      const [a, b] = extractNumbers(q.text);
      expect(Number(q.answer)).toBe(a * b);
    }
  });

  it('compound answer respects BODMAS (a + b * c)', () => {
    const compoundQuestions = generateMany(1, 500).filter(q => q.text.includes('+'));
    for (const q of compoundQuestions) {
      const [a, b, c] = extractNumbers(q.text);
      expect(Number(q.answer)).toBe(a + b * c);
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
  it('answer is a positive integer', () => {
    for (const q of generateMany(2)) {
      const answer = Number(q.answer);
      expect(Number.isInteger(answer)).toBe(true);
      expect(answer).toBeGreaterThan(0);
    }
  });

  it('division questions produce whole number answers', () => {
    const divQuestions = generateMany(2, 500).filter(q => q.text.includes('\u00F7'));
    for (const q of divQuestions) {
      expect(Number(q.answer) % 1).toBe(0);
    }
  });

  it('bracket questions answer equals (a + b) * c', () => {
    const bracketQuestions = generateMany(2, 500).filter(q => q.text.includes('('));
    for (const q of bracketQuestions) {
      const [a, b, c] = extractNumbers(q.text);
      expect(Number(q.answer)).toBe((a + b) * c);
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
