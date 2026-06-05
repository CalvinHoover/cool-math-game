import { config } from 'dotenv';
import { execSync } from 'node:child_process';
import { createConnection } from 'node:net';
import { PrismaClient } from '@prisma/client';
import { seed } from '../../prisma/seed/seed';

function isDbReachable(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = createConnection(port, host);
    socket.on('connect', () => {
      socket.end();
      resolve(true);
    });
    socket.on('error', () => resolve(false));
    socket.setTimeout(3000, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

async function globalSetup() {
  config({ path: '.env.test' });

  const dbReady = await isDbReachable('localhost', 5433);
  if (!dbReady) {
    console.log('Starting test_db container...');
    execSync('docker compose up test_db -d --wait', { stdio: 'inherit' });
  }

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
