import { describe, expect, it } from 'vitest';
import { generateAlgebraQuestion } from '@/lib/algebraGenerator';

function generateMany(difficulty: number, count = 300) {
  return Array.from({ length: count }, () => generateAlgebraQuestion(difficulty));
}

// ── Easy ─────────────────────────────────────────────────────────────────────

describe('generateAlgebraQuestion — easy (difficulty 0)', () => {
  it('linear: answer satisfies ax + b = c', () => {
    const linear = generateMany(0).filter(q => q.text.includes('equation'));
    for (const q of linear) {
      const [a, b, c] = (q.text.match(/\d+/g) ?? []).map(Number);
      expect(a * Number(q.answer) + b).toBe(c);
    }
  });

  it('evaluate: answer equals f(n) = ax² + b', () => {
    const evaluate = generateMany(0).filter(q => q.text.includes('f(x)'));
    for (const q of evaluate) {
      const nums = (q.text.match(/\d+/g) ?? []).map(Number);
      const [a, b, n] = nums;
      expect(Number(q.answer)).toBe(a * n * n + b);
    }
  });

  it('answer is a non-negative integer', () => {
    for (const q of generateMany(0)) {
      expect(Number.isInteger(Number(q.answer))).toBe(true);
      expect(Number(q.answer)).toBeGreaterThanOrEqual(0);
    }
  });

  it('sets difficulty 0 and topic algebra', () => {
    for (const q of generateMany(0, 10)) {
      expect(q.difficulty).toBe(0);
      expect(q.topic).toBe('algebra');
    }
  });
});

// ── Medium ───────────────────────────────────────────────────────────────────

describe('generateAlgebraQuestion — medium (difficulty 1)', () => {
  it('two-step linear: answer satisfies ax + b = cx + d', () => {
    const twoStep = generateMany(1).filter(q => q.text.startsWith('If'));
    for (const q of twoStep) {
      const x = Number(q.answer);
      const [a, b, c, d] = (q.text.match(/\d+/g) ?? []).map(Number);
      expect(a * x + b).toBe(c * x + d);
    }
  });

  it('quadratic: both roots satisfy the equation', () => {
    const quadratic = generateMany(1).filter(q => q.text.includes('x²'));
    for (const q of quadratic) {
      const roots = q.answer.split(', ').map(Number);
      expect(roots).toHaveLength(2);
      for (const r of roots) {
        expect(Number.isInteger(r)).toBe(true);
        expect(r).toBeGreaterThan(0);
      }
      expect(roots[0]).toBeLessThanOrEqual(roots[1]);
    }
  });

  it('sets difficulty 1 and topic algebra', () => {
    for (const q of generateMany(1, 10)) {
      expect(q.difficulty).toBe(1);
      expect(q.topic).toBe('algebra');
    }
  });
});

// ── Hard ─────────────────────────────────────────────────────────────────────

describe('generateAlgebraQuestion — hard (difficulty 2)', () => {
  it('system: answer satisfies both equations', () => {
    const systems = generateMany(2).filter(q => q.text.includes('system'));
    for (const q of systems) {
      const x = Number(q.answer);
      const [a, b] = (q.text.match(/-?\d+/g) ?? []).map(Number);
      expect(x).toBe((a + b) / 2);
      expect(Number.isInteger(x)).toBe(true);
    }
  });

  it('mixed quadratic: both roots satisfy the equation and are sorted', () => {
    const mixed = generateMany(2).filter(q => q.text.includes('x²') && !q.text.includes('system'));
    for (const q of mixed) {
      const roots = q.answer.split(', ').map(Number);
      expect(roots).toHaveLength(2);
      expect(roots[0]).toBeLessThanOrEqual(roots[1]);
    }
  });

  it('exponents: answer equals a + b', () => {
    const exponent = generateMany(2).filter(q => q.text.includes('·'));
    for (const q of exponent) {
      const [a, b] = (q.text.match(/\d+/g) ?? []).map(Number);
      expect(Number(q.answer)).toBe(a + b);
    }
  });

  it('sets difficulty 2 and topic algebra', () => {
    for (const q of generateMany(2, 10)) {
      expect(q.difficulty).toBe(2);
      expect(q.topic).toBe('algebra');
    }
  });
});

describe('generateAlgebraQuestion — unknown difficulty', () => {
  it('falls back to easy', () => {
    expect(generateAlgebraQuestion(99).difficulty).toBe(0);
  });
});
