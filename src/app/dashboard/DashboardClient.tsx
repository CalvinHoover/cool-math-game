'use client';

import { useRouter } from 'next/navigation';
import { MenuButton } from '../../components/interface/MenuButton';
import DashboardStats from './DashboardStats';
import RecentActivity from './RecentActivity';
import AchievementSummary from './AchievementSummary';
import type { ActivityItem } from '@/features/dashboard/actions';
import './Dashboard.css';

interface DashboardClientProps {
  username: string;
  stats: {
    totalXp: number;
    globalLevel: number;
    currentLevelXp: number;
    nextLevelXp: number;
    practiceSessionsCompleted: number;
    topicsStarted: number;
  } | null;
  activity: ActivityItem[];
  achievements: {
    totalEarned: number;
    total: number;
    recentlyUnlocked: { name: string; color: string; earnedAt: Date }[];
  } | null;
}

export default function DashboardClient({ username, stats, activity, achievements }: DashboardClientProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <div className="app-container">
      <h1 className="main-title">World of Math</h1>
      <p className="welcome-msg">Welcome, {username}!</p>

      {stats && <DashboardStats {...stats} />}

      <div className="button-group">
        <MenuButton label="Profile" className="btn-profile" onClick={() => router.push('/profile')} />
        <MenuButton label="Practice" className="btn-practice" onClick={() => router.push('/practice')} />
        <MenuButton label="Multiplayer" className="btn-multiplayer" onClick={() => router.push('/duel')} />
        <MenuButton label="Leaderboard" className="btn-leaderboard" onClick={() => alert('Leaderboard coming soon!')} />
        <MenuButton label="Settings" className="btn-settings" onClick={() => router.push('/settings')} />
        <MenuButton label="Logout" className="btn-logout" onClick={handleLogout} />
      </div>

      {achievements && (
        <AchievementSummary
          totalEarned={achievements.totalEarned}
          total={achievements.total}
          recentlyUnlocked={achievements.recentlyUnlocked}
        />
      )}
      <RecentActivity items={activity} />
    </div>
  );
}
