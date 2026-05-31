'use client';

import { useRouter } from 'next/navigation';
import { MenuButton } from '../../components/interface/MenuButton';
import DuelBoard from '../../features/duel/components/DuelBoard';
import '../dashboard/Dashboard.css';
import { useState } from 'react';

export default function Duel() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);

  if (isPlaying) {
    return <DuelBoard />;
  }
  
  return (
    <div className="app-container">
      <h1 className="main-title">Math Duels!</h1>
      
      <div className="button-group">
        <MenuButton 
          label="Begin Game" 
          onClick={() => setIsPlaying(true)}
          className="btn-profile" 
        />
        <MenuButton 
          label="Back to Menu" 
          onClick={() => router.push('/dashboard')} 
          className="btn-settings" 
        />
      </div>
    </div>
  );
}