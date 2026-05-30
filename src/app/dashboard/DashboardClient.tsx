'use client';

import { useRouter } from 'next/navigation';
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
        <button className="btn-profile" onClick={() => console.log('Profile button clicked')}>
          Profile
        </button>
        <button className="btn-practice" onClick={() => console.log('Practice button clicked')}>
          Practice
        </button>
        <button className="btn-multiplayer" onClick={() => console.log('Multiplayer button clicked')}>
          Multiplayer
        </button>
        <button className="btn-leaderboard" onClick={() => console.log('Leaderboard button clicked')}>
          Leaderboard
        </button>
        <button className="btn-settings" onClick={() => router.push('/settings')}>
          Settings
        </button>
        <button className="btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
