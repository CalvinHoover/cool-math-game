import { PrismaClient } from "@prisma/client";
//this file basically just checks to see if there is a connection between the backend
//and prisma and then if there isnt one, then it makes one.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
