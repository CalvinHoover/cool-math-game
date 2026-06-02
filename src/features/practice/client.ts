import { verifyAnswer, completePracticeSession } from './actions';

export type PracticeActions = {
  verifyAnswer: typeof verifyAnswer;
  completePracticeSession: typeof completePracticeSession;
};

export const actions: PracticeActions = {
  verifyAnswer,
  completePracticeSession,
};
