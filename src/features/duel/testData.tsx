import { Question } from './types';

// Placeholder questions. Eventually we will call from the database.

export const easyArithmeticQuestion: Question = {
  text: 'What is 12 + 10?',
  answer: '22',
  difficulty: 0,
  topic: 'arithmetic'
};

export const mediumArithmeticQuestion: Question = {
  text: 'What is 26 * 14?',
  answer: '364',
  difficulty: 1,
  topic: 'arithmetic'
};

export const hardArithmeticQuestion: Question = { // Stolen from mathcounts
  text: `A two-digit number and the number formed by reversing its digits are added. 
         What is the largest integer that will always divide the sum?`,
  answer: '11',
  difficulty: 2,
  topic: 'arithmetic'
};

export const easyCountingQuestion: Question = {
  text: 'How many ways are there to arrange the letters in the word "MATH"?',
  answer: '24',
  difficulty: 0,
  topic: 'counting'
};

export const mediumCountingQuestion: Question = {
  text: 'How many ways can six knights be arranged around a circular table?',
  answer: '120',
  difficulty: 1,
  topic: 'counting'
};

export const hardCountingQuestion: Question = {
  text: 'How many ways can 6 different books be arranged on a shelf if 2 of the books must be next to each other?',
  answer: '240',
  difficulty: 2,
  topic: 'counting'
};

export const easyAlgebraQuestion: Question = {
  text: 'What is the value of x in the equation 2x + 5 = 15?',
  answer: '5',
  difficulty: 0,
  topic: 'algebra'
};

export const mediumAlgebraQuestion: Question = {
  text: 'If 3x - 2 = 4x + 1, what is the value of x?',
  answer: '-3',
  difficulty: 1,
  topic: 'algebra'
};

export const hardAlgebraQuestion: Question = {
  text: 'If a + b = 6, b + c = 8. and a + c = 10, what is the value of a + b + c?',
  answer: '12',
  difficulty: 2,
  topic: 'algebra'
};

export const allSampleQuestions: Question[] = [easyArithmeticQuestion, mediumArithmeticQuestion, hardArithmeticQuestion,
  easyCountingQuestion, mediumCountingQuestion, hardCountingQuestion,
  easyAlgebraQuestion, mediumAlgebraQuestion, hardAlgebraQuestion];