export interface CountingQuestion {
  text:       string;
  answer:     string;
  difficulty: number;
  topic:      'counting';
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function factorial(n: number): number {
  return n <= 1 ? 1 : n * factorial(n - 1);
}

export function generateCountingQuestion(difficulty: number): CountingQuestion {
  switch (difficulty) {

    case 0: {
      const n = randomInt(3, 7);
      return {
        text:       `How many ways are there to arrange ${n} distinct objects in a row?`,
        answer:     String(factorial(n)),
        difficulty: 0,
        topic:      'counting',
      };
    }

    case 1: {
      const n = randomInt(4, 8);
      return {
        text:       `In how many ways can ${n} people be seated around a circular table?`,
        answer:     String(factorial(n - 1)),
        difficulty: 1,
        topic:      'counting',
      };
    }

    case 2: {
      const n = randomInt(4, 7);
      const answer = factorial(n - 1) * 2;
      return {
        text:       `How many ways can ${n} different books be arranged on a shelf if 2 specific books must always be next to each other?`,
        answer:     String(answer),
        difficulty: 2,
        topic:      'counting',
      };
    }

    default:
      return generateCountingQuestion(0);
  }
}
