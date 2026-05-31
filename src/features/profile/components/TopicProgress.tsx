import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { TopicProgressItem } from '@/features/profile/actions';

interface TopicProgressProps {
  topics: TopicProgressItem[];
}

export default function TopicProgress({ topics }: TopicProgressProps) {
  return (
    <section className="mt-6">
      <h2 className="mb-4 text-xl font-semibold">Topic Progress</h2>
      {topics.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No topics started yet. Begin a practice session!
        </p>
      ) : (
        <div className="space-y-3">
          {topics.map((topic) => (
            <Card key={topic.topicName}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{topic.topicName}</CardTitle>
                  <Badge variant="info">Lvl {topic.level}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {(() => {
                  const total = topic.nextLevelXp ?? 1;
                  const percent = total ? Math.round((topic.currentLevelXp / total) * 100) : 0;
                  return (
                    <ProgressBar
                      value={topic.currentLevelXp}
                      max={topic.nextLevelXp}
                      label={`${topic.xp} XP (${percent}%)`}
                    />
                  );
                })()}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
