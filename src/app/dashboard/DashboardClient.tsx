'use client';

import { useRouter } from 'next/navigation';
import { MenuButton } from '../../components/interface/MenuButton';
import './Dashboard.css';

export default function DashboardClient({ username }: { username: string }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <div className="app-container">
      <h1 className="main-title">World of Math</h1>
      <p className="welcome-msg">Welcome, {username}!</p>

      <div className="button-group">
        <MenuButton label="Profile" className="btn-profile" onClick={() => console.log('Profile button clicked')} />
        <MenuButton label="Practice" className="btn-practice" onClick={() => console.log('Practice button clicked')} />
        <MenuButton label="Multiplayer" className="btn-multiplayer" onClick={() => router.push('/duel')} />
        <MenuButton label="Leaderboard" className="btn-leaderboard" onClick={() => router.push('/leaderboard')} />
        <MenuButton label="Settings" className="btn-settings" onClick={() => router.push('/settings')} />
        <MenuButton label="Logout" className="btn-logout" onClick={handleLogout} />
      </div>
    </div>
  );
}
