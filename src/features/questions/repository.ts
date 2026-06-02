/*
[GenAI Use] Prompt: "I need a single place for all question related Prisma queries. It should support filtering by topic and difficulty, excluding seen questions, finding by ID, listing topics, and creating questions. Help me write a plan for this."
[GenAI Use] LLM Response Start
Plan:
- export type QuestionRecord = Question -- re-export alias for consistency.
- export const QuestionDBAccess = { ... } -- plain object with five async methods so the whole module can be mocked in tests.
- async findQuestions(opts: { topicId?: string; difficulty?: number; count?: number; excludeIds?: string[] } = {}): Promise<QuestionRecord[]> -- builds a dynamic Prisma where object conditionally adding topicId, difficulty, and notIn filters so callers can combine filters without needing multiple dedicated queries.
- async findById(id: string): Promise<QuestionRecord | null> -- thin wrapper around findUnique.
- async findAllTopics(): Promise<Topic[]> -- returns all topics ordered by name.
- async createTopic(name: string): Promise<Topic> -- thin wrapper around topic.create.
- async createQuestion(data: { topicId: string; text: string; answer: string; hint?: string; explanation: string; difficulty: number }): Promise<Question> -- thin wrapper around question.create. This keeps all question-related Prisma calls in one place for easier mocking in tests.
[GenAI Use] LLM Response End
[GenAI Use] Reflection: The dynamic where object was a good pattern I learned here. Instead of hardcoding every filter combination, I build the where object conditionally. This made the function much shorter.
*/

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

  async findAllTopics(): Promise<Topic[]> {
    return prisma.topic.findMany({
      orderBy: { name: 'asc' },
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
