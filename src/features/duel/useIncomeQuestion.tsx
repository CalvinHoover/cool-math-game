// React hook bridging gameEngine.tsx and the UI

import { useState, useCallback } from 'react';
import { MathQuestion } from './types';
import { sampleQuestion } from './testData';

export interface IncomeQuestionState {
  question: MathQuestion;
  isVetoed: boolean;
}

export const useIncomeQuestion = () => {
  const [incomeQuestionState, setState] = useState<IncomeQuestionState>({question: sampleQuestion, isVetoed: false});

  return { incomeQuestionState };
};