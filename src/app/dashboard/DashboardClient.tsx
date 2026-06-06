'use client';

import { useRouter } from 'next/navigation';
import { MenuButton } from '../../components/interface/MenuButton';
import RecentActivity from './RecentActivity';
import type { ActivityItem } from '@/features/dashboard/actions';
import './Dashboard.css';

interface DashboardClientProps {
  username: string;
  stats: {
    totalXp: number;
    globalLevel: number;
    practiceSessionsCompleted: number;
    topicsStarted: number;
  } | null;
  activity: ActivityItem[];
}

export default function DashboardClient({ username, stats, activity }: DashboardClientProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <div className="app-container" style={{ justifyContent: 'flex-start', paddingTop: '40px' }}>
      <h1 className="main-title">Cool Math Game</h1>
      <p className="welcome-msg">Welcome, {username}!</p>

      {stats && (
        <p style={{ fontFamily: 'Courier New', color: '#AAAAAA', fontSize: '0.85rem', marginBottom: '24px' }}>
          Level {stats.globalLevel} &nbsp;·&nbsp; {stats.totalXp} XP &nbsp;·&nbsp; {stats.practiceSessionsCompleted} sessions &nbsp;·&nbsp; {stats.topicsStarted} topics
        </p>
      )}

      <div style={{ display: 'flex', gap: '40px', width: '100%', maxWidth: '760px', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <RecentActivity items={activity} />
        </div>

        <div className="button-group" style={{ flexShrink: 0, width: '200px' }}>
          <MenuButton label="Profile" className="retro-button btn-profile" onClick={() => router.push('/profile')} />
          <MenuButton label="Practice" className="retro-button btn-practice" onClick={() => router.push('/practice')} />
          <MenuButton label="Friends" className="retro-button btn-multiplayer" onClick={() => router.push('/friends')} />
          <MenuButton label="Multiplayer" className="retro-button btn-multiplayer" onClick={() => router.push('/duel')} />
          <MenuButton label="Leaderboard" className="retro-button btn-leaderboard" onClick={() => router.push('/leaderboard')} />
          <MenuButton label="Settings" className="retro-button btn-settings" onClick={() => router.push('/settings')} />
          <MenuButton label="Logout" className="retro-button btn-logout" onClick={handleLogout} />
        </div>
      </div>
    </div>
  );
}
