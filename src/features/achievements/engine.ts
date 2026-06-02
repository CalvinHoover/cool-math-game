/*
[GenAI Use] Prompt: "I need an achievement unlock engine that does not talk to Prisma directly. It should receive plain data about user progress and evaluate 5 badge conditions. Suggest a plan for a TypeScript file that does this."
[GenAI Use] LLM Response Start
Plan:
- export interface UserProgressSnapshot { totalCompletedSessions: number; userTopics: { topicId: string; level: number }[]; currentSessionScorePercent?: number; } -- read-only data passed in from the caller.
- export interface AchievementStatus extends AchievementDefinition { earned: boolean; earnedAt?: Date; } -- badge definition plus an earned flag for the UI.
- export interface NewlyUnlocked { slug: string; name: string; color: string; } -- lightweight result when a badge is first awarded.
- function evaluateCondition(def: AchievementDefinition, snapshot: UserProgressSnapshot): boolean -- switch on the badge slug to check if the snapshot meets the threshold.
- export async function checkAndAwardAchievements(userId: string, snapshot: UserProgressSnapshot): Promise<{ newlyUnlocked: NewlyUnlocked[] }> -- fetches all definitions and current earned badges in parallel, skips already earned ones, evaluates each remaining condition, and calls the repository to award new badges.
- export async function getAchievementStatus(userId: string): Promise<AchievementStatus[]> -- returns every badge definition with an earned flag by looking up dates in a Map. The engine never touches Prisma; all persistence goes through the repository layer.
[GenAI Use] LLM Response End
[GenAI Use] Reflection: I implemented the plan and renamed some variables to match my project. Using a snapshot keeps the engine testable without a real database.
*/

import { ACHIEVEMENTS, type AchievementDefinition } from './definitions';
import { getUserAchievements, awardAchievement, getAllAchievements } from './repository';

export interface UserProgressSnapshot {
  totalCompletedSessions: number;
  userTopics: { topicId: string; level: number }[];
  currentSessionScorePercent?: number;
}

export interface AchievementStatus extends AchievementDefinition {
  earned: boolean;
  earnedAt?: Date;
}

export interface NewlyUnlocked {
  slug: string;
  name: string;
  color: string;
}

function evaluateCondition(
  def: AchievementDefinition,
  snapshot: UserProgressSnapshot
): boolean {
  switch (def.slug) {
    case 'first-steps':
      return snapshot.totalCompletedSessions >= 1;
    case 'dedicated-learner':
      return snapshot.totalCompletedSessions >= 10;
    case 'rising-star':
      return snapshot.userTopics.some((t) => t.level >= 5);
    case 'jack-of-all-trades':
      return snapshot.userTopics.length >= 3;
    case 'perfectionist':
      return snapshot.currentSessionScorePercent === 100;
    default:
      return false;
  }
}

export async function checkAndAwardAchievements(
  userId: string,
  snapshot: UserProgressSnapshot
): Promise<{ newlyUnlocked: NewlyUnlocked[] }> {
  const [allAchievements, userAchievements] = await Promise.all([
    getAllAchievements(),
    getUserAchievements(userId),
  ]);
  const earnedNames = new Set(userAchievements.map((ua) => ua.achievement.name));
  const achievementMap = new Map(allAchievements.map((a) => [a.name, a.id]));

  const newlyUnlocked: NewlyUnlocked[] = [];

  for (const def of ACHIEVEMENTS) {
    if (earnedNames.has(def.name)) continue;

    const dbAchievementId = achievementMap.get(def.name);
    if (!dbAchievementId) continue;

    if (evaluateCondition(def, snapshot)) {
      const awarded = await awardAchievement(userId, dbAchievementId);
      if (awarded) {
        newlyUnlocked.push({
          slug: def.slug,
          name: def.name,
          color: def.color,
        });
      }
    }
  }

  return { newlyUnlocked };
}

export async function getAchievementStatus(
  userId: string
): Promise<AchievementStatus[]> {
  const userAchievements = await getUserAchievements(userId);

  const earnedMap = new Map(
    userAchievements.map((ua) => [ua.achievement.name, ua.earnedAt])
  );

  return ACHIEVEMENTS.map((def) => {
    const earnedAt = earnedMap.get(def.name);
    return {
      ...def,
      earned: earnedAt !== undefined,
      earnedAt: earnedAt ?? undefined,
    };
  });
}
