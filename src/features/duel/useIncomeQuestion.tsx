// React hook bridging gameEngine.tsx and the UI

import { useState, useCallback } from 'react';
import { Question } from './types';
import { generateQuestion } from './gameEngine';
import { VETO_COOLDOWN_MS } from './constants';

export interface IncomeQuestionState {
  question: Question;
  isVetoed: boolean;
}

export const useIncomeQuestion = (difficulty: number) => {
  const [incomeQuestionState, setState] = useState<IncomeQuestionState>({question: generateQuestion(difficulty), isVetoed: false});

  const generateNewProblem = useCallback(() => {
    setState({
      question: generateQuestion(difficulty),
      isVetoed: false
    });
  }, [difficulty]);

  const triggerVeto = useCallback(() => {
    setState(prev => ({ ...prev, isVetoed: true }));

    setTimeout(() => {
      generateNewProblem();
    }, VETO_COOLDOWN_MS); // Vetoing means no new question for a penalty period, after which a new question is generated and the veto state is reset. 
  }, [generateNewProblem]);

  return { incomeQuestionState, generateNewProblem, triggerVeto };
};