export interface LevelInfo {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
}

const XP_PER_LEVEL = 100;

export function getLevel(xp: number): LevelInfo {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const currentLevelXp = xp % XP_PER_LEVEL;
  const nextLevelXp = XP_PER_LEVEL;
  const progressPercent = currentLevelXp;

  return {
    level,
    currentLevelXp,
    nextLevelXp,
    progressPercent,
  };
}

export function getGlobalLevel(userTopics: { xp: number }[]): LevelInfo {
  const totalXp = userTopics.reduce((sum, t) => sum + t.xp, 0);
  return getLevel(totalXp);
}
