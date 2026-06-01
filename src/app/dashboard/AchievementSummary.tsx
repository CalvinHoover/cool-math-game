'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { AchievementSummaryItem } from '@/features/dashboard/actions';

interface AchievementSummaryProps {
  totalEarned: number;
  total: number;
  recentlyUnlocked: AchievementSummaryItem[];
}

export default function AchievementSummary({
  totalEarned,
  total,
  recentlyUnlocked,
}: AchievementSummaryProps) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">
          Achievements — {totalEarned} / {total} Unlocked
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentlyUnlocked.length > 0 ? (
          <ul className="space-y-2">
            {recentlyUnlocked.map((item) => (
              <li key={item.name} className="flex items-center gap-3">
                <span className={`h-3 w-3 rounded-full ${item.color}`} />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {item.name}
                </span>
                <span className="ml-auto text-xs text-gray-500">
                  {item.earnedAt.toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No achievements unlocked yet. Complete practice sessions to earn badges!
          </p>
        )}
        <Link
          href="/achievements"
          className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          View All →
        </Link>
      </CardContent>
    </Card>
  );
}
