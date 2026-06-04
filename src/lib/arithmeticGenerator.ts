// src/lib/arithmeticGenerator.ts
// Generates arithmetic questions procedurally — no database needed.
// Pure TypeScript, safe to import in both server and client code.
//
// Difficulty scale matches the rest of the game (0 = easy, 1 = medium, 2 = hard).
// Easy:   a + b  or  a - b              (no negatives, numbers 1–20)
// Medium: a × b  or  a + b × c          (BODMAS, numbers 2–15)
// Hard:   (a + b) × c  |  a×b + c×d  |  a÷b + c  (exact division only)

export interface ArithmeticQuestion {
  text:       string;
  answer:     string;
  difficulty: number;
  topic:      'arithmetic';
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateArithmeticQuestion(difficulty: number): ArithmeticQuestion {
  switch (difficulty) {

    case 0: {
      const a   = randomInt(1, 20);
      const b   = randomInt(1, 20);
      const add = Math.random() < 0.5;
      const [x, y] = add ? [a, b] : [Math.max(a, b), Math.min(a, b)];
      return {
        text:       `What is ${x} ${add ? '+' : '-'} ${y}?`,
        answer:     String(add ? x + y : x - y),
        difficulty: 0,
        topic:      'arithmetic',
      };
    }

    case 1: {
      if (Math.random() < 0.5) {
        const a = randomInt(2, 15);
        const b = randomInt(2, 15);
        return {
          text:       `What is ${a} × ${b}?`,
          answer:     String(a * b),
          difficulty: 1,
          topic:      'arithmetic',
        };
      } else {
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
}
