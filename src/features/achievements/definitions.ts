// [GenAI Use] Prompt: "I need a single place that defines all achievement badges with their colors and descriptions. Write a TypeScript file that exports an interface and a hardcoded array of 5 badges."
// [GenAI Use] LLM Response Start
export interface AchievementDefinition {
  slug: string;
  name: string;
  description: string;
  color: string;
  iconName: string;
}

// hardcodes the five badge definitions so the engine and UI stay in sync
export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    slug: 'first-steps',
    name: 'First Steps',
    description: 'Complete your first practice session',
    color: 'bg-green-500',
    iconName: 'footprints',
  },
  {
    slug: 'dedicated-learner',
    name: 'Dedicated Learner',
    description: 'Complete 10 practice sessions',
    color: 'bg-blue-500',
    iconName: 'book-open',
  },
  {
    slug: 'rising-star',
    name: 'Rising Star',
    description: 'Reach level 5 in any topic',
    color: 'bg-purple-500',
    iconName: 'star',
  },
  {
    slug: 'jack-of-all-trades',
    name: 'Jack of All Trades',
    description: 'Practice in 3 different topics',
    color: 'bg-orange-500',
    iconName: 'puzzle',
  },
  {
    slug: 'perfectionist',
    name: 'Perfectionist',
    description: 'Score 100% on a practice session',
    color: 'bg-pink-500',
    iconName: 'check-circle',
  },
];
// [GenAI Use] LLM Response End
// [GenAI Use] Reflection: I picked the Tailwind color classes myself. Keeping this array in one file means the engine and UI both stay in sync automatically.
