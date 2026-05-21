import { prisma } from '@/lib/prisma';
import type { Question, Topic } from '@prisma/client';

export type QuestionRecord = Question;

export const QuestionDBAccess = {
  // fetches questions by topic and difficulty while excluding any the user has already seen
  async findQuestions(opts: {
    topicId?: string;
    difficulty?: number;
    count?: number;
    excludeIds?: string[];
  } = {}): Promise<QuestionRecord[]> {
    const where: Record<string, unknown> = {};

    if (opts.topicId) {
      where.topicId = opts.topicId;
    }
    if (typeof opts.difficulty === 'number') {
      where.difficulty = opts.difficulty;
    }
    if (opts.excludeIds && opts.excludeIds.length > 0) {
      where.id = { notIn: opts.excludeIds };
    }

    return prisma.question.findMany({
      where,
      take: opts.count,
      orderBy: { id: 'asc' },
    });
  },

  async findById(id: string): Promise<QuestionRecord | null> {
    return prisma.question.findUnique({
      where: { id },
    });
  },

  async createTopic(name: string): Promise<Topic> {
    return prisma.topic.create({
      data: { name },
    });
  },

  async createQuestion(data: {
    topicId: string;
    text: string;
    answer: string;
    hint?: string;
    explanation: string;
    difficulty: number;
  }): Promise<Question> {
    return prisma.question.create({
      data,
    });
  },
};
