import { PrismaClient } from '@prisma/client';
import { seed } from './seed';

const prisma = new PrismaClient();

seed(prisma)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
