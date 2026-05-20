import { prisma } from '@/lib/prisma';
import type { User } from '@prisma/client';

export const AuthDBAccess = {
  // looks up a user by email so login can verify credentials before hashing
  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  // checks both fields during registration so duplicates are caught early
  async findUserByEmailOrUsername(
    email: string,
    username: string
  ): Promise<User | null> {
    return prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
  },

  async createUser(data: {
    username: string;
    email: string;
    password: string;
  }): Promise<User> {
    return prisma.user.create({ data });
  },
};
