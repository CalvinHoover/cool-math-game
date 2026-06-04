// src/features/practice/repository.ts
// Wraps Prisma calls to keep data access testable in isolation.
// For the arithmetic topic, questions are generated procedurally and inserted
// into the database so the existing session/tracking flow works unchanged.

import { prisma } from '@/lib/prisma';
import { generateArithmeticQuestion } from '@/lib/arithmeticGenerator';
import type { PracticeSession, Question, SessionQuestion } from '@prisma/client';

export type QuestionRecord = Question;
export type SessionQuestionWithQuestion = SessionQuestion & { question: Question };
export type PracticeSessionWithQuestions = PracticeSession & {
  questions: SessionQuestionWithQuestion[];
};

export const PracticeRepository = {
  async findActiveSession(
    userId: string,
    topicId: string
  ): Promise<PracticeSessionWithQuestions | null> {
    return prisma.practiceSession.findFirst({
      where: {
        userId,
        completed: false,
        questions: { some: { question: { topicId } } },
      },
      orderBy: { startedAt: 'desc' },
      include: {
        questions: {
          include: { question: true },
          orderBy: { questionId: 'asc' },
        },
      },
    });
  },

  async findQuestionsByTopic(topicId: string, count: number): Promise<QuestionRecord[]> {
    // Check if this is the arithmetic topic
    const topic = await prisma.topic.findUnique({ where: { id: topicId } });

    if (topic?.name === 'arithmetic') {
      // Generate fresh questions and persist them so session tracking works
      const difficulties = Array.from({ length: count }, (_, i) => i % 3) as (0 | 1 | 2)[];
      const generated = difficulties.map((d) => generateArithmeticQuestion(d));

      const created = await Promise.all(
        generated.map((q) =>
          prisma.question.create({
            data: {
              topicId,
              text:       q.text,
              answer:     q.answer,
              difficulty: q.difficulty,
            },
          })
        )
      );

      return created;
    }

    // All other topics — fetch from DB as normal
    return prisma.question.findMany({
      where:   { topicId },
      orderBy: { id: 'asc' },
      take:    count,
    });
  },

  async createSessionWithQuestions(
    userId: string,
    questionIds: string[]
  ): Promise<PracticeSessionWithQuestions> {
    return prisma.practiceSession.create({
      data: {
        userId,
        questions: { create: questionIds.map((questionId) => ({ questionId })) },
      },
      include: {
        questions: {
          include: { question: true },
          orderBy: { questionId: 'asc' },
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
        session: { userId, completed: false },
      },
      include: { question: true },
    });
  },

  async updateSessionQuestion(
    sessionQuestionId: string,
    data: { attempts: number; userAnswer: string; correct: boolean }
  ) {
    return prisma.sessionQuestion.update({
      where: { id: sessionQuestionId },
      data,
    });
  },

  async completeSession(sessionId: string, userId: string) {
    return prisma.practiceSession.updateMany({
      where:  { id: sessionId, userId, completed: false },
      data:   { completed: true, endedAt: new Date() },
    });
  },
};
