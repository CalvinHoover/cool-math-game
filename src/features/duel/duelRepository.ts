import { prisma } from '@/lib/prisma';
import type { Match, Question } from '@prisma/client';

export type MatchWithPlayers = Match & {
  player1: { username: string };
  player2: { username: string } | null;
};

export const DuelRepository = {
  async findWaitingMatches(excludeUserId: string): Promise<MatchWithPlayers[]> {
    return prisma.match.findMany({
      where: {
        status: 'waiting',
        player1Id: { not: excludeUserId },
      },
      include: {
        player1: { select: { username: true } },
        player2: { select: { username: true } },
      },
    });
  },

  async createWaitingMatch(player1Id: string): Promise<Match> {
    return prisma.match.create({
      data: {
        player1Id,
        player2Id: player1Id,
        status: 'waiting',
      },
    });
  },

  async joinMatch(matchId: string, player2Id: string): Promise<Match> {
    return prisma.match.update({
      where: { id: matchId },
      data: {
        player2Id,
        status: 'active',
      },
    });
  },

  async findMatch(matchId: string): Promise<MatchWithPlayers | null> {
    return prisma.match.findUnique({
      where: { id: matchId },
      include: {
        player1: { select: { username: true } },
        player2: { select: { username: true } },
      },
    });
  },

  async completeMatch(matchId: string, winnerId: string): Promise<void> {
    await prisma.match.update({
      where: { id: matchId },
      data: {
        winnerId,
        status: 'completed',
        endedAt: new Date(),
      },
    });
  },

  async abandonMatch(matchId: string): Promise<void> {
    await prisma.match.updateMany({
      where: {
        id: matchId,
        status: { in: ['waiting', 'active'] },
      },
      data: { status: 'abandoned' },
    });
  },

  async fetchQuestionByDifficulty(topicId: string, difficulty: number): Promise<Question | null> {
    return prisma.question.findFirst({
      where: {
        topicId,
        difficulty,
      },
      orderBy: { id: 'asc' },
    });
  },
};
