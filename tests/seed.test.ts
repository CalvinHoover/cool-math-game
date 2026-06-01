import type { PrismaClient } from '@prisma/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { seed } from '../prisma/seed/seed';

type MockPrisma = {
  question: {
    count: ReturnType<typeof vi.fn>;
    deleteMany: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  topic: {
    deleteMany: ReturnType<typeof vi.fn>;
    upsert: ReturnType<typeof vi.fn>;
  };
  achievement: {
    upsert: ReturnType<typeof vi.fn>;
  };
};

describe('seed', () => {
  const createMockPrisma = (): MockPrisma => ({
    question: {
      count: vi.fn(),
      deleteMany: vi.fn(),
      create: vi.fn(),
    },
    topic: {
      deleteMany: vi.fn(),
      upsert: vi.fn(),
    },
    achievement: {
      upsert: vi.fn(),
    },
  });

  const testData = [
    {
      topic: 'Algebra',
      questions: [
        {
          text: 'What is $2+2$?',
          answer: '4',
          hint: 'Count',
          explanation: 'Basic arithmetic.',
          difficulty: 1,
        },
      ],
    },
  ];

  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('skips when questions already exist and no clear flag', async () => {
    const prisma = createMockPrisma();
    prisma.question.count.mockResolvedValue(5);

    await seed(prisma as unknown as PrismaClient, { data: testData });

    expect(prisma.question.count).toHaveBeenCalled();
    expect(prisma.topic.upsert).not.toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('5 existing questions')
    );
  });

  it('clears existing data when clear flag is set', async () => {
    const prisma = createMockPrisma();
    prisma.question.count.mockResolvedValue(5);
    prisma.topic.upsert.mockResolvedValue({ id: 't1', name: 'Algebra' });

    await seed(prisma as unknown as PrismaClient, { data: testData, clear: true });

    expect(prisma.question.deleteMany).toHaveBeenCalled();
    expect(prisma.topic.deleteMany).toHaveBeenCalled();
    expect(prisma.topic.upsert).toHaveBeenCalled();
  });

  it('upserts topics and creates questions', async () => {
    const prisma = createMockPrisma();
    prisma.question.count.mockResolvedValue(0);
    prisma.topic.upsert.mockResolvedValue({ id: 't1', name: 'Algebra' });

    await seed(prisma as unknown as PrismaClient, { data: testData });

    expect(prisma.topic.upsert).toHaveBeenCalledWith({
      where: { name: 'Algebra' },
      create: { name: 'Algebra' },
      update: {},
    });
    expect(prisma.question.create).toHaveBeenCalledWith({
      data: {
        topicId: 't1',
        text: 'What is $2+2$?',
        answer: '4',
        hint: 'Count',
        explanation: 'Basic arithmetic.',
        difficulty: 1,
      },
    });
  });
});
