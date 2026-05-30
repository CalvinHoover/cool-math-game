import { completePracticeSession, verifyAnswer } from '@/features/practice/actions';

export type PracticeActionClient = {
  verifyAnswer: typeof verifyAnswer;
  completePracticeSession: typeof completePracticeSession;
};

// action indirection lets components inject test doubles without module mocks
export const practiceActionClient: PracticeActionClient = {
  verifyAnswer,
  completePracticeSession,
};
