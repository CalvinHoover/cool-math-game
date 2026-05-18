'use client';

import { useRouter } from 'next/navigation';
import { MenuButton } from '../../components/interface/MenuButton';
import './Dashboard.css';

export default function Dashboard() {
  const router = useRouter();
  return (
    <div className="app-container">
      <h1 className="main-title">World of Math</h1>
      
      <div className="button-group">
        <MenuButton 
          label="Profile" 
          onClick={() => console.log('Profile clicked')} 
          className="btn-profile" 
        />
        <MenuButton 
          label="Practice" 
          onClick={() => console.log('Practice clicked')} 
          className="btn-practice" 
        />
        <MenuButton 
          label="Multiplayer" 
          onClick={() => router.push('/duel')} 
          className="btn-multiplayer" 
        />
        <MenuButton 
          label="Leaderboard" 
          onClick={() => console.log('Leaderboard clicked')} 
          className="btn-leaderboard" 
        />
        <MenuButton 
          label="Settings" 
          onClick={() => router.push('/settings')} 
          className="btn-settings" 
        />
      </div>
    </div>
  );
}