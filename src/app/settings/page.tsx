'use client';

import { useRouter } from 'next/navigation';
import '../dashboard/Dashboard.css'; 

export default function Settings() {
  const router = useRouter();

  return (
    <div className="app-container">
      <h1 className="main-title">Settings</h1>
      
      <div className="button-group">
        <button className="btn-practice" onClick={() => console.log('Audio changed')}>
          Audio
        </button>
        <button className="btn-multiplayer" onClick={() => console.log('Difficulty changed')}>
          Difficulty
        </button>
        <button className="btn-settings" onClick={() => router.push('/dashboard')}>
          Back to Menu
        </button>
      </div>
    </div>
  );
}