'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/features/auth/session';
import { QuestionDBAccess } from '@/features/questions/repository';
import { PracticeDBAccess, type SessionQuestionWithQuestion } from './repository';
import { calculatePoints, getEarnedPoints, normalizeCount } from './practiceLogic';
import type { PracticeQuestion } from './practiceLogic';
import { getLevel } from '@/features/xp/leveling';

type ActionError = { ok: false; error: string };

type BootstrapResult =
  | ActionError
  | { ok: true; sessionId: string; questions: PracticeQuestion[]; timeLimit?: number };

type VerifyResult =
  | ActionError
  | {
      ok: true;
      correct: boolean;
      attempts: number;
      answer?: string;
      explanation?: string;
    };

type CompleteResult =
  | ActionError
  | {
      ok: true;
      xpEarned: number;
      totalXp: number;
      newLevel?: number;
    };

function orderQuestions<T>(questions: T[]): T[] {
  return [...questions];
}

function toPracticeQuestion(
  record: SessionQuestionWithQuestion
): PracticeQuestion {
  return {
    id: record.question.id,
    text: record.question.text,
    points: calculatePoints(record.question.difficulty),
    attempts: record.attempts,
    correct: record.correct,
    answer: record.question.answer,
    explanation: record.question.explanation ?? undefined,
  };
}

export async function bootstrapPracticeSession(input: {
  topicId?: string;
  count?: number;
  timeLimit?: number;
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

  const existingSession = await PracticeDBAccess.findActiveSession(
    session.id,
    topicId
  );

  if (existingSession) {
    const ordered = orderQuestions(existingSession.questions);
    return {
      ok: true,
      sessionId: existingSession.id,
      questions: ordered.map(toPracticeQuestion),
      timeLimit: existingSession.timeLimit ?? undefined,
    };
  }

  const questions = await QuestionDBAccess.findQuestions({ topicId, count });
  if (!questions.length) {
    return { ok: false, error: 'no-questions' };
  }

  const orderedQuestions = orderQuestions(questions);
  const createdSession = await PracticeDBAccess.createSessionWithQuestions(
    session.id,
    orderedQuestions.map((question) => question.id),
    input.timeLimit
  );

  const orderedSessionQuestions = orderQuestions(createdSession.questions);

  return {
    ok: true,
    sessionId: createdSession.id,
    questions: orderedSessionQuestions.map(toPracticeQuestion),
    timeLimit: createdSession.timeLimit ?? undefined,
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

  const sessionQuestion = await PracticeDBAccess.findSessionQuestionForUser(
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
  const normalizedUserAnswer = userAnswer.trim().toLowerCase();
  const normalizedActualAnswer = sessionQuestion.question.answer.trim().toLowerCase();
  const isCorrect = normalizedUserAnswer === normalizedActualAnswer;

  await PracticeDBAccess.updateSessionQuestion(sessionQuestion.id, {
    attempts: nextAttempts,
    userAnswer,
    correct: isCorrect,
  });

  if (isCorrect) {
    return {
      ok: true,
      correct: true,
      attempts: nextAttempts,
      explanation: sessionQuestion.question.explanation,
    };
  }

  if (nextAttempts >= 2) {
    return {
      ok: true,
      correct: false,
      attempts: nextAttempts,
      answer: sessionQuestion.question.answer.trim(),
      explanation: sessionQuestion.question.explanation,
    };
  }

  return {
    ok: true,
    correct: false,
    attempts: nextAttempts,
    explanation: sessionQuestion.question.hint ?? undefined,
  };
}

export async function getTopics() {
  const session = await getSession();
  if (!session) {
    return { ok: false, error: 'unauthorized' } as const;
  }
  const topics = await QuestionDBAccess.findAllTopics();
  return { ok: true, topics } as const;
}

export async function hasActiveSession(input: {
  topicId?: string;
}): Promise<ActionError | { ok: true }> {
  const session = await getSession();
  if (!session) {
    return { ok: false, error: 'unauthorized' };
  }
  const topicId = typeof input.topicId === 'string' ? input.topicId.trim() : '';
  if (!topicId) {
    return { ok: false, error: 'invalid-topic' };
  }
  const existingSession = await PracticeDBAccess.findActiveSession(session.id, topicId);
  if (existingSession) {
    return { ok: true };
  }
  return { ok: false, error: 'no-active-session' };
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

  const result = await PracticeDBAccess.completeSession(sessionId, session.id);
  if (result.count === 0) {
    return { ok: false, error: 'not-found' };
  }

  const completedSession = await PracticeDBAccess.findSessionWithQuestions(
    sessionId,
    session.id
  );

  if (!completedSession || !completedSession.questions.length) {
    return { ok: true, xpEarned: 0, totalXp: 0 };
  }

  const topicId = completedSession.questions[0].question.topicId;
  const earnedXp = completedSession.questions.reduce((total, sq) => {
    const pq: PracticeQuestion = {
      id: sq.question.id,
      text: sq.question.text,
      points: calculatePoints(sq.question.difficulty),
      attempts: sq.attempts,
      correct: sq.correct,
    };
    return total + getEarnedPoints(pq);
  }, 0);

  const userTopic = await prisma.userTopic.upsert({
    where: {
      userId_topicId: {
        userId: session.id,
        topicId,
      },
    },
    create: {
      userId: session.id,
      topicId,
      xp: earnedXp,
    },
    update: {
      xp: {
        increment: earnedXp,
      },
    },
  });

  const levelInfo = getLevel(userTopic.xp);
  let newLevel: number | undefined;

  if (levelInfo.level > userTopic.level) {
    await prisma.userTopic.update({
      where: { id: userTopic.id },
      data: { level: levelInfo.level },
    });
    newLevel = levelInfo.level;
  }

  return {
    ok: true,
    xpEarned: earnedXp,
    totalXp: userTopic.xp,
    newLevel,
  };
}