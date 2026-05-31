'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/features/auth/session';
import { getGlobalLevel, getLevel } from '@/features/xp/leveling';

export interface TopicProgressItem {
  topicName: string;
  xp: number;
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
}

export interface ProfileData {
  username: string;
  email: string;
  totalXp: number;
  globalLevel: number;
  currentLevelXp: number;
  nextLevelXp: number;
  practiceSessionsCompleted: number;
  topics: TopicProgressItem[];
}

export async function getProfileData(): Promise<
  | { ok: false; error: string }
  | { ok: true; data: ProfileData }
> {
  const session = await getSession();
  if (!session) {
    return { ok: false, error: 'unauthorized' };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { username: true, email: true },
  });

  if (!user) {
    return { ok: false, error: 'not-found' };
  }

  const userTopics = await prisma.userTopic.findMany({
    where: { userId: session.id },
    include: { topic: true },
    orderBy: { xp: 'desc' },
  });

  const globalLevelInfo = getGlobalLevel(userTopics);

  const sessionsCompleted = await prisma.practiceSession.count({
    where: { userId: session.id, completed: true },
  });

  const topics: TopicProgressItem[] = userTopics.map((ut) => {
    const levelInfo = getLevel(ut.xp);
    return {
      topicName: ut.topic.name,
      xp: ut.xp,
      level: ut.level,
      currentLevelXp: levelInfo.currentLevelXp,
      nextLevelXp: levelInfo.nextLevelXp,
    };
  });

  return {
    ok: true,
    data: {
      username: user.username,
      email: user.email,
      totalXp: globalLevelInfo.currentLevelXp + (globalLevelInfo.level - 1) * 100,
      globalLevel: globalLevelInfo.level,
      currentLevelXp: globalLevelInfo.currentLevelXp,
      nextLevelXp: globalLevelInfo.nextLevelXp,
      practiceSessionsCompleted: sessionsCompleted,
      topics,
    },
  };
}
