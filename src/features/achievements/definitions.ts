export interface AchievementDefinition {
  slug: string;
  name: string;
  description: string;
  color: string;
  iconName: string;
}

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
