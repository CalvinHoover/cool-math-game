// React hook for managing the state of income questions, which are questions the player can choose to answer for extra coins. 
// Contains the current question and whether it is currently vetoed, as well as functions to generate a new question and trigger the veto.

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

  // Generates a new question and resets the veto state. Should be called after a question is answered or after the veto cooldown expires.
  const generateNewProblem = useCallback(() => {
    setState({
      question: generateQuestion(difficulty),
      isVetoed: false
    });
  }, [difficulty]);

  // Triggers the veto state, preventing the player from clicking the income question for a certain cooldown period. 
  // After the cooldown, a new question is generated and the veto state is reset. 
  const triggerVeto = useCallback(() => {
    setState(prev => ({ ...prev, isVetoed: true }));

    setTimeout(() => {
      generateNewProblem();
    }, VETO_COOLDOWN_MS); 
  }, [generateNewProblem]);

  return { incomeQuestionState, generateNewProblem, triggerVeto };
};