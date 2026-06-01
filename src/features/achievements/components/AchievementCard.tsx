import { cn } from '@/lib/utils';

interface AchievementCardProps {
  name: string;
  description: string;
  color: string;
  earned: boolean;
  earnedAt?: Date;
}

export function AchievementCard({
  name,
  description,
  color,
  earned,
  earnedAt,
}: AchievementCardProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-4 rounded-lg border p-4 transition-opacity',
        earned
          ? 'bg-white opacity-100 dark:border-gray-700 dark:bg-gray-900'
          : 'bg-gray-50 opacity-60 dark:border-gray-800 dark:bg-gray-950'
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white',
          earned ? color : 'bg-gray-400'
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {earned ? (
            <>
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </>
          ) : (
            <>
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <line x1="9" x2="15" y1="15" y2="9" />
              <line x1="9" x2="15" y1="9" y2="15" />
            </>
          )}
        </svg>
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          {name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
        {earned && earnedAt && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
            Unlocked {earnedAt.toLocaleDateString()}
          </p>
        )}
      </div>
      <span
        className={cn(
          'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium',
          earned
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
        )}
      >
        {earned ? 'Unlocked' : 'Locked'}
      </span>
    </div>
  );
}
