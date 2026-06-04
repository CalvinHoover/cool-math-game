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
