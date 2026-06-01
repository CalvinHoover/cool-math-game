import { redirect } from 'next/navigation';
import { getSession } from '@/features/auth/session';
import { getAchievementStatus } from '@/features/achievements/engine';
import { AchievementGrid } from '@/features/achievements/components/AchievementGrid';

export default async function AchievementsPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const achievements = await getAchievementStatus(session.id);

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-gray-100">
        Achievements
      </h1>
      <p className="mb-8 text-gray-600 dark:text-gray-400">
        Complete challenges to unlock badges and show off your math skills!
      </p>
      <AchievementGrid achievements={achievements} />
    </main>
  );
}
