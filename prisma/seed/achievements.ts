import type { PrismaClient } from '@prisma/client';

export const ACHIEVEMENT_SEEDS = [
  {
    name: 'First Steps',
    description: 'Complete your first practice session',
    xpReward: 0,
  },
  {
    name: 'Dedicated Learner',
    description: 'Complete 10 practice sessions',
    xpReward: 0,
  },
  {
    name: 'Rising Star',
    description: 'Reach level 5 in any topic',
    xpReward: 0,
  },
  {
    name: 'Jack of All Trades',
    description: 'Practice in 3 different topics',
    xpReward: 0,
  },
  {
    name: 'Perfectionist',
    description: 'Score 100% on a practice session',
    xpReward: 0,
  },
];

export async function seedAchievements(prisma: PrismaClient) {
  for (const achievement of ACHIEVEMENT_SEEDS) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      create: achievement,
      update: {},
    });
  }

  console.log(`Seeded ${ACHIEVEMENT_SEEDS.length} achievements.`);
}
