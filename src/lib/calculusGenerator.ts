export interface CalculusQuestion {
  text:       string;
  answer:     string;
  difficulty: number;
  topic:      'calculus';
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatTerm(a: number, e: number): string {
  if (e === 0) return String(a);
  if (e === 1) return a === 1 ? 'x' : `${a}x`;
  return a === 1 ? `x^${e}` : `${a}x^${e}`;
}

function formatDerivative(coefficient: number, exponent: number): string {
  return formatTerm(coefficient, exponent);
}

export function generateCalculusQuestion(difficulty: number): CalculusQuestion {
  switch (difficulty) {

    case 0: {
      const n          = randomInt(2, 6);
      const dCoeff     = n;
      const dExp       = n - 1;
      return {
        text:       `What is the derivative of f(x) = x^${n} with respect to x?`,
        answer:     formatDerivative(dCoeff, dExp),
        difficulty: 0,
        topic:      'calculus',
      };
    }

    case 1: {
      const a          = randomInt(2, 8);
      const n          = randomInt(2, 5);
      const dCoeff     = a * n;
      const dExp       = n - 1;
      return {
        text:       `What is the derivative of f(x) = ${a}x^${n} with respect to x?`,
        answer:     formatDerivative(dCoeff, dExp),
        difficulty: 1,
        topic:      'calculus',
      };
    }

    case 2: {
      const n      = randomInt(3, 6);
      const m      = randomInt(1, n - 1);
      const a      = randomInt(2, 6);
      const b      = randomInt(2, 6);
      const term1  = formatDerivative(a * n, n - 1);
      const term2  = formatDerivative(b * m, m - 1);
      const answer = m - 1 === 0
        ? `${term1} + ${b * m}`  
        : `${term1} + ${term2}`;
      return {
        text:       `What is the derivative of f(x) = ${formatTerm(a, n)} + ${formatTerm(b, m)} with respect to x?`,
        answer,
        difficulty: 2,
        topic:      'calculus',
      };
    }

    default:
      return generateCalculusQuestion(0);
  }
}
