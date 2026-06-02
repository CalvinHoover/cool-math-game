import type { PrismaClient } from '@prisma/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { seed } from '../prisma/seed/seed';

type MockPrisma = {
  question: {
    upsert: ReturnType<typeof vi.fn>;
  };
  topic: {
    upsert: ReturnType<typeof vi.fn>;
  };
  achievement: {
    upsert: ReturnType<typeof vi.fn>;
  };
};

describe('seed', () => {
  const createMockPrisma = (): MockPrisma => ({
    question: {
      upsert: vi.fn(),
    },
    topic: {
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

  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('upserts topics and questions', async () => {
    const prisma = createMockPrisma();
    prisma.topic.upsert.mockResolvedValue({ id: 't1', name: 'Algebra' });

    await seed(prisma as unknown as PrismaClient, { data: testData });

    expect(prisma.topic.upsert).toHaveBeenCalledWith({
      where: { name: 'Algebra' },
      create: { name: 'Algebra' },
      update: {},
    });
    expect(prisma.question.upsert).toHaveBeenCalledWith({
      where: {
        topicId_text: { topicId: 't1', text: 'What is $2+2$?' },
      },
      create: {
        topicId: 't1',
        text: 'What is $2+2$?',
        answer: '4',
        hint: 'Count',
        explanation: 'Basic arithmetic.',
        difficulty: 1,
      },
      update: {
        answer: '4',
        hint: 'Count',
        explanation: 'Basic arithmetic.',
        difficulty: 1,
      },
    });
  });
});
