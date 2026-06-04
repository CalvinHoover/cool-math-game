import { prisma } from '@/lib/prisma';

export async function getAllAchievements() {
  return prisma.achievement.findMany({
    orderBy: { name: 'asc' },
  });
}

export async function getUserAchievements(userId: string) {
  return prisma.userAchievement.findMany({
    where: { userId },
    include: { achievement: true },
    orderBy: { earnedAt: 'desc' },
  });
}

export async function awardAchievement(userId: string, achievementId: string) {
  try {
    await prisma.userAchievement.create({
      data: { userId, achievementId },
    });
    return true;
  } catch {
    return false;
  }
}
