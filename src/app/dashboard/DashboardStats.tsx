'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface DashboardStatsProps {
  totalXp: number;
  globalLevel: number;
  currentLevelXp: number;
  nextLevelXp: number;
  practiceSessionsCompleted: number;
  topicsStarted: number;
}

export default function DashboardStats({
  totalXp,
  globalLevel,
  currentLevelXp,
  nextLevelXp,
  practiceSessionsCompleted,
  topicsStarted,
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Total XP
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{totalXp}</span>
            <Badge variant="info">Lvl {globalLevel}</Badge>
          </div>
          <div className="mt-3">
            <ProgressBar
              value={currentLevelXp}
              max={nextLevelXp}
              label="Next level"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Topics Started
          </CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-2xl font-bold">{topicsStarted}</span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Practice Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-2xl font-bold">{practiceSessionsCompleted}</span>
        </CardContent>
      </Card>

    </div>
  );
}
