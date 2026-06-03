'use client';

import { useRouter } from 'next/navigation';
import { MenuButton } from '../../components/interface/MenuButton';
import DuelBoard from '../../features/duel/components/DuelBoard';
import '../dashboard/Dashboard.css';
import { useState } from 'react';

export default function Duel() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [winner, setWinner] = useState<null | 'player' | 'opponent'>(null);

  // Displays game over screen when a winner is determined, with an option to return to the main menu. 
  // The winner is determined by the DuelBoard component, which calls the onGameOver function passed as a prop.
  if (winner) {
    return (
      <div className="app-container">
        <h1 className="main-title">You {winner === 'player' ? 'win!' : 'lose!'}</h1>
        
        <div className="button-group">
          <MenuButton 
            label="Play Again" 
            onClick={() => {setWinner(null); setIsPlaying(true);}}
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

  // Displays the DuelBoard component when the game is active. The DuelBoard component handles the main gameplay.
  if (isPlaying) {
    return <DuelBoard onGameOver={(result) => setWinner(result)} />;
  }
  
  // Otherwise, displays the main menu with options to start the game or return to the dashboard.
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