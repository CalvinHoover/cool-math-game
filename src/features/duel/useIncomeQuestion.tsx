// src/features/duel/useIncomeQuestion.tsx
// React hook for managing income question state.
// Uses fetchQuestion (async, DB-backed) instead of the hardcoded fallback.

import { useState, useCallback, useEffect } from 'react';
import { Question } from './types';
import { generateQuestion, fetchQuestion } from './gameEngine';
import { VETO_COOLDOWN_MS } from './constants';

export interface IncomeQuestionState {
  question: Question;
  isVetoed: boolean;
}

export const useIncomeQuestion = (difficulty: number) => {
  // Initialise synchronously with the local fallback; replace with a fetched
  // question immediately after mount.
  const [incomeQuestionState, setState] = useState<IncomeQuestionState>({
    question: generateQuestion(difficulty),
    isVetoed: false,
  });

  useEffect(() => {
    fetchQuestion(difficulty).then((question) => {
      setState((prev) => ({ ...prev, question }));
    });
  }, [difficulty]);

  // Generates a new question and resets the veto state.
  const generateNewProblem = useCallback(() => {
    fetchQuestion(difficulty).then((question) => {
      setState({ question, isVetoed: false });
    });
  }, [difficulty]);

  // Triggers the veto cooldown, then generates a fresh question.
  const triggerVeto = useCallback(() => {
    setState((prev) => ({ ...prev, isVetoed: true }));
    setTimeout(() => {
      generateNewProblem();
    }, VETO_COOLDOWN_MS);
  }, [generateNewProblem]);

  return { incomeQuestionState, generateNewProblem, triggerVeto };
};
