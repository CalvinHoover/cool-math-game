'use client';

import { useRouter } from 'next/navigation';
import './Dashboard.css';

export default function Dashboard() {
  const router = useRouter();

  return (
    <div className="app-container">
      <h1 className="main-title">World of Math</h1>
      
      <div className="button-group">
        <button className="btn-profile" onClick={() => console.log('Profile button clicked')}>
          Profile
        </button>
        <button className="btn-practice" onClick={() => router.push('/practice')}>
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
      </div>
    </div>
  );
}