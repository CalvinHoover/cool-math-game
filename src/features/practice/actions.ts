'use server';

import { getSession } from '@/features/auth/session';
import { PracticeRepository } from './repository';

const DEFAULT_COUNT = 5;
const MAX_COUNT = 5;

type ActionError = { ok: false; error: string };

export type PracticeQuestion = {
  id: string;
  text: string;
  points: number;
  attempts: number;
  correct: boolean;
};

type BootstrapResult =
  | ActionError
  | { ok: true; sessionId: string; questions: PracticeQuestion[] };

type VerifyResult =
  | ActionError
  | {
      ok: true;
      correct: boolean;
      attempts: number;
      answer?: string;
      explanation?: string;
    };

type CompleteResult = ActionError | { ok: true };

type SessionQuestionRecord = {
  attempts: number;
  correct: boolean;
  question: {
    id: string;
    text: string;
    difficulty: number;
  };
};

function calculatePoints(difficulty: number): number {
  const rounded = Number.isFinite(difficulty) ? Math.round(difficulty) : 1;
  return Math.min(5, Math.max(1, rounded));
}

function orderQuestions<T>(questions: T[]): T[] {
  return [...questions];
}

function normalizeCount(count?: number): number {
  if (!Number.isFinite(count)) {
    return DEFAULT_COUNT;
  }

  const normalized = Math.floor(count ?? DEFAULT_COUNT);
  return Math.min(MAX_COUNT, Math.max(1, normalized));
}

function toPracticeQuestion(record: SessionQuestionRecord): PracticeQuestion {
  return {
    id: record.question.id,
    text: record.question.text,
    points: calculatePoints(record.question.difficulty),
    attempts: record.attempts,
    correct: record.correct,
  };
}

export async function bootstrapPracticeSession(input: {
  topicId?: string;
  count?: number;
}): Promise<BootstrapResult> {
  const session = await getSession();
  if (!session) {
    return { ok: false, error: 'unauthorized' };
  }

  const topicId = typeof input.topicId === 'string' ? input.topicId.trim() : '';
  if (!topicId) {
    return { ok: false, error: 'invalid-topic' };
  }

  const count = normalizeCount(input.count);

  const existingSession = await PracticeRepository.findActiveSession(
    session.id,
    topicId
  );

  if (existingSession) {
    const ordered = orderQuestions(existingSession.questions);
    return {
      ok: true,
      sessionId: existingSession.id,
      questions: ordered.map(toPracticeQuestion),
    };
  }

  const questions = await PracticeRepository.findQuestionsByTopic(topicId, count);
  if (!questions.length) {
    return { ok: false, error: 'no-questions' };
  }

  const orderedQuestions = orderQuestions(questions);
  const createdSession = await PracticeRepository.createSessionWithQuestions(
    session.id,
    orderedQuestions.map((question) => question.id)
  );

  const orderedSessionQuestions = orderQuestions(createdSession.questions);

  return {
    ok: true,
    sessionId: createdSession.id,
    questions: orderedSessionQuestions.map(toPracticeQuestion),
  };
}

export async function verifyAnswer(input: {
  sessionId: string;
  questionId: string;
  userAnswer: string;
}): Promise<VerifyResult> {
  const session = await getSession();
  if (!session) {
    return { ok: false, error: 'unauthorized' };
  }

  const sessionId = input.sessionId?.trim();
  const questionId = input.questionId?.trim();
  const userAnswer = input.userAnswer?.trim();

  if (!sessionId || !questionId || !userAnswer) {
    return { ok: false, error: 'invalid-input' };
  }

  const sessionQuestion = await PracticeRepository.findSessionQuestionForUser(
    sessionId,
    questionId,
    session.id
  );

  if (!sessionQuestion) {
    return { ok: false, error: 'not-found' };
  }

  if (sessionQuestion.correct) {
    return { ok: false, error: 'already-correct' };
  }

  if (sessionQuestion.attempts >= 2) {
    return { ok: false, error: 'max-attempts' };
  }

  const nextAttempts = sessionQuestion.attempts + 1;
  const normalizedAnswer = userAnswer.toLowerCase();
  const actualAnswer = sessionQuestion.question.answer.trim();
  const isCorrect = normalizedAnswer === actualAnswer.toLowerCase();

  await PracticeRepository.updateSessionQuestion(sessionQuestion.id, {
    attempts: nextAttempts,
    userAnswer,
    correct: isCorrect,
  });

  const explanation = sessionQuestion.question.hint ?? undefined;

  if (isCorrect) {
    return {
      ok: true,
      correct: true,
      attempts: nextAttempts,
      explanation,
    };
  }

  if (nextAttempts >= 2) {
    return {
      ok: true,
      correct: false,
      attempts: nextAttempts,
      answer: actualAnswer,
      explanation,
    };
  }

  return {
    ok: true,
    correct: false,
    attempts: nextAttempts,
  };
}

export async function completePracticeSession(input: {
  sessionId: string;
}): Promise<CompleteResult> {
  const session = await getSession();
  if (!session) {
    return { ok: false, error: 'unauthorized' };
  }

  const sessionId = input.sessionId?.trim();
  if (!sessionId) {
    return { ok: false, error: 'invalid-input' };
  }

  const result = await PracticeRepository.completeSession(sessionId, session.id);
  if (result.count === 0) {
    return { ok: false, error: 'not-found' };
  }

  return { ok: true };
}