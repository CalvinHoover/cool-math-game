import { prisma } from '@/lib/prisma';

export const PracticeRepository = {
  async findActiveSession(userId: string, topicId: string) {
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

  async findQuestionsByTopic(topicId: string, count: number) {
    return prisma.question.findMany({
      where: {
        topicId,
      },
      orderBy: {
        id: 'asc',
      },
      take: count,
    });
  },

  async createSessionWithQuestions(userId: string, questionIds: string[]) {
    return prisma.practiceSession.create({
      data: {
        userId,
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
  ) {
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
};
