/*
[GenAI Use] Prompt: "I need a simple leveling system. 100 XP per level. Given an XP total, return the level, current XP within the level, and next level threshold. Also a global level function that sums XP across all topics. Write me a plan for pure functions with no side effects."
[GenAI Use] LLM Response Start
Plan:
- export interface LevelInfo { level: number; currentLevelXp: number; nextLevelXp: number; progressPercent: number; } -- the shape returned by both level functions so the UI can display progress bars.
- export function getLevel(xp: number): LevelInfo -- converts an XP total into a level using floor division and modulo, keeping the math isolated from any database or React code.
- export function getGlobalLevel(userTopics: { xp: number }[]): LevelInfo -- sums XP across every topic the user has practiced in and then delegates to getLevel for the result.
[GenAI Use] LLM Response End
[GenAI Use] Reflection: The formula is trivial but I kept it isolated so I can change the curve later without touching any UI or database code. Currently linear but easy to swap.
*/

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
