import { redirect } from 'next/navigation';
import { getSession } from '@/features/auth/session';
import { getDashboardStats, getRecentActivity } from '@/features/dashboard/actions';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const statsResult = await getDashboardStats();
  const activityResult = await getRecentActivity();

  const stats = statsResult.ok ? statsResult : null;
  const activity = activityResult.ok ? activityResult.items : [];

  return (
    <DashboardClient
      username={session.username}
      stats={stats}
      activity={activity}
    />
  );
}
