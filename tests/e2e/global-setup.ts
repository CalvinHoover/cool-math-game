import { config } from 'dotenv';
import { execSync } from 'node:child_process';
import { PrismaClient } from '@prisma/client';
import { seed } from '../../prisma/seed/seed';

async function globalSetup() {
  config({ path: '.env.test' });

  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL! },
  });

  const prisma = new PrismaClient();
  try {
    await seed(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

export default globalSetup;
