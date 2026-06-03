import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

async function globalTeardown() {
  config({ path: '.env.test' });

  const prisma = new PrismaClient();
  try {
    await prisma.$transaction([
      prisma.sessionQuestion.deleteMany(),
      prisma.practiceSession.deleteMany(),
      prisma.userAchievement.deleteMany(),
      prisma.userTopic.deleteMany(),
      prisma.friendship.deleteMany(),
      prisma.match.deleteMany(),
      prisma.user.deleteMany(),
    ]);
    console.log('Test database cleaned.');
  } finally {
    await prisma.$disconnect();
  }
}

export default globalTeardown;
