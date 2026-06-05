import { verifyAnswer, completePracticeSession, hasActiveSession } from './actions';

export type PracticeActions = {
  verifyAnswer: typeof verifyAnswer;
  completePracticeSession: typeof completePracticeSession;
  hasActiveSession: typeof hasActiveSession;
};

export const actions: PracticeActions = {
  verifyAnswer,
  completePracticeSession,
  hasActiveSession,
};
