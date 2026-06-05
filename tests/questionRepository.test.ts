import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockPrisma = vi.hoisted(() => ({
  question: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  topic: {
    create: vi.fn(),
    upsert: vi.fn(),
  },
}));

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

import { QuestionDBAccess } from '@/features/questions/repository';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('findQuestions', () => {
  it('returns all questions when no filters provided', async () => {
    mockPrisma.question.findMany.mockResolvedValue([]);
    const result = await QuestionDBAccess.findQuestions();
    expect(mockPrisma.question.findMany).toHaveBeenCalledWith({
      where: {},
      take: undefined,
      orderBy: { id: 'asc' },
    });
    expect(result).toEqual([]);
  });

  it('filters by topicId', async () => {
    mockPrisma.question.findMany.mockResolvedValue([{ id: 'q1' }]);
    await QuestionDBAccess.findQuestions({ topicId: 'topic-1' });
    expect(mockPrisma.question.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { topicId: 'topic-1' } })
    );
  });

  it('filters by difficulty', async () => {
    mockPrisma.question.findMany.mockResolvedValue([]);
    await QuestionDBAccess.findQuestions({ difficulty: 3 });
    expect(mockPrisma.question.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { difficulty: 3 } })
    );
  });

  it('filters by both topicId and difficulty', async () => {
    mockPrisma.question.findMany.mockResolvedValue([]);
    await QuestionDBAccess.findQuestions({ topicId: 't1', difficulty: 2 });
    expect(mockPrisma.question.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { topicId: 't1', difficulty: 2 } })
    );
  });

  it('applies count limit', async () => {
    mockPrisma.question.findMany.mockResolvedValue([]);
    await QuestionDBAccess.findQuestions({ count: 5 });
    expect(mockPrisma.question.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 5 })
    );
  });

  it('excludes specific ids', async () => {
    mockPrisma.question.findMany.mockResolvedValue([]);
    await QuestionDBAccess.findQuestions({ excludeIds: ['q1', 'q2'] });
    expect(mockPrisma.question.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { notIn: ['q1', 'q2'] } },
      })
    );
  });

  it('combines all filters', async () => {
    mockPrisma.question.findMany.mockResolvedValue([]);
    await QuestionDBAccess.findQuestions({
      topicId: 't1',
      difficulty: 3,
      count: 2,
      excludeIds: ['q1'],
    });
    expect(mockPrisma.question.findMany).toHaveBeenCalledWith({
      where: {
        topicId: 't1',
        difficulty: 3,
        id: { notIn: ['q1'] },
      },
      take: 2,
      orderBy: { id: 'asc' },
    });
  });
});

describe('findById', () => {
  it('delegates to findUnique', async () => {
    mockPrisma.question.findUnique.mockResolvedValue(null);
    const result = await QuestionDBAccess.findById('q1');
    expect(mockPrisma.question.findUnique).toHaveBeenCalledWith({
      where: { id: 'q1' },
    });
    expect(result).toBeNull();
  });
});

describe('createTopic', () => {
  it('creates a topic with the given name', async () => {
    mockPrisma.topic.create.mockResolvedValue({ id: 't1', name: 'Algebra' });
    await QuestionDBAccess.createTopic('Algebra');
    expect(mockPrisma.topic.create).toHaveBeenCalledWith({
      data: { name: 'Algebra' },
    });
  });
});

describe('createQuestion', () => {
  it('creates a question with all fields', async () => {
    const data = {
      topicId: 't1',
      text: 'What is 2+2?',
      answer: '4',
      hint: 'Count on your fingers',
      explanation: 'Two plus two equals four.',
      difficulty: 1,
    };
    mockPrisma.question.create.mockResolvedValue({ id: 'q1', ...data });
    await QuestionDBAccess.createQuestion(data);
    expect(mockPrisma.question.create).toHaveBeenCalledWith({ data });
  });
});
