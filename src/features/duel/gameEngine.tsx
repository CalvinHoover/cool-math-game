import { allSampleQuestions, DIFFICULTY_COLORS, DIFFICULTY_LABELS, QUESTION_PRICES, TOPIC_COLORS } from './constants';
import { Question } from './types';

export const checkAnswer = (question: Question, playerAnswer: string): boolean => {
  return question.answer.trim().toLowerCase() === playerAnswer.trim().toLowerCase();
};

export const opponentOf = (actor: 'player' | 'opponent'): 'player' | 'opponent' => {
  return actor === 'player' ? 'opponent' : 'player';
};

// Easy:   a + b  or  a - b        
// Medium: a × b  or  a + b × c     
// Hard:   (a + b) × c  or  a × b + c × d  or  a ÷ b + c  

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const generateArithmeticQuestion = (difficulty: number): Question => {
  switch (difficulty) {

    case 0: {
      const a  = randomInt(1, 101);
      const b  = randomInt(1, 101);
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
        // this is a × b
        const a = randomInt(2, 101);
        const b = randomInt(2, 101);
        return {
          text:       `What is ${a} × ${b}?`,
          answer:     String(a * b),
          difficulty: 1,
          topic:      'arithmetic',
        };
      } else {
        const a = randomInt(1, 101);
        const b = randomInt(2, 101);
        const c = randomInt(1, 101);
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
        // this is (a + b) × c
        const a = randomInt(1, 101);
        const b = randomInt(1, 101);
        const c = randomInt(2, 101);
        return {
          text:       `What is (${a} + ${b}) × ${c}?`,
          answer:     String((a + b) * c),
          difficulty: 2,
          topic:      'arithmetic',
        };
      } else if (type === 1) {
        // this is a × b + c × d
        const a = randomInt(2, 101);
        const b = randomInt(2, 101);
        const c = randomInt(2, 101);
        const d = randomInt(2, 101);
        return {
          text:       `What is ${a} × ${b} + ${c} × ${d}?`,
          answer:     String(a * b + c * d),
          difficulty: 2,
          topic:      'arithmetic',
        };
      } else {
        const b      = randomInt(2, 101);
        const result = randomInt(2, 101);
        const a      = b * result;
        const c      = randomInt(1, 101);
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

export const generateQuestion = (difficulty?: number, topic?: string): Question => {
  let viable = allSampleQuestions;
  if (difficulty !== undefined) viable = viable.filter(q => q.difficulty === difficulty);
  if (topic      !== undefined) viable = viable.filter(q => q.topic      === topic);
  if (viable.length === 0)      viable = allSampleQuestions;
  return viable[Math.floor(Math.random() * viable.length)];
};

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

export const canAffordAttack = (playerBalance: number, difficultyRequested: number): boolean => {
  return playerBalance >= QUESTION_PRICES[difficultyRequested];
};

export const getDifficultyLabel = (difficulty: number): string =>
  DIFFICULTY_LABELS[difficulty] || 'Unknown';

export const getDifficultyColor = (difficulty: number): string =>
  DIFFICULTY_COLORS[difficulty] || '#FFFFFF';

export const getTopicColor = (topic: string): string =>
  TOPIC_COLORS[topic] || '#FFFFFF';
