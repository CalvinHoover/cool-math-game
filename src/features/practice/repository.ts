// [GenAI Use] Prompt: "I need a data access module for practice sessions. It should wrap Prisma queries for finding active sessions, creating sessions with nested questions, updating session answers, marking completion, and fetching sessions with their questions. Write it as a plain object with async methods."
// [GenAI Use] LLM Response Start (Modified)
import { prisma } from '@/lib/prisma';
import type { PracticeSession, Question, SessionQuestion } from '@prisma/client';

export type SessionQuestionWithQuestion = SessionQuestion & { question: Question };
export type PracticeSessionWithQuestions = PracticeSession & {
  questions: SessionQuestionWithQuestion[];
};

// repository wraps prisma calls to keep data access testable in isolation
export const PracticeDBAccess = {
  async findActiveSession(
    userId: string,
    topicId: string
  ): Promise<PracticeSessionWithQuestions | null> {
    return prisma.practiceSession.findFirst({
      where: {
        userId,
        completed: false,
        questions: {
          some: {
            question: {
              topicId,
            },
          },
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
      include: {
        questions: {
          include: {
            question: true,
          },
          orderBy: {
            questionId: 'asc',
          },
        },
      },
    });
  },

  async createSessionWithQuestions(
    userId: string,
    questionIds: string[],
    timeLimit?: number
  ): Promise<PracticeSessionWithQuestions> {
    return prisma.practiceSession.create({
      data: {
        userId,
        timeLimit,
        questions: {
          create: questionIds.map((questionId) => ({
            questionId,
          })),
        },
      },
      include: {
        questions: {
          include: {
            question: true,
          },
          orderBy: {
            questionId: 'asc',
          },
        },
      },
    });
  },

  async findSessionQuestionForUser(
    sessionId: string,
    questionId: string,
    userId: string
  ): Promise<SessionQuestionWithQuestion | null> {
    return prisma.sessionQuestion.findFirst({
      where: {
        sessionId,
        questionId,
        session: {
          userId,
          completed: false,
        },
      },
      include: {
        question: true,
      },
    });
  },

  async updateSessionQuestion(
    sessionQuestionId: string,
    data: { attempts: number; userAnswer: string; correct: boolean }
  ) {
    return prisma.sessionQuestion.update({
      where: {
        id: sessionQuestionId,
      },
      data,
    });
  },

  async completeSession(sessionId: string, userId: string) {
    return prisma.practiceSession.updateMany({
      where: {
        id: sessionId,
        userId,
        completed: false,
      },
      data: {
        completed: true,
        endedAt: new Date(),
      },
    });
  },

  async findSessionWithQuestions(
    sessionId: string,
    userId: string
  ): Promise<PracticeSessionWithQuestions | null> {
    return prisma.practiceSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      include: {
        questions: {
          include: {
            question: true,
          },
          orderBy: {
            questionId: 'asc',
          },
        },
      },
    });
  },
};
// [GenAI Use] LLM Response End
// [GenAI Use] Reflection: I modified the variable names to fit the project. I added the ownership checks in findSessionQuestionForUser and completeSession so users cannot tamper with other peoples sessions. The nested create pattern for questions was new to me.
