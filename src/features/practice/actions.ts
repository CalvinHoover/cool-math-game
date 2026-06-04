/*
[GenAI Use] Prompt: "I need three Next.js server actions for practice. One bootstraps a session by fetching questions. One verifies an answer and updates attempts. One completes the session, awards XP, checks for level ups, builds a progress snapshot, and triggers achievements. Write me a plan to help me implement them with proper error types."
[GenAI Use] LLM Response Start
Plan:
- type ActionError = { ok: false; error: string } -- shared error shape for all three actions.
- type BootstrapResult = ActionError | { ok: true; sessionId: string; questions: PracticeQuestion[]; timeLimit?: number; } -- result from starting a new or existing session.
- type VerifyResult = ActionError | { ok: true; correct: boolean; attempts: number; answer?: string; explanation?: string; } -- result after checking a user answer.
- type CompleteResult = ActionError | { ok: true; xpEarned: number; totalXp: number; newLevel?: number; newAchievements?: { slug: string; name: string; color: string }[]; } -- result when a session finishes.
- function calculatePoints(difficulty: number): number -- rounds and clamps difficulty to a point value between 1 and 5.
- function orderQuestions<T>(questions: T[]): T[] -- shallow copies the array to preserve ordering.
- function normalizeCount(count?: number): number -- sanitizes the requested question count to a number between 1 and MAX_COUNT.
- function toPracticeQuestion(record: SessionQuestionWithQuestion): PracticeQuestion -- maps a Prisma row to the pure type used by the UI.
- export async function bootstrapPracticeSession(input: { topicId?: string; count?: number; timeLimit?: number }): Promise<BootstrapResult> -- validates the user and topic, checks for an existing active session, otherwise fetches questions and creates a new session with nested SessionQuestion rows.
- export async function verifyAnswer(input: { sessionId: string; questionId: string; userAnswer: string }): Promise<VerifyResult> -- looks up the user's session question, enforces attempt limits, normalizes and compares answers case-insensitively, and returns hints on the first miss or the correct answer after max attempts.
- export async function getTopics() -- fetches the current user and returns the full list of available topics.
- export async function completePracticeSession(input: { sessionId: string }): Promise<CompleteResult> -- marks the session done, totals earned XP by mapping each correct answer through a points helper, upserts the user's topic XP record using a composite key, detects level-ups, computes a score percentage, assembles a progress snapshot, and triggers the achievement engine. All DB access goes through repository objects so the actions stay focused on business logic.
[GenAI Use] LLM Response End
[GenAI Use] Reflection: I kept the three actions in one file because they share helper functions. The complete action got very long because it chains many steps, but each step is clear. I had to look up how Prisma upsert works with composite keys.
*/

'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/features/auth/session';
import { QuestionDBAccess } from '@/features/questions/repository';
import { PracticeDBAccess, type SessionQuestionWithQuestion } from './repository';
import { calculatePoints, getEarnedPoints, normalizeCount } from './practiceLogic';
import type { PracticeQuestion } from './practiceLogic';
import { getLevel } from '@/features/xp/leveling';
import { checkAndAwardAchievements } from '@/features/achievements/engine';
import type { UserProgressSnapshot } from '@/features/achievements/engine';

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
      newAchievements?: { slug: string; name: string; color: string }[];
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

  // repository isolates prisma access for easier mocking in tests
  const existingSession = await PracticeDBAccess.findActiveSession(
    session.id,
    topicId
  );

  if (existingSession) {
    const ordered = orderQuestions(existingSession.questions); // FIXME: preserve stored question order if it differs from current ordering
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
  const normalizedAnswer = userAnswer.toLowerCase();
  const actualAnswer = sessionQuestion.question.answer.trim();
  const isCorrect = normalizedAnswer === actualAnswer.toLowerCase();

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
      answer: actualAnswer,
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
  // totals up xp from every correct answer so the level check is accurate
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

  const maxPoints = completedSession.questions.reduce((total, sq) => {
    return total + calculatePoints(sq.question.difficulty);
  }, 0);
  const scorePercent = maxPoints > 0 ? Math.round((earnedXp / maxPoints) * 100) : 0;

  const [totalCompletedSessions, userTopics] = await Promise.all([
    prisma.practiceSession.count({ where: { userId: session.id, completed: true } }),
    prisma.userTopic.findMany({
      where: { userId: session.id },
      select: { topicId: true, level: true },
    }),
  ]);

  const snapshot: UserProgressSnapshot = {
    totalCompletedSessions,
    userTopics,
    currentSessionScorePercent: scorePercent,
  };

  const { newlyUnlocked } = await checkAndAwardAchievements(session.id, snapshot);

  return {
    ok: true,
    xpEarned: earnedXp,
    totalXp: userTopic.xp,
    newLevel,
    newAchievements: newlyUnlocked.length > 0 ? newlyUnlocked : undefined,
  };
}