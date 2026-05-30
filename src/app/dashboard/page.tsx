import { redirect } from 'next/navigation';
import { getSession } from '@/features/auth/session';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  return <DashboardClient username={session.username} />;
}
