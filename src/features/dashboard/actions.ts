'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/features/auth/session';
import { getGlobalLevel } from '@/features/xp/leveling';

type ActionError = { ok: false; error: string };

type DashboardStatsResult =
  | ActionError
  | {
      ok: true;
      totalXp: number;
      globalLevel: number;
      currentLevelXp: number;
      nextLevelXp: number;
      practiceSessionsCompleted: number;
      topicsStarted: number;
    };

export async function getDashboardStats(): Promise<any> {
  const session = await getSession();
  if (!session) {
    return { ok: false, error: 'unauthorized' };
  }

  const userTopics = await prisma.userTopic.findMany({
    where: { userId: session.id },
    select: { xp: true, level: true },
  });

  const globalLevelInfo = getGlobalLevel(userTopics);

  const sessionsCompleted = await prisma.practiceSession.count({
    where: { userId: session.id, completed: true },
  });

  return {
    ok: true,
    totalXp: userTopics.reduce((sum, t) => sum + t.xp, 0),
    globalLevel: globalLevelInfo.level,
    currentLevelXp: globalLevelInfo.currentLevelXp,
    nextLevelXp: globalLevelInfo.nextLevelXp,
    practiceSessionsCompleted: sessionsCompleted,
    topicsStarted: userTopics.length,
  };
}

export interface ActivityItem {
  id: string;
  topic: string;
  completedAt: string;
  scorePercent: number;
}

type RecentActivityResult =
  | ActionError
  | {
      ok: true;
      items: ActivityItem[];
    };

export async function getRecentActivity(
  limit = 5
): Promise<RecentActivityResult> {
  const session = await getSession();
  if (!session) {
    return { ok: false, error: 'unauthorized' };
  }

  const sessions = await prisma.practiceSession.findMany({
    where: { userId: session.id, completed: true },
    orderBy: { endedAt: 'desc' },
    take: limit,
    include: {
      questions: {
        include: { question: { select: { difficulty: true, topic: { select: { name: true } } } } },
      },
    },
  });

  const items: ActivityItem[] = sessions.map((s) => {
    const totalPoints = s.questions.reduce(
      (sum, sq) => sum + (sq.question.difficulty || 1),
      0
    );
    const earnedPoints = s.questions.reduce((sum, sq) => {
      if (!sq.correct) return sum;
      const pts = sq.attempts <= 1 ? sq.question.difficulty || 1 : (sq.question.difficulty || 1) / 2;
      return sum + pts;
    }, 0);
    const scorePercent = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

    return {
      id: s.id,
      topic: s.questions[0]?.question.topic.name ?? 'Unknown',
      completedAt: s.endedAt?.toISOString() ?? s.startedAt.toISOString(),
      scorePercent,
    };
  });

  return { ok: true, items };
}
