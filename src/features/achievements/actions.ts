'use server';

import { getSession } from '@/features/auth/session';
import { getAchievementStatus, type AchievementStatus } from './engine';

type ActionError = { ok: false; error: string };

type GetMyAchievementsResult =
  | ActionError
  | { ok: true; achievements: AchievementStatus[] };

export async function getMyAchievements(): Promise<GetMyAchievementsResult> {
  const session = await getSession();
  if (!session) {
    return { ok: false, error: 'unauthorized' };
  }

  const achievements = await getAchievementStatus(session.id);
  return { ok: true, achievements };
}
